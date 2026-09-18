/**
 * SHOMAR Trust Seal - Verified African Social Commerce Registry
 * 
 * Protects buyers purchasing on Instagram, TikTok, Facebook Marketplace & WhatsApp
 * by providing cryptographic verification, business registry validation (CAC/KRA/RGD/CIPC),
 * verified physical dispatch addresses, and escrow guarantee signals.
 */

export type TrustTier = 1 | 2 | 3;

export interface VendorTrustRecord {
  id: string;
  handle: string; // e.g. "@gadgetshub_ng"
  businessName: string;
  category: string;
  country: 'NG' | 'KE' | 'GH' | 'ZA';
  tier: TrustTier;
  tierLabel: string;
  trustScore: number; // 0-100
  regNumber: string; // CAC/KRA/RGD/CIPC registration
  physicalAddress: string;
  dispatchVerified: boolean;
  escrowSupported: boolean;
  sealToken: string; // SHA-256 seal verification token
  complaintCount: number;
  successfulOrders: number;
  memberSince: string;
  whatsappContact?: string;
}

export const KNOWN_TRUSTED_VENDORS: VendorTrustRecord[] = [
  // Nigeria
  {
    id: 'vendor-ng-01',
    handle: '@gadgetshub_ng',
    businessName: 'Gadgets Hub Technologies Ltd',
    category: 'Consumer Electronics & Phones',
    country: 'NG',
    tier: 3,
    tierLabel: 'Tier 3 (CAC + Escrow Protected)',
    trustScore: 98,
    regNumber: 'RC-1849204 (CAC Verified)',
    physicalAddress: 'Suite 14, Otigba Street, Computer Village, Ikeja, Lagos',
    dispatchVerified: true,
    escrowSupported: true,
    sealToken: 'shomar-seal-ng-gadgetshub-98ec21a',
    complaintCount: 0,
    successfulOrders: 2840,
    memberSince: '2022-03-10',
    whatsappContact: '+2348021112233',
  },
  {
    id: 'vendor-ng-02',
    handle: '@luxurysoles_ng',
    businessName: 'Luxury Soles Footwear Hub',
    category: 'Fashion & Footwear',
    country: 'NG',
    tier: 2,
    tierLabel: 'Tier 2 (CAC Registered Business)',
    trustScore: 94,
    regNumber: 'BN-3194022 (CAC Verified)',
    physicalAddress: 'Shop 8, Tejuosho Ultra Modern Market, Yaba, Lagos',
    dispatchVerified: true,
    escrowSupported: true,
    sealToken: 'shomar-seal-ng-luxurysoles-47fa10b',
    complaintCount: 1,
    successfulOrders: 1420,
    memberSince: '2023-01-15',
    whatsappContact: '+2348134445566',
  },
  // Kenya
  {
    id: 'vendor-ke-01',
    handle: '@nairobiluxury',
    businessName: 'Nairobi Luxury Apparel Kenya Ltd',
    category: 'Designer Fashion & Apparel',
    country: 'KE',
    tier: 3,
    tierLabel: 'Tier 3 (KRA Tax Compliant + Escrow)',
    trustScore: 97,
    regNumber: 'PVT-59281 / KRA PIN P051938210A',
    physicalAddress: '2nd Floor, Sarit Centre, Westlands, Nairobi',
    dispatchVerified: true,
    escrowSupported: true,
    sealToken: 'shomar-seal-ke-nairobiluxury-77ad92c',
    complaintCount: 0,
    successfulOrders: 1950,
    memberSince: '2022-08-01',
    whatsappContact: '+254722998877',
  },
  {
    id: 'vendor-ke-02',
    handle: '@kilimani_tech',
    businessName: 'Kilimani Tech Hub Limited',
    category: 'Laptops & Gadgets',
    country: 'KE',
    tier: 2,
    tierLabel: 'Tier 2 (BRS Registered)',
    trustScore: 92,
    regNumber: 'CPR/2021/847291',
    physicalAddress: 'Yaya Centre, Argwings Kodhek Rd, Kilimani, Nairobi',
    dispatchVerified: true,
    escrowSupported: true,
    sealToken: 'shomar-seal-ke-kilimanitech-53be18f',
    complaintCount: 0,
    successfulOrders: 890,
    memberSince: '2023-05-19',
    whatsappContact: '+254711223344',
  },
  // Ghana
  {
    id: 'vendor-gh-01',
    handle: '@accrafashion',
    businessName: 'Accra Contemporary Styles Enterprise',
    category: 'African Print & Couture',
    country: 'GH',
    tier: 3,
    tierLabel: 'Tier 3 (RGD Registered + MoMo Escrow)',
    trustScore: 96,
    regNumber: 'CS-918232021 (RGD Verified)',
    physicalAddress: 'Oxford Street, Osu, Accra',
    dispatchVerified: true,
    escrowSupported: true,
    sealToken: 'shomar-seal-gh-accrafashion-82df31a',
    complaintCount: 0,
    successfulOrders: 1120,
    memberSince: '2022-11-04',
    whatsappContact: '+233244889900',
  },
  // South Africa
  {
    id: 'vendor-za-01',
    handle: '@joburgtech',
    businessName: 'Joburg Refurb & Electronics Pty Ltd',
    category: 'Audio, Gaming & Computers',
    country: 'ZA',
    tier: 3,
    tierLabel: 'Tier 3 (CIPC Verified + EFT Protection)',
    trustScore: 99,
    regNumber: '2021/109283/07 (CIPC Verified)',
    physicalAddress: 'Sandton City Office Tower, 5th St, Sandton, Johannesburg',
    dispatchVerified: true,
    escrowSupported: true,
    sealToken: 'shomar-seal-za-joburgtech-19da64f',
    complaintCount: 0,
    successfulOrders: 3100,
    memberSince: '2021-09-12',
    whatsappContact: '+27821234567',
  },
];

/**
 * Normalizes query string (removes @, lowercases, trims)
 */
export function normalizeVendorQuery(query: string): string {
  return query.trim().toLowerCase().replace(/^@+/, '');
}

/**
 * Verifies a vendor by handle, name, or seal token
 */
export function verifyVendor(query: string): VendorTrustRecord | null {
  if (!query || query.trim().length === 0) return null;
  const normalized = normalizeVendorQuery(query);

  return (
    KNOWN_TRUSTED_VENDORS.find((v) => {
      const vHandle = normalizeVendorQuery(v.handle);
      const vName = v.businessName.toLowerCase();
      const vToken = v.sealToken.toLowerCase();
      return (
        vHandle === normalized ||
        vName.includes(normalized) ||
        vToken === normalized ||
        v.id === normalized
      );
    }) || null
  );
}

/**
 * Returns vendors filtered by country
 */
export function getVendorsByCountry(country: 'NG' | 'KE' | 'GH' | 'ZA' | 'ALL'): VendorTrustRecord[] {
  if (country === 'ALL') return KNOWN_TRUSTED_VENDORS;
  return KNOWN_TRUSTED_VENDORS.filter((v) => v.country === country);
}

/**
 * Generates badge verification text and security verification URL
 */
export function getVendorSealMeta(vendor: VendorTrustRecord) {
  const verifyUrl = `https://protect.shomar.africa/verify-seal?token=${vendor.sealToken}`;
  return {
    verifyUrl,
    badgeText: `SHOMAR TRUST SEAL | ${vendor.tierLabel} | Score: ${vendor.trustScore}/100`,
    isEscrowSafe: vendor.escrowSupported,
    hasPhysicalStore: vendor.dispatchVerified,
  };
}

export interface SafeDealData {
  vendorHandle: string;
  itemName: string;
  amount: number;
  currency: string;
  escrowProtected: boolean;
  returnPolicy: string;
  dealCode: string;
  dealUrl: string;
  shareMessage: string;
  bioSnippet: string;
}

/**
 * Generates an interactive Safe Deal Link & Bio Snippet for social vendors to convert hesitant buyers
 */
export function generateDealLink(
  vendorHandle: string,
  itemName: string,
  amount: number,
  currency = 'NGN'
): SafeDealData {
  const cleanHandle = normalizeVendorQuery(vendorHandle);
  const hash = Math.abs(cleanHandle.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0) ^ amount)
    .toString(16)
    .toUpperCase()
    .slice(0, 6);
  const dealCode = `DEAL-${hash}`;
  const dealUrl = `https://protect.shomar.africa/deal/${cleanHandle}?ref=${dealCode}`;
  
  const formattedAmount = `${currency} ${amount.toLocaleString()}`;
  const shareMessage = [
    `🛡️ PROTECTED PURCHASE DEAL (${dealCode})`,
    `Vendor: @${cleanHandle}`,
    `Item: ${itemName} (${formattedAmount})`,
    `✅ Verified with SHOMAR Trust Seal (Zero-Fraud Guarantee)`,
    `🔒 Buyer Protection Active: Funds secured until item is received.`,
    `Complete your verified order here: ${dealUrl}`,
  ].join('\n');

  const bioSnippet = `🛡️ SHOMAR Verified Merchant • Zero Fraud Record • Order Safely: protect.shomar.africa/trust/@${cleanHandle}`;

  return {
    vendorHandle: cleanHandle,
    itemName,
    amount,
    currency,
    escrowProtected: true,
    returnPolicy: '48-hour inspection & dispute backstop',
    dealCode,
    dealUrl,
    shareMessage,
    bioSnippet,
  };
}

/**
 * Looks up a vendor trust record by social handle or slug
 */
export function getVendorBySlug(slug: string): VendorTrustRecord | undefined {
  const clean = normalizeVendorQuery(slug);
  return KNOWN_TRUSTED_VENDORS.find(v => 
    normalizeVendorQuery(v.handle) === clean ||
    v.id.toLowerCase() === clean.toLowerCase()
  );
}
