export const familyAgeBands = ['Under 10', '10–12', '13–15', '16–17', 'Adult'] as const;
export type FamilyRole = 'Parent' | 'Child' | 'Caregiver';

export const familyTasks = [
  { id: 'family-recovery', title: 'Give every child a recovery route', description: 'Add a parent or trusted caregiver as the recovery contact for the child’s main email and device account.', category: 'Accounts', minutes: 5 },
  { id: 'family-locks', title: 'Use a different lock for each device', description: 'Set a screen lock that is hard to guess, and avoid sharing a parent’s banking or email passcode.', category: 'Devices', minutes: 3 },
  { id: 'family-updates', title: 'Turn on automatic updates', description: 'Keep phones, tablets, browsers, and messaging apps updated so known security fixes arrive quickly.', category: 'Devices', minutes: 2 },
  { id: 'family-purchases', title: 'Add a purchase approval step', description: 'Review app-store and in-app purchase settings together. A password or approval prompt should be required.', category: 'Money', minutes: 4 },
  { id: 'family-privacy', title: 'Review location and camera access', description: 'Check which apps can use location, microphone, camera, contacts, or photos. Remove access that is not needed.', category: 'Privacy', minutes: 6 },
  { id: 'family-reporting', title: 'Choose a safe way to report a problem', description: 'Agree that a child can show a suspicious message, mistake, or uncomfortable contact without losing access to help.', category: 'Trust', minutes: 5 },
] as const;

export const familyRules = [
  { title: 'Pause before a reply', body: 'No one in the family needs to answer an urgent message immediately. Check with a trusted person first.' },
  { title: 'No secret codes', body: 'Passwords, PINs, OTPs, and recovery codes stay private—even when a message claims to be from a friend, school, or bank.' },
  { title: 'Mistakes get help', body: 'If a link was clicked or money was sent, tell the family quickly. Fast help matters more than blame.' },
  { title: 'Meet people online safely', body: 'A profile, voice note, or video call does not prove who someone is. Never meet an online contact alone.' },
] as const;

export const familyControlLinks = [
  { label: 'Google Family Link', description: 'Official setup for supervised Android and Google accounts.', href: 'https://families.google/familylink/' },
  { label: 'Apple Screen Time', description: 'Official controls for app limits, content, and communication.', href: 'https://support.apple.com/en-us/HT208982' },
] as const;
