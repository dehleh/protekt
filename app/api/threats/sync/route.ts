import { exportLedgerDelta, mergeLedgerDelta } from '../../../../lib/threat-ledger';

/**
 * GET /api/threats/sync
 * Returns the compressed Bloom filter micro-delta bitset (< 10 KB)
 * Allows ultra-low-bandwidth devices to stay updated on emerging regional scam vectors.
 */
export async function GET() {
  try {
    const delta = exportLedgerDelta();
    return Response.json(
      {
        success: true,
        version: delta.version,
        sizeBytes: delta.sizeBytes,
        deltaBase64: delta.deltaBase64,
        syncedAt: new Date().toISOString(),
        networkFootprint: `${(delta.sizeBytes / 1024).toFixed(1)} KB (2G/Edge Compatible)`,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      }
    );
  } catch (err: any) {
    return Response.json({ success: false, error: err?.message || 'Sync failed' }, { status: 500 });
  }
}

/**
 * POST /api/threats/sync
 * Allows peers/gateways to push verified threat delta bitsets to merge via bitwise OR.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, any>;
    const deltaBase64 = body?.deltaBase64;

    if (!deltaBase64 || typeof deltaBase64 !== 'string') {
      return Response.json({ success: false, error: 'Missing deltaBase64 payload' }, { status: 400 });
    }

    const result = mergeLedgerDelta(deltaBase64);
    return Response.json({
      success: result.success,
      newVersion: result.newVersion,
      mergedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err?.message || 'Merge failed' }, { status: 500 });
  }
}
