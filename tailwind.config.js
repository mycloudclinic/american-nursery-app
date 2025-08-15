/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern garden center color palette following Apple HIG principles
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7', 
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Main green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        secondary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308', // Warm yellow
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899', // Pink accent
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // System colors following Apple HIG
        system: {
          background: '#ffffff',
          'background-secondary': '#f2f2f7',
          'background-tertiary': '#ffffff',
          label: '#000000',
          'label-secondary': '#3c3c43',
          'label-tertiary': '#3c3c4399',
          'label-quaternary': '#3c3c432d',
          separator: '#c6c6c8',
          'separator-opaque': '#c6c6c8',
          link: '#007aff',
          fill: '#78788033',
          'fill-secondary': '#78788028',
          'fill-tertiary': '#7676801e',
          'fill-quaternary': '#74748014',
        }
      },
      fontFamily: {
        sans: [
          'var(--font-outfit)',
          '-apple-system',
          'BlinkMacSystemFont',
          'San Francisco',
          'Helvetica Neue',
          'Helvetica',
          'Ubuntu',
          'Roboto',
          'Noto',
          'Segoe UI',
          'Arial',
          'sans-serif',
        ],
        outfit: ['var(--font-outfit)', 'sans-serif'],
      },
      fontSize: {
        // Apple HIG typography scale
        'title1': ['2rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'title2': ['1.5rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        'title3': ['1.25rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'headline': ['1.125rem', { lineHeight: '1.375rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'callout': ['1rem', { lineHeight: '1.375rem', fontWeight: '400' }],
        'subheadline': ['0.9375rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'footnote': ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '400' }],
        'caption1': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
        'caption2': ['0.6875rem', { lineHeight: '0.875rem', fontWeight: '400' }],
      },
      spacing: {
        // Apple HIG spacing system
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '17': '4.25rem',
        '18': '4.5rem',
        '19': '4.75rem',
        '21': '5.25rem',
        '22': '5.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        // Apple HIG corner radius
        'apple': '0.5rem',
        'apple-lg': '0.75rem',
        'apple-xl': '1rem',
        'apple-2xl': '1.25rem',
        'apple-3xl': '1.5rem',
      },
      animation: {
        // Apple-style animations with spring easing
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-out': 'fadeOut 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-out': 'scaleOut 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'spring 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        spring: {
          '0%': { transform: 'scale(0.9) translateY(10px)', opacity: '0' },
          '50%': { transform: 'scale(1.02) translateY(-2px)', opacity: '0.8' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // Apple HIG elevation shadows
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'apple': '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)',
        'apple-md': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'apple-lg': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        'apple-xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
        'apple-2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
        'apple-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
