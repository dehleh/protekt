import { requireOptionalNativeModule } from 'expo';
import { Camera } from 'expo-camera';

const native = requireOptionalNativeModule<{ recognizeText: (uri: string) => Promise<string> }>('ShomarDiscovery');
export const textRecognitionAvailable = native !== null;

export async function analyzeScreenshot(uri: string) {
  const [textResult, qrResult] = await Promise.allSettled([
    native ? native.recognizeText(uri) : Promise.reject(new Error('Text recognition needs the SHOMAR development build.')),
    Camera.scanFromURLAsync(uri, ['qr']),
  ]);
  const text = textResult.status === 'fulfilled' ? textResult.value.trim().slice(0, 12_000) : '';
  const qrValues = qrResult.status === 'fulfilled' ? [...new Set(qrResult.value.map(item => item.data.trim()).filter(Boolean))].slice(0, 5) : [];
  return { text, qrValues, textError: textResult.status === 'rejected' ? (textResult.reason instanceof Error ? textResult.reason.message : 'Text recognition failed.') : '' };
}
