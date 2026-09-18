import { globalThreatFilter } from '../../../../lib/threat-ledger';

/**
 * POST /api/threats/report
 * Blinded zero-knowledge threat submission.
 * Receives one-way cryptographic tokens (`blnd_...`) so no user phone numbers,
 * bank accounts, or personal identities are ever sent across the wire in plaintext.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, any>;
    const type = body?.type;
    const blindedToken = body?.blindedToken;
    const country = body?.country;

    if (!type || !blindedToken) {
      return Response.json(
        { success: false, error: 'Missing type or blindedToken parameter' },
        { status: 400 }
      );
    }

    if (typeof blindedToken !== 'string' || !blindedToken.startsWith('blnd_')) {
      return Response.json(
        { success: false, error: 'Invalid blinded token format. Must be cryptographic blnd_ hash.' },
        { status: 400 }
      );
    }

    // Add blinded token hash directly into the global Bloom filter ledger
    globalThreatFilter.add(blindedToken);

    return Response.json({
      success: true,
      message: 'Threat token anonymously accepted and registered into pan-African ledger.',
      receiptId: `RCP-${Date.now().toString(36).toUpperCase()}`,
      country: country || 'Regional',
      zeroKnowledge: true,
      persistedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err?.message || 'Report submission failed' }, { status: 500 });
  }
}
