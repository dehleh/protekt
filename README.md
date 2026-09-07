# SHOMAR Protect

An early-access web application for everyday digital safety in Nigeria.

## Included

- ScamCheck for pasted messages and links, with explainable local pattern checks.
- Screenshot text extraction using Tesseract.js in the browser. Users review extracted English text before running a check. Screenshots never leave the device.
- Four guided Cyber SOS journeys: WhatsApp takeover, compromised email, suspected payment fraud, and a lost or stolen phone.
- Six account and device security tasks with device-local progress.
- Recent check summaries stored only in the current browser. Original messages, URLs, screenshots, destination names, and security secrets are not persisted.
- Copy/download of the current assessment guidance and controls to clear local data.

## Development

Use Node.js 24 LTS and npm. The scaffold is based on `@openai/create-sites@0.3.0` with its Shadcn add-on; preserve the lockfile.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
```

The `predev` and `prebuild` scripts copy OCR worker, WebAssembly, and English-language files from installed dependencies into `public/ocr`. The application serves these assets itself; no third-party OCR upload service is used. Do not commit generated OCR assets.

## Product boundaries

This release is a working early-access product, not a validated fraud detection service. Pattern matching has false positives and false negatives. A clean pattern check never guarantees safety. There is no live URL reputation, malware scanning, payment confirmation, bank connection, account monitoring, human response desk, stolen-device tracking service, or guaranteed recovery.

Checks operate locally. They never fetch submitted URLs, so submitted targets cannot create SSRF requests. User content renders as text through React. OCR accepts PNG/JPEG/WebP under 6 MB, checks image dimensions, limits decoded processing size, and supports cancellation and timeout. Language recognition currently supports English text, not QR decoding or visual identity verification.

Browser storage is not an identity system. Checklists are self-reported and do not confirm actual account settings. Stored summaries can be cleared from Privacy & data. Storage errors leave the app usable in memory, with a visible warning. There is no cross-device sync.

## Validation and next integration work

The engine tests cover deceptive URLs, executable URL rejection, privacy-preserving summary construction, secret requests, common scam patterns, safe-message uncertainty, and invalid persisted state. These examples are regression checks, not a measure of real-world detection accuracy.

Before a public consumer launch, evaluate against a labelled local dataset, review recovery copy with the security team, add consent-based provider integrations and monitoring, define retention and support commitments, and validate operating costs and pricing. No credentials or payment secrets should be accepted by support workflows.

Validated on 7 September 2026: 23 tests passed, including local OCR extraction and its assessment; TypeScript passed; the production static export succeeded; the local application returned HTTP 200. Browser interaction and visual QA were not requested and were not performed.

The optional imperative WebMCP surface exposes checking content, opening a recovery guide, and reading checklist progress. It is feature-detected and does not affect ordinary browser use. Its browser contract remains unverified because a compatible validation context was not available.

## Guidance sources

- [WhatsApp account recovery](https://faq.whatsapp.com/1131652977717250/?locale=en_US)
- [Google compromised-account guidance](https://support.google.com/accounts/answer/6294825)
- [Google Find Hub preparation](https://support.google.com/android/answer/3265955)
- [Apple stolen-device guidance](https://support.apple.com/en-ie/120837)
- [CBN consumer guidance](https://www.cbn.gov.ng/supervision/cpdconedu.html)

Guidance links reviewed September 2026. The app directs people to official providers for current instructions and time-sensitive actions.
