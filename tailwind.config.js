import defaultTheme from 'tailwindcss/defaultTheme';
/** @type {import('tailwindcss').Config} */

export default {
  content: ["*.html"],
  safelist: ['bg-yellow-500', 'bg-red-500'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['roboto', ...defaultTheme.fontFamily.sans],
        score: ['monda', ...defaultTheme.fontFamily.mono],
      },
      colors: {
      primary: 'rgb(var(--accent-color) / <alpha-value>)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
