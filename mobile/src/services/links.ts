import { Alert, Linking } from 'react-native';

export async function openGuide(url: string) {
  try {
    if (new URL(url).protocol !== 'https:') throw new Error('Only secure guide links are supported.');
    await Linking.openURL(url);
  } catch { Alert.alert('Could not open the guide', 'Please try again when a browser and internet connection are available.'); }
}
