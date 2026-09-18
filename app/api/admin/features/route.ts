import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_PRESETS,
} from '../../../../lib/feature-flags.ts';
import type {
  FeatureFlags,
  FeatureFlagKey,
  FeaturePreset,
} from '../../../../lib/feature-flags.ts';

// In-memory server-side feature flags state
let serverFeatureFlags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };

export async function GET() {
  return Response.json({
    success: true,
    flags: serverFeatureFlags,
    presets: Object.keys(FEATURE_PRESETS),
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

    // 1. Handle preset selection
    if (typeof body.preset === 'string' && body.preset in FEATURE_PRESETS) {
      const presetName = body.preset as FeaturePreset;
      serverFeatureFlags = { ...FEATURE_PRESETS[presetName].flags };
      return Response.json({
        success: true,
        message: `Applied preset: ${presetName}`,
        flags: serverFeatureFlags,
      });
    }

    // 2. Handle partial or full flag updates
    if (body.flags && typeof body.flags === 'object') {
      const updated: Record<string, boolean> = { ...serverFeatureFlags };
      for (const key of Object.keys(DEFAULT_FEATURE_FLAGS) as FeatureFlagKey[]) {
        if (typeof body.flags[key] === 'boolean') {
          updated[key] = body.flags[key];
        }
      }
      serverFeatureFlags = (updated as unknown) as FeatureFlags;
      return Response.json({
        success: true,
        message: 'Updated feature flags successfully',
        flags: serverFeatureFlags,
      });
    }

    // 3. Reset defaults
    if (body.reset === true) {
      serverFeatureFlags = { ...DEFAULT_FEATURE_FLAGS };
      return Response.json({
        success: true,
        message: 'Reset to default feature flags',
        flags: serverFeatureFlags,
      });
    }

    return Response.json({ success: false, error: 'No valid flags, preset, or reset parameter provided' }, { status: 400 });
  } catch (err: any) {
    return Response.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
