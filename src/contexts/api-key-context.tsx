// src/contexts/api-key-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isAuthenticated: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: React.ReactNode;
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Try to load API key from sessionStorage on mount
    const savedKey = sessionStorage.getItem("wakatime-api-key");
    if (savedKey) {
      setApiKeyState(savedKey);
    }
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    sessionStorage.setItem("wakatime-api-key", key);
  };

  const clearApiKey = () => {
    setApiKeyState(null);
    sessionStorage.removeItem("wakatime-api-key");
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
