import React from 'react';
import { useColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Syncs the device system color scheme with NativeWind's dark mode.
 * Wrap this around the app root so `dark:` classes respond to system preference.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();

  React.useEffect(() => {
    // 'unspecified' is not a valid NativeWind scheme — fall back to 'light'
    const scheme = systemScheme === 'dark' ? 'dark' : 'light';
    setColorScheme(scheme);
  }, [systemScheme, setColorScheme]);

  return <>{children}</>;
}
