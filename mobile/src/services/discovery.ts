import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { catalog } from '../core/catalog';

const native = Platform.OS === 'android' ? requireOptionalNativeModule<{ findInstalledApps: () => Promise<string[]> }>('ShomarDiscovery') : null;
export const discoveryAvailable = Platform.OS === 'android' && native !== null;
export async function discoverApps(consent: boolean): Promise<string[]> {
  if (!consent) throw new Error('Agree to the discovery explanation first.');
  if (!native) throw new Error(Platform.OS === 'android' ? 'App discovery needs the SHOMAR Android development build. You can select apps manually here.' : 'Choose your apps manually on this device.');
  const found = await native.findInstalledApps();
  return [...new Set(found)].filter(id => catalog.some(app => app.id === id));
}
