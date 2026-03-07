// Design Tokens - Colors
// Single source of truth for all color values (mirrors web SCSS tokens)

export const colors = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryLight: '#dbeafe',

  secondary: '#64748b',
  secondaryHover: '#475569',

  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',

  bgPrimary: '#ffffff',
  bgSecondary: '#f8fafc',
  bgTertiary: '#f1f5f9',

  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',

  border: '#e2e8f0',
  borderFocus: '#2563eb',
} as const;
