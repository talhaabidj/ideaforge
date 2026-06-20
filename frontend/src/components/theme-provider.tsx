"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Light cool off-white is the default and forced theme. The dark warm-charcoal
// canvas was the loudest AI tell. `forcedTheme` ensures light mode is always
// used regardless of system preference or stale localStorage.
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <NextThemesProvider
    attribute="class"
    defaultTheme="light"
    forcedTheme="light"
    enableSystem={false}
    storageKey="ideaforge-theme"
  >
    {children}
  </NextThemesProvider>
);
