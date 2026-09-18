import pg from 'pg';
import type { FeatureFlags } from './feature-flags.ts';
import { DEFAULT_FEATURE_FLAGS } from './feature-flags.ts';
import {
  KNOWN_TRUSTED_VENDORS,
  getVendorBySlug,
  normalizeVendorQuery,
  type VendorTrustRecord,
} from './vendor-trust.ts';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let migrationPromise: Promise<boolean> | null = null;
let isConnected = false;

// In-memory fallback stores for offline/dev/test execution
let inMemoryFeatureFlags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };
const inMemoryReports: Array<{
  id: number;
  type: string;
  blinded_token: string;
  country: string;
  created_at: string;
}> = [];

/**
 * Initializes the PostgreSQL pool if DATABASE_URL is configured
 */
export function getDbPool(): pg.Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  try {
    const isInternal =
      connectionString.includes('.railway.internal') ||
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1');

    pool = new Pool({
      connectionString,
      ssl: isInternal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.warn('[SHOMAR DB] Unexpected pool error (falling back to memory):', err.message);
      isConnected = false;
    });

    return pool;
  } catch (err: any) {
    console.warn('[SHOMAR DB] Failed to create pool (falling back to memory):', err.message);
    pool = null;
    return null;
  }
}

/**
 * Ensures required database schema tables exist idempotently
 */
export async function ensureMigrations(): Promise<boolean> {
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    const db = getDbPool();
    if (!db) {
      return false;
    }

    try {
      const client = await db.connect();
      try {
        await client.query('BEGIN');

        // 1. Feature flags table
        await client.query(`
          CREATE TABLE IF NOT EXISTS shomar_feature_flags (
            id VARCHAR(64) PRIMARY KEY,
            flags JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `);

        // 2. Blinded zero-knowledge threat reports
        await client.query(`
          CREATE TABLE IF NOT EXISTS shomar_threat_reports (
            id SERIAL PRIMARY KEY,
            type VARCHAR(32) NOT NULL,
            blinded_token VARCHAR(64) NOT NULL,
            country VARCHAR(64) DEFAULT 'Regional',
            zero_knowledge BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_threat_token ON shomar_threat_reports (blinded_token);
        `);

        // 3. Verified vendors registry
        await client.query(`
          CREATE TABLE IF NOT EXISTS shomar_verified_vendors (
            slug VARCHAR(64) PRIMARY KEY,
            business_name VARCHAR(256) NOT NULL,
            category VARCHAR(64),
            country VARCHAR(64),
            trust_score INT DEFAULT 95,
            verification_tier VARCHAR(32) DEFAULT 'tier-3',
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `);

        // 4. Platform audit logs
        await client.query(`
          CREATE TABLE IF NOT EXISTS shomar_audit_logs (
            id SERIAL PRIMARY KEY,
            action VARCHAR(64) NOT NULL,
            actor VARCHAR(64) DEFAULT 'admin',
            details JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `);

        // Pre-seed feature flags row if empty
        const flagRes = await client.query('SELECT id FROM shomar_feature_flags WHERE id = $1', ['active']);
        if (flagRes.rowCount === 0) {
          await client.query(
            'INSERT INTO shomar_feature_flags (id, flags, updated_at) VALUES ($1, $2, NOW())',
            ['active', JSON.stringify(DEFAULT_FEATURE_FLAGS)]
          );
        }

        // Pre-seed known vendors into database if empty
        for (const vendor of KNOWN_TRUSTED_VENDORS) {
          const slug = normalizeVendorQuery(vendor.handle);
          await client.query(`
            INSERT INTO shomar_verified_vendors (slug, business_name, category, country, trust_score, verification_tier, data)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (slug) DO NOTHING;
          `, [
            slug,
            vendor.businessName,
            vendor.category,
            vendor.country,
            vendor.trustScore,
            vendor.tierLabel,
            JSON.stringify(vendor),
          ]);
        }

        await client.query('COMMIT');
        isConnected = true;
        console.log('[SHOMAR DB] Schema verified and database migrations applied successfully.');
        return true;
      } catch (migrationErr: any) {
        await client.query('ROLLBACK');
        console.warn('[SHOMAR DB] Migration transaction rolled back:', migrationErr.message);
        return false;
      } finally {
        client.release();
      }
    } catch (connectErr: any) {
      console.warn('[SHOMAR DB] Database unreachable, continuing with in-memory store:', connectErr.message);
      return false;
    }
  })();

  return migrationPromise;
}

/**
 * Returns whether PostgreSQL is active and connected
 */
export function isDbActive(): boolean {
  return isConnected && !!pool;
}

/**
 * Retrieves platform-wide feature flags (Postgres -> in-memory fallback)
 */
export async function getStoredFeatureFlags(): Promise<FeatureFlags> {
  const db = getDbPool();
  if (!db) {
    return inMemoryFeatureFlags;
  }

  try {
    await ensureMigrations();
    const res = await db.query('SELECT flags FROM shomar_feature_flags WHERE id = $1', ['active']);
    if (res.rows.length > 0 && res.rows[0].flags) {
      const flags = res.rows[0].flags as FeatureFlags;
      inMemoryFeatureFlags = { ...DEFAULT_FEATURE_FLAGS, ...flags };
      return inMemoryFeatureFlags;
    }
  } catch (err: any) {
    console.warn('[SHOMAR DB] getStoredFeatureFlags fallback:', err.message);
  }

  return inMemoryFeatureFlags;
}

/**
 * Persists updated feature flags (Postgres + in-memory sync)
 */
export async function saveStoredFeatureFlags(flags: FeatureFlags): Promise<boolean> {
  inMemoryFeatureFlags = { ...flags };

  const db = getDbPool();
  if (!db) {
    return false;
  }

  try {
    await ensureMigrations();
    await db.query(`
      INSERT INTO shomar_feature_flags (id, flags, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (id) DO UPDATE SET flags = EXCLUDED.flags, updated_at = NOW();
    `, ['active', JSON.stringify(flags)]);
    return true;
  } catch (err: any) {
    console.warn('[SHOMAR DB] saveStoredFeatureFlags fallback:', err.message);
    return false;
  }
}

/**
 * Persists a zero-knowledge blinded threat report
 */
export async function insertThreatReport(
  type: string,
  blindedToken: string,
  country = 'Regional'
): Promise<{ id: number; persisted: boolean }> {
  const db = getDbPool();
  if (!db) {
    const fakeId = inMemoryReports.length + 1;
    inMemoryReports.push({
      id: fakeId,
      type,
      blinded_token: blindedToken,
      country,
      created_at: new Date().toISOString(),
    });
    return { id: fakeId, persisted: false };
  }

  try {
    await ensureMigrations();
    const res = await db.query(`
      INSERT INTO shomar_threat_reports (type, blinded_token, country, zero_knowledge)
      VALUES ($1, $2, $3, true)
      RETURNING id;
    `, [type, blindedToken, country]);

    return { id: res.rows[0].id, persisted: true };
  } catch (err: any) {
    console.warn('[SHOMAR DB] insertThreatReport fallback:', err.message);
    const fakeId = inMemoryReports.length + 1;
    inMemoryReports.push({
      id: fakeId,
      type,
      blinded_token: blindedToken,
      country,
      created_at: new Date().toISOString(),
    });
    return { id: fakeId, persisted: false };
  }
}

/**
 * Returns recent anonymized threat reports count and list
 */
export async function getThreatReports(limit = 20): Promise<{
  totalCount: number;
  reports: Array<{ id: number; type: string; blinded_token: string; country: string; created_at: string }>;
}> {
  const db = getDbPool();
  if (!db) {
    return {
      totalCount: inMemoryReports.length,
      reports: inMemoryReports.slice(-limit).reverse(),
    };
  }

  try {
    await ensureMigrations();
    const countRes = await db.query('SELECT COUNT(*)::int as count FROM shomar_threat_reports');
    const totalCount = countRes.rows[0]?.count || 0;

    const listRes = await db.query(
      'SELECT id, type, blinded_token, country, created_at FROM shomar_threat_reports ORDER BY id DESC LIMIT $1',
      [limit]
    );

    return {
      totalCount,
      reports: listRes.rows,
    };
  } catch (err: any) {
    console.warn('[SHOMAR DB] getThreatReports fallback:', err.message);
    return {
      totalCount: inMemoryReports.length,
      reports: inMemoryReports.slice(-limit).reverse(),
    };
  }
}

/**
 * Retrieves a verified vendor by slug (Postgres -> in-memory fallback)
 */
export async function getStoredVendor(slug: string): Promise<VendorTrustRecord | null> {
  const cleanSlug = normalizeVendorQuery(slug);
  const db = getDbPool();
  if (!db) {
    return getVendorBySlug(cleanSlug) ?? null;
  }

  try {
    await ensureMigrations();
    const res = await db.query('SELECT data FROM shomar_verified_vendors WHERE slug = $1', [cleanSlug]);
    if (res.rows.length > 0 && res.rows[0].data) {
      return res.rows[0].data as VendorTrustRecord;
    }
  } catch (err: any) {
    console.warn('[SHOMAR DB] getStoredVendor fallback:', err.message);
  }

  return getVendorBySlug(cleanSlug) ?? null;
}

/**
 * Records an audit log entry for administrative traceability
 */
export async function logAdminAction(action: string, actor = 'admin', details: Record<string, any> = {}): Promise<void> {
  const db = getDbPool();
  if (!db) return;

  try {
    await ensureMigrations();
    await db.query(
      'INSERT INTO shomar_audit_logs (action, actor, details, created_at) VALUES ($1, $2, $3, NOW())',
      [action, actor, JSON.stringify(details)]
    );
  } catch (err: any) {
    console.warn('[SHOMAR DB] logAdminAction fallback:', err.message);
  }
}
