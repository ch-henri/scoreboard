import defaultTheme from 'tailwindcss/defaultTheme';
/** @type {import('tailwindcss').Config} */

export default {
  content: ["*.html"],
  safelist: ['bg-yellow-500', 'bg-red-500'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['plexMono', ...defaultTheme.fontFamily.mono],
        score: ['monda', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        primary: '#0459A8',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

