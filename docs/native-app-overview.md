# Native app overview plan

The current App Overview is a consent-first list that users select locally. It does not inspect installed apps or monitor accounts.

## Device discovery

- Android can expose a narrow list of known package identifiers through a native companion, subject to package-visibility rules, Play policy, and a clear user explanation. SHOMAR should detect only supported packages and never upload a complete app inventory by default.
- iOS does not provide a general public API for reading arbitrary installed-app inventory. The iOS companion can know about SHOMAR itself, support user-added accounts, and use approved device-management scenarios where an organisation has the required authority.
- Both platforms should show the discovered candidates to the user and require an explicit per-app choice before anything is added to the overview.

## Account monitoring

Each provider connection should be separate and least-privilege. The connection screen should state the data requested, purpose, retention, alert types, and disconnect/delete action. Account tokens belong in a protected backend vault, not browser storage.

The first integrations should prioritise recovery and security events: new sign-ins, recovery-option changes, two-step verification changes, unfamiliar sessions, and password resets. SHOMAR should not read private conversations to provide this service.

## Release gates

Before enabling a native scan or live monitoring, complete platform-policy review, threat modelling, consent and deletion flows, provider terms review, a labelled alert test set, and an incident path for false positives or compromised integrations.
