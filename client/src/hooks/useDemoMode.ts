import { useState, useCallback } from "react";

// Hook to manage demo mode state
export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    // Check localStorage for demo mode preference
    const stored = localStorage.getItem('fitness-app-demo-mode');
    return stored === 'true';
  });

  const toggleDemoMode = useCallback((enabled: boolean) => {
    setIsDemoMode(enabled);
    localStorage.setItem('fitness-app-demo-mode', enabled.toString());
  }, []);

  return {
    isDemoMode,
    toggleDemoMode,
  };
}