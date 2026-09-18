# SHOMAR Protect mobile

React Native + Expo SDK 57 application for Android and iOS. The existing web application remains in the parent directory. Run mobile commands from this directory.

## Included in the 0.2.1 source baseline

- Three-step onboarding with optional app selection and notification permission.
- Home, ScamCheck, My apps, Family and Cyber SOS tabs, with accessible controls, safe areas, flexible text, scrolling, keyboard handling and tablet-width content.
- On-device message and link checks using the shared `../lib/scam-engine.ts`, with Nigerian threat patterns for BVN/NIN/OTP requests, mistaken-transfer reversals, account rental, loan-fee harvesting and urgent Pidgin pressure. Submitted content stays in screen memory and is not persisted or fetched.
- Direct Android/iOS sharing of text, links and one screenshot into ScamCheck. Shared content is presented for review and is never checked automatically.
- Screenshot OCR on Android (Google ML Kit) and iOS (Apple Vision), plus local QR extraction. The chosen image, extracted text and QR values stay in temporary screen memory.
- Large screenshots are downsampled before OCR to bound native memory use.
- Thirteen selectable apps/account types grouped into Social, Identity, Email, Messaging and Money. Selection creates a self-reported security checklist.
- A local Android Expo module that detects a narrow allowlist of supported apps after the user confirms discovery. Found apps are not automatically selected. Detection results are temporary; only the user's choices are saved.
- Manual app selection on iOS and when the Android native module is unavailable, including Expo Go.
- Family nicknames, roles, age groups, household checklists, a shareable family safety pact and official Family Link / Screen Time setup links.
- Four recovery guides with saved progress and official provider links.
- Optional native local notifications for checks with warnings, weekly/monthly safety reminders, notification-tap navigation, a test alert, and an Android notification-panel card for the latest check.
- An optional biometric/device-credential app lock, a low-data preference and concise Pidgin guidance for check results.
- A Cyber SOS support brief that the user can review, redact and share through the phone share sheet when escalating to a trusted person or responder.
- Bounded check summaries, serialized storage writes, defensive restoration and a clear-data control. Notifications never include pasted content or family details.
- A privacy cover hides app content when the app leaves the foreground, backed by native app-switcher protection on iOS, and a safe render fallback avoids logging private payloads.

## Run

Use Node 24 LTS and npm. SDK 57 requires Node 22.13 or newer. Install an Expo Go version that supports SDK 57 for a screen preview:

```sh
npm ci
npm run preview
```

Scan the Metro QR code with Expo Go on a phone on the same network. Expo Go can preview most interface paths. Installed-app discovery and screenshot OCR require the SHOMAR development build; share-extension, biometric and notification behavior must also be checked in a native build.

For the full Android development app, install the Android Studio toolchain, configure its SDK/JDK, connect a device with USB debugging enabled or start an emulator, then run:

```sh
npm run android
```

For iOS, use a Mac with Xcode compatible with SDK 57 and run `npm run ios`. Android supports Android 7+; iOS supports iOS 16.4+. Follow Expo's current setup guidance below for exact toolchain requirements.

```sh
npm run typecheck
npm test
npm run verify
```

`npm run verify` runs the typecheck, unit tests and public Expo configuration validation. `export:native` creates Android and iOS JavaScript/Hermes bundles in `dist`; it is not an APK/IPA or a native compilation test. `npm run prebuild:android` generates Android project files and the package-visibility declarations without requiring a local Android SDK; generated native folders are ignored by Git. Edit the local module or config plugin, then regenerate them.

## Installable builds

`eas.json` defines development and preview APK profiles and a production profile. To use EAS, first associate the project with the owner's Expo account and configure signing credentials. No cloud project or signing identity has been registered by this scaffold. The provisional application identifier is `com.shomar.protect`; confirm ownership before store enrollment.

The existing `SHOMAR-Protect-0.2.0-preview.apk` is an internal, development-signed Android preview. It predates the 0.2.1 hardening changes and must not be submitted to Google Play or represented as a release candidate.

After account/project setup, `npx eas-cli build --platform android --profile preview` builds an Android APK containing the native discovery module. This uploads project source to Expo's build service. Production store distribution, push credentials, and an iOS signing account are separate setup steps.

## Platform and product boundaries

The pulse describes the latest submitted check, not overall phone or account health. It is grey before a check and when a result is over 24 hours old, amber for uncertainty/warnings, red for strong warning patterns, and green only for a recent result without detected patterns. Even green does not establish safety. The Android card is a dated snapshot; it refreshes when the app runs. The OS controls its small status-bar icon, visibility and dismissal. There is no always-on background service, arbitrary green system light, or iOS status-bar overlay.

The Android module uses explicit package queries for nine supported services (including regional/Business package variants). It does not request `QUERY_ALL_PACKAGES`, access accessibility services, inspect message content, or transmit an app inventory. Identity and money entries are manual account categories. iOS does not have general installed-app enumeration in this build.

Account OAuth/provider events, influencer impersonation detection, remote push, continuous account monitoring, cross-device family enrollment, location, app blocking, Screen Time integration, VPN filtering, and malware/APK scanning are not implemented. Parental controls here are a local setup plan linked to the official OS tools. Provider monitoring needs approved provider APIs, a production backend, user consent flows and operating responders; the app does not claim those services before they exist.

Preferences and summaries use AsyncStorage, not a credential vault. Do not store passwords, recovery codes or bank credentials. There is no app-managed cross-device sync or backend upload. OS-level backup behavior is separate; Android app backup is disabled in this config. Notification permission is optional and can be revoked in phone settings.

Treat [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) as the release gate. A source build is ready for signed acceptance testing only after its checks pass; production approval also requires the listed device, privacy, security, legal, operational and store evidence.

## Device acceptance checks before release

On a real Android development build, confirm discovery finds installed supported apps, handles no matches, adds nothing without selection, and removes checklist data when deselected. Confirm the merged manifest contains only the intended app queries and no broad app-inventory permission.

On Android and iPhone, complete and skip onboarding; share text, a URL and a screenshot from another app; scan screenshots with clear/blurred/no text and one/multiple QR codes; deny and grant notifications; schedule and cancel reminders; run suspicious and uncertain checks; tap alerts with the app open/backgrounded/closed; revoke permission in Settings; enable the app lock; restart to verify saved choices; clear all local data; and check offline behavior. Test small screens, large text, screen readers, landscape, keyboard visibility, safe areas and Android Back. Verify the Android card can be disabled and does not claim live monitoring. JavaScript export alone cannot validate these native behaviors.

## Official references

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Local native app builds](https://docs.expo.dev/guides/local-app-overview/)
- [Expo notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/)
- [Local Expo modules](https://docs.expo.dev/modules/get-started/)
- [Android package visibility](https://developer.android.com/training/package-visibility/declaring)
- [Apple URL-scheme queries](https://developer.apple.com/documentation/uikit/uiapplication/canopenurl(_:))
