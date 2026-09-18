import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_PRESETS,
} from '../../../../lib/feature-flags.ts';
import type {
  FeatureFlags,
  FeatureFlagKey,
  FeaturePreset,
} from '../../../../lib/feature-flags.ts';
import {
  getStoredFeatureFlags,
  saveStoredFeatureFlags,
  logAdminAction,
  isDbActive,
} from '../../../../lib/db.ts';

export async function GET() {
  const flags = await getStoredFeatureFlags();

  return Response.json({
    success: true,
    flags,
    presets: Object.keys(FEATURE_PRESETS),
    database: isDbActive() ? 'postgresql-connected' : 'resilient-in-memory',
    updatedAt: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body: any = await req.json();

    if (!body || typeof body !== 'object') {
      return Response.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const currentFlags = await getStoredFeatureFlags();

    // 1. Handle preset selection
    if (typeof body.preset === 'string' && body.preset in FEATURE_PRESETS) {
      const presetName = body.preset as FeaturePreset;
      const newFlags = { ...FEATURE_PRESETS[presetName].flags };
      await saveStoredFeatureFlags(newFlags);
      await logAdminAction('apply_preset', 'admin', { preset: presetName });

      return Response.json({
        success: true,
        message: `Applied preset: ${presetName}`,
        flags: newFlags,
        database: isDbActive() ? 'postgresql-persisted' : 'resilient-in-memory',
      });
    }

    // 2. Handle partial or full flag updates
    if (body.flags && typeof body.flags === 'object') {
      const updated: Record<string, boolean> = { ...currentFlags };
      for (const key of Object.keys(DEFAULT_FEATURE_FLAGS) as FeatureFlagKey[]) {
        if (typeof body.flags[key] === 'boolean') {
          updated[key] = body.flags[key];
        }
      }
      const finalFlags = (updated as unknown) as FeatureFlags;
      await saveStoredFeatureFlags(finalFlags);
      await logAdminAction('update_flags', 'admin', { flags: body.flags });

      return Response.json({
        success: true,
        message: 'Updated feature flags successfully',
        flags: finalFlags,
        database: isDbActive() ? 'postgresql-persisted' : 'resilient-in-memory',
      });
    }

    // 3. Reset defaults
    if (body.reset === true) {
      const resetFlags = { ...DEFAULT_FEATURE_FLAGS };
      await saveStoredFeatureFlags(resetFlags);
      await logAdminAction('reset_flags', 'admin', {});

      return Response.json({
        success: true,
        message: 'Reset to default feature flags',
        flags: resetFlags,
        database: isDbActive() ? 'postgresql-persisted' : 'resilient-in-memory',
      });
    }

    return Response.json({ success: false, error: 'No valid flags, preset, or reset parameter provided' }, { status: 400 });
  } catch (err: any) {
    return Response.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
