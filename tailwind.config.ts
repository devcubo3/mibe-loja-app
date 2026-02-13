import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        // Cores principais
        primary: '#181818',
        secondary: '#666666',
        background: '#FFFFFF',

        // Cores de input/formulário
        'input-bg': '#F5F5F5',
        'input-border': '#E0E0E0',

        // Cores de texto
        'text-primary': '#181818',
        'text-secondary': '#666666',
        'text-muted': '#999999',

        // Cores semânticas
        error: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
        info: '#007AFF',
        purple: '#7C3AED',

        // Cores específicas
        star: '#FFB800',
        whatsapp: '#25D366',

        // Cores de fundo para ícones (com opacidade)
        'primary-light': '#F0F0F0',
        'success-light': '#E8F5E9',
        'error-light': '#FFEBEE',
        'warning-light': '#FFF3E0',
        'info-light': '#E3F2FD',
        'purple-light': '#F5F3FF',
      },
      fontSize: {
        caption: ['12px', { lineHeight: '16px' }],
        body: ['14px', { lineHeight: '20px' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        subtitle: ['18px', { lineHeight: '28px' }],
        title: ['24px', { lineHeight: '32px' }],
        header: ['32px', { lineHeight: '40px' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      height: {
        input: '56px',
        'input-sm': '44px',
      },
      width: {
        sidebar: '280px',
      },
      margin: {
        sidebar: '280px',
      },
    },
  },
  plugins: [],
};

export default config;
