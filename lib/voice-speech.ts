/**
 * SHOMAR Protect - Vernacular Voice & Audio Engine
 * 
 * Provides on-device speech synthesis for colloquial African dialects
 * (Pidgin, Hausa, Yoruba, Igbo, Swahili, Zulu, and English) to overcome the literacy barrier.
 */

import type { SupportedLanguage } from './vernacular';

export interface VoiceEngineState {
  isSpeaking: boolean;
  isSupported: boolean;
  selectedLanguage: SupportedLanguage;
}

/**
 * Maps SHOMAR supported languages to BCP 47 locale codes for speech synthesis
 */
export const LANGUAGE_LOCALE_MAP: Record<SupportedLanguage, string[]> = {
  English: ['en-NG', 'en-ZA', 'en-GB', 'en-US'],
  'Pidgin assist': ['en-NG', 'en-GH', 'en-GB'],
  Hausa: ['ha-NG', 'ha', 'en-NG'],
  Yoruba: ['yo-NG', 'yo', 'en-NG'],
  Igbo: ['ig-NG', 'ig', 'en-NG'],
  Swahili: ['sw-KE', 'sw-TZ', 'sw', 'en-KE'],
  Zulu: ['zu-ZA', 'zu', 'en-ZA'],
};

/**
 * Speaks the given text using the Web Speech API with regional accent matching
 */
export function speakVernacularText(
  text: string,
  language: SupportedLanguage,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLocales = LANGUAGE_LOCALE_MAP[language] || ['en-NG', 'en-US'];

    // Try to match an installed voice that matches the target locales
    const voices = window.speechSynthesis.getVoices();
    let matchedVoice: SpeechSynthesisVoice | undefined;

    for (const loc of targetLocales) {
      matchedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(loc.toLowerCase()));
      if (matchedVoice) break;
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    // Configure pitch and rate for clarity and urgency
    utterance.rate = 0.93; // slightly slower for maximum comprehension
    utterance.pitch = 1.02;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (e) => {
      onError?.(e);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    onError?.(err);
    return false;
  }
}

/**
 * Stops any active speech synthesis
 */
export function stopVernacularSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
