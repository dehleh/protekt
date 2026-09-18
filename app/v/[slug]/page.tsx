import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Building2, MapPin, CheckCircle2, ArrowRight, ExternalLink, PhoneCall, AlertTriangle } from 'lucide-react';
import { getVendorBySlug, KNOWN_TRUSTED_VENDORS } from '@/lib/vendor-trust';
import { getStoredVendor } from '@/lib/db';

export async function generateStaticParams() {
  return KNOWN_TRUSTED_VENDORS.map((v) => ({
    slug: v.handle.replace(/^@/, '').toLowerCase(),
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VendorTrustProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const vendor = (await getStoredVendor(decodedSlug)) || getVendorBySlug(decodedSlug);

  return (
    <main style={{ minHeight: '100vh', background: '#0a0f1d', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        {/* Top Header / Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: '#ffffff' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#365fe9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              🛡️
            </div>
            <div>
              <span style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.05em' }}>SHOMAR</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>TRUST SEAL REGISTRY</span>
            </div>
          </Link>
          <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', borderRadius: '20px', background: 'rgba(54,95,233,0.15)', border: '1px solid rgba(54,95,233,0.3)', color: '#818cf8', fontWeight: 700 }}>
            Official Pan-African Verification
          </span>
        </div>

        {vendor ? (
          /* Verified Vendor Profile Card */
          <div style={{ background: '#111827', borderRadius: '20px', border: '2px solid #16a34a', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(22, 163, 74, 0.2)' }}>
            
            {/* Top Verification Banner */}
            <div style={{ background: 'linear-gradient(135deg, #15803d, #166534)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bbf7d0' }}>
                    VERIFIED SOCIAL MERCHANT
                  </span>
                  <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
                    {vendor.businessName}
                  </h1>
                  <span style={{ fontSize: '0.85rem', color: '#dcfce7', fontWeight: 600 }}>
                    {vendor.handle} · {vendor.category}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                  {vendor.trustScore}
                </div>
                <span style={{ fontSize: '0.68rem', color: '#bbf7d0', fontWeight: 700, textTransform: 'uppercase' }}>
                  Trust Score /100
                </span>
              </div>
            </div>

            {/* Verification Credentials */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: '#1f2937', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                    Business Registration
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={16} color="#818cf8" />
                    {vendor.regNumber}
                  </span>
                </div>

                <div style={{ background: '#1f2937', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                    Fraud Ledger Record
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={16} />
                    0 Fraud Reports ({vendor.successfulOrders}+ Orders)
                  </span>
                </div>
              </div>

              {/* Physical Address Verification */}
              <div style={{ background: '#1f2937', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  Verified Physical Dispatch Address
                </span>
                <span style={{ fontSize: '0.85rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} color="#f87171" />
                  {vendor.physicalAddress}
                </span>
              </div>

              {/* Trust Seal Token & Guarantee */}
              <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'rgba(54,95,233,0.1)', border: '1px solid rgba(54,95,233,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase' }}>
                    Cryptographic Seal Token
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Member since {vendor.memberSince}</span>
                </div>
                <code style={{ fontSize: '0.78rem', color: '#c7d2fe', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {vendor.sealToken}
                </code>
              </div>

              {/* Buyer Protection CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Link
                  href="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '12px',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                  }}
                >
                  <span>Verify Beneficiary Bank Details in SHOMAR</span>
                  <ArrowRight size={18} />
                </Link>

                {vendor.whatsappContact && (
                  <a
                    href={`https://wa.me/${vendor.whatsappContact.replace(/\+/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '12px',
                      background: '#1f2937',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <span>Contact Verified Vendor WhatsApp</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

            </div>

          </div>
        ) : (
          /* Unregistered Profile Placeholder */
          <div style={{ background: '#111827', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(234,179,8,0.15)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <AlertTriangle size={32} />
            </div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
              Unverified Social Merchant Profile
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
              The handle <strong style={{ color: '#ffffff' }}>@{decodedSlug}</strong> is not yet enrolled or verified in the official SHOMAR Trust Seal Registry.
            </p>

            <div style={{ textAlign: 'left', background: '#1f2937', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#d1d5db', lineHeight: 1.6 }}>
              <strong style={{ color: '#eab308', display: 'block', marginBottom: '0.35rem' }}>Buyer Precautions:</strong>
              • Ask the vendor if they support escrow or pay-on-delivery before transferring funds.<br />
              • Check their bank account details on SHOMAR Pre-Transfer Radar before paying.<br />
              • Never send money to personal accounts claiming to be official brand distributors without verification.
            </div>

            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.5rem',
                borderRadius: '12px',
                background: '#365fe9',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              <span>Scan this Vendor on SHOMAR Protect</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          <p style={{ margin: 0 }}>SHOMAR Protect · Pan-African Digital Safety &amp; Trust Infrastructure</p>
          <p style={{ margin: '0.25rem 0 0 0' }}>All pattern checks and verifications operate with zero-knowledge cryptographic hashes.</p>
        </div>

      </div>
    </main>
  );
}
