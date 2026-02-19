export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'comfortable' | 'spacious';
  isDark: boolean;
}

export interface CustomTheme extends ThemePreset {
  isCustom: boolean;
  createdAt: Date | string;
}

export interface ThemeVariable {
  name: string;
  value: string;
  description: string;
  category: 'color' | 'size' | 'font';
}
