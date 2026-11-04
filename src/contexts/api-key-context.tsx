// src/contexts/api-key-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ApiKeyStorageMode = "local" | "session";

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isAuthenticated: boolean;
  /** Where the key is saved: "local" survives browser restarts, "session" clears on tab/browser close. */
  storageMode: ApiKeyStorageMode;
  setStorageMode: (mode: ApiKeyStorageMode) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: React.ReactNode;
}

const API_KEY_STORAGE_KEY = "wakatime-api-key";
// The mode preference itself isn't a secret, so it always lives in
// localStorage, independent of which storage the key currently sits in.
const STORAGE_MODE_KEY = "wakatime-api-key-storage-mode";

function isStorageMode(value: unknown): value is ApiKeyStorageMode {
  return value === "local" || value === "session";
}

function storageFor(mode: ApiKeyStorageMode): Storage {
  return mode === "local" ? localStorage : sessionStorage;
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [storageMode, setStorageModeState] = useState<ApiKeyStorageMode>("local");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedMode = localStorage.getItem(STORAGE_MODE_KEY);
      const mode = isStorageMode(savedMode) ? savedMode : "local";
      setStorageModeState(mode);

      // Normally the key is wherever `mode` says. If it's missing there but
      // present in the other storage (e.g. the mode preference changed in
      // another tab, or this is the first load after the default changed),
      // adopt it into the preferred storage instead of losing access to it.
      const preferred = storageFor(mode);
      const other = storageFor(mode === "local" ? "session" : "local");
      let key = preferred.getItem(API_KEY_STORAGE_KEY);
      if (!key) {
        const stray = other.getItem(API_KEY_STORAGE_KEY);
        if (stray) {
          key = stray;
          preferred.setItem(API_KEY_STORAGE_KEY, stray);
          other.removeItem(API_KEY_STORAGE_KEY);
        }
      }
      if (key) setApiKeyState(key);
    } catch (error) {
      console.warn("Failed to load API key:", error);
    }
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    try {
      storageFor(storageMode).setItem(API_KEY_STORAGE_KEY, key);
      // No stray copy left behind in the storage that isn't active.
      storageFor(storageMode === "local" ? "session" : "local").removeItem(API_KEY_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to save API key:", error);
    }
  };

  const clearApiKey = () => {
    setApiKeyState(null);
    try {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      sessionStorage.removeItem(API_KEY_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to remove API key:", error);
    }
  };

  const setStorageMode = (next: ApiKeyStorageMode) => {
    if (next === storageMode) return;
    try {
      const from = storageFor(storageMode);
      const to = storageFor(next);
      const existing = from.getItem(API_KEY_STORAGE_KEY);
      from.removeItem(API_KEY_STORAGE_KEY);
      if (existing) to.setItem(API_KEY_STORAGE_KEY, existing);
      localStorage.setItem(STORAGE_MODE_KEY, next);
    } catch (error) {
      console.warn("Failed to move API key to the new storage:", error);
    }
    setStorageModeState(next);
  };

  const isAuthenticated = Boolean(apiKey);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ApiKeyContext.Provider
        value={{
          apiKey: null,
          setApiKey: () => {},
          clearApiKey: () => {},
          isAuthenticated: false,
          storageMode: "local",
          setStorageMode: () => {},
        }}
      >
        {children}
      </ApiKeyContext.Provider>
    );
  }

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        setApiKey,
        clearApiKey,
        isAuthenticated,
        storageMode,
        setStorageMode,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return context;
};
