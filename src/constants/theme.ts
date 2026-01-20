export const COLORS = {
  // Cores principais
  primary: '#181818',
  secondary: '#666666',
  background: '#FFFFFF',

  // Cores de input/formulário
  inputBackground: '#F5F5F5',
  inputBorder: '#E0E0E0',

  // Cores de texto
  text: '#181818',
  textSecondary: '#666666',
  textMuted: '#999999',

  // Cores utilitárias
  white: '#FFFFFF',
  black: '#000000',

  // Cores semânticas
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',

  // Cores específicas
  star: '#FFB800',
  whatsapp: '#25D366',

  // Cores de fundo para ícones (com 15% opacidade)
  successLight: '#E8F5E9',
  errorLight: '#FFEBEE',
  warningLight: '#FFF3E0',
} as const;

export const FONTS = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
} as const;

export const SIZES = {
  // Spacing
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',

  // Font sizes
  caption: '12px',
  body: '14px',
  bodyLarge: '16px',
  subtitle: '18px',
  title: '24px',
  header: '32px',

  // Border radius
  radiusSm: '4px',
  radiusMd: '8px',
  radiusLg: '12px',
  radiusFull: '9999px',

  // Input height
  inputHeight: '56px',
  inputHeightSm: '44px',

  // Sidebar
  sidebarWidth: '280px',
} as const;

export type ColorKeys = keyof typeof COLORS;
export type FontKeys = keyof typeof FONTS;
export type SizeKeys = keyof typeof SIZES;
