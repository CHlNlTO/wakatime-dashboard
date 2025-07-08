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
    try {
      const savedKey = sessionStorage.getItem("wakatime-api-key");
      if (savedKey) {
        setApiKeyState(savedKey);
      }
    } catch (error) {
      console.warn("Failed to load API key from sessionStorage:", error);
    }
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    try {
      sessionStorage.setItem("wakatime-api-key", key);
    } catch (error) {
      console.warn("Failed to save API key to sessionStorage:", error);
    }
  };

  const clearApiKey = () => {
    setApiKeyState(null);
    try {
      sessionStorage.removeItem("wakatime-api-key");
    } catch (error) {
      console.warn("Failed to remove API key from sessionStorage:", error);
    }
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
