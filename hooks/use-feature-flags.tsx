'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_FLAG_STORAGE_KEY,
  FEATURE_PRESETS,
  FeatureFlags,
  FeatureFlagKey,
  FeaturePreset,
  parseFeatureFlags,
} from '../lib/feature-flags';

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  toggleFlag: (key: FeatureFlagKey) => void;
  setFlag: (key: FeatureFlagKey, enabled: boolean) => void;
  applyPreset: (preset: FeaturePreset) => void;
  resetFlags: () => void;
  isLoaded: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType>({
  flags: DEFAULT_FEATURE_FLAGS,
  toggleFlag: () => {},
  setFlag: () => {},
  applyPreset: () => {},
  resetFlags: () => {},
  isLoaded: false,
});

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore stored flags on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FEATURE_FLAG_STORAGE_KEY);
      if (stored) {
        setFlags(parseFeatureFlags(stored));
      }
    } catch {
      // Storage unavailable fallback
    }
    setIsLoaded(true);
  }, []);

  const saveFlags = useCallback((updated: FeatureFlags) => {
    setFlags(updated);
    try {
      localStorage.setItem(FEATURE_FLAG_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Synchronize to server endpoint asynchronously
    if (typeof fetch !== 'undefined') {
      fetch('/api/admin/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flags: updated }),
      }).catch(() => {});
    }
  }, []);

  const toggleFlag = useCallback(
    (key: FeatureFlagKey) => {
      saveFlags({ ...flags, [key]: !flags[key] });
    },
    [flags, saveFlags]
  );

  const setFlag = useCallback(
    (key: FeatureFlagKey, enabled: boolean) => {
      saveFlags({ ...flags, [key]: enabled });
    },
    [flags, saveFlags]
  );

  const applyPreset = useCallback(
    (preset: FeaturePreset) => {
      if (preset in FEATURE_PRESETS) {
        saveFlags({ ...FEATURE_PRESETS[preset].flags });
      }
    },
    [saveFlags]
  );

  const resetFlags = useCallback(() => {
    saveFlags({ ...DEFAULT_FEATURE_FLAGS });
  }, [saveFlags]);

  return (
    <FeatureFlagsContext.Provider
      value={{
        flags,
        toggleFlag,
        setFlag,
        applyPreset,
        resetFlags,
        isLoaded,
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
