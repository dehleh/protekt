# SHOMAR Protect production readiness

This file is a release gate. A checked item must have evidence from the exact binary being submitted. A preview APK, JavaScript export, simulator run, or successful compilation is not equivalent to store approval or production readiness.

## Implemented baseline

- [x] Submitted messages, links, extracted screenshot text and QR values are temporary and are not written to app storage.
- [x] Saved history contains only verdict, check type, timestamp and signal count, capped at 30 entries.
- [x] Android app discovery uses an explicit supported-package allowlist and does not request `QUERY_ALL_PACKAGES`.
- [x] Android backup is disabled and camera, microphone, broad storage and overlay permissions are removed from release configuration.
- [x] Incoming shared content requires user review before a check runs.
- [x] Screenshot OCR is bounded before decoding to reduce memory exhaustion risk.
- [x] Background views are covered with a privacy screen, with native app-switcher protection enabled on iOS.
- [x] App lock is optional and delegates authentication to the device; SHOMAR does not receive biometric data or the device passcode.
- [x] Notification text excludes submitted content and family information.
- [x] Restored local data is allowlisted, length-bounded and versioned; writes are serialized.
- [x] A render error boundary fails closed without logging submitted or saved private content.
- [x] Production and preview build environments are separate and production builds require a committed revision.

## Store-release blockers

- [ ] Compile and test iOS on the minimum supported iOS version and current iOS, using the production share extension and a real Apple signing identity.
- [ ] Run the full Android acceptance matrix on Android 7, 10, 13, 14 and the current Android version, including low-memory and offline devices.
- [ ] Replace the internal Android debug signing key with the organization-controlled Play App Signing/upload-key flow. Never ship the local preview APK to a store.
- [ ] Register the final Expo/EAS project, Apple bundle ID and Google Play package under organization-owned accounts with least-privilege team access and MFA.
- [ ] Publish reviewed Privacy Policy, Terms, support contact, data-deletion instructions and incident-response contact on stable HTTPS URLs, then add those URLs to both store listings and the app.
- [ ] Define the local-data classification and recovery model. Move any future account tokens, contact details or sensitive family identifiers to encrypted platform storage; never place credentials, recovery codes or financial secrets in AsyncStorage.
- [ ] Complete a Nigeria Data Protection Act DPIA before enabling accounts, telemetry, remote family functions, cloud reputation checks or human support. Record lawful basis, retention, processors, international transfers and deletion SLAs.
- [ ] Decide and document the target audience. Because the product includes family profiles for minors, complete Google Play Families and Apple child-safety reviews before claiming child-directed use. Do not add advertising or behavioral analytics without a separate review.
- [ ] Add privacy-reviewed crash reporting with payload scrubbing, sampling, retention limits, regional/processor review and an explicit ban on message/link/screenshot/family fields.
- [ ] Commission mobile application security testing against the signed release candidates, including local storage, deep/share links, intent handling, screenshots, notification leakage, tampering and reverse engineering.
- [ ] Resolve or formally accept the current dependency-audit result before release. The 2026-09-17 `npm audit --omit=dev` result has 11 moderate, zero high and zero critical findings; the chain is in Expo build/config tooling through `xcode` and `uuid`. Do not apply npm's suggested Expo 46 downgrade. Recheck for an SDK 57-compatible upstream fix and document reachability and compensating controls.
- [ ] Validate accessibility with TalkBack and VoiceOver, large text, switch control, contrast and a small-screen physical device.
- [ ] Prepare and rehearse rollback, key rotation, vulnerability intake, abuse response and store emergency-release procedures.
- [ ] Obtain product/legal approval for every monitoring claim. Account monitoring, impersonation detection, remote family alerts, device enrollment and staffed response must remain unavailable until their backend, consent, audit and operational controls exist.

## Required device acceptance flow

1. Install a clean signed candidate and complete or skip onboarding.
2. Share text, a URL and an image from another app; confirm nothing runs before review.
3. Check screenshots with clear text, rotated text, no text, one QR, multiple QR codes and an unusually large image.
4. Deny, grant and later revoke notifications; schedule/cancel reminders and verify no private text appears in a notification.
5. Enable app lock, background the app, use the app switcher, change biometric enrollment and reboot the phone.
6. Test installed-app discovery with matches, no matches, work profile and restricted profile; confirm no app is selected automatically.
7. Clear local data, force-stop, restart and reinstall; confirm documented deletion and platform persistence behavior.
8. Complete every Cyber SOS guide offline and verify that sharing a support brief is always user initiated and editable.

## Release evidence

Record the Git commit, version/build numbers, signed artifact hashes, store test tracks, device/OS matrix, test results, dependency audit, permission dump, privacy review, DPIA approval, penetration-test report and named release approvers for each candidate.
