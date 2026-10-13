import { createContext } from 'react';
import type { Theme, ThemePreference } from '../lib/theme';

export interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
