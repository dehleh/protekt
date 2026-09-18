const { withAndroidManifest } = require('expo/config-plugins');
const supported = require('../modules/shomar-discovery/android/src/main/assets/shomar-supported-apps.json');

module.exports = function withSupportedApps(config) {
  return withAndroidManifest(config, config => {
    const manifest = config.modResults.manifest;
    // This release supports exactly one shared item. Expo Sharing currently emits
    // an empty SEND_MULTIPLE filter for an empty MIME list, so remove it explicitly.
    for (const application of manifest.application ?? []) {
      for (const activity of application.activity ?? []) {
        activity['intent-filter'] = (activity['intent-filter'] ?? []).filter(filter =>
          !(filter.action ?? []).some(action => action.$?.['android:name'] === 'android.intent.action.SEND_MULTIPLE')
        );
      }
    }
    manifest.queries ??= [];
    const declared = new Set(manifest.queries.flatMap(query => (query.package ?? []).map(pkg => pkg.$['android:name'])));
    const packages = [...new Set(Object.values(supported).flat())].filter(name => !declared.has(name));
    if (packages.length) manifest.queries.push({ package: packages.map(name => ({ $: { 'android:name': name } })) });
    return config;
  });
};
