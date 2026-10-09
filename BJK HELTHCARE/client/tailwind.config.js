import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).replace(/\\/g, '/');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    `${__dirname}/index.html`,
    `${__dirname}/src/**/*.{js,ts,jsx,tsx}`,
  ],
  theme: {
    extend: {
      colors: {
        bjk: {
          teal: '#00A896',
          'teal-dark': '#009B8D',
          'teal-light': '#02C39A',
          purple: '#7B2CBF',
          'purple-accent': '#8338EC',
          orange: '#F77F00',
          yellow: '#FCBF49',
          cyan: '#00B4D8',
          dark: '#1E293B',
          'deep-dark': '#0F172A',
          bg: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'bjk': '0 4px 20px -2px rgba(0, 168, 150, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.06)',
        'bjk-lg': '0 10px 25px -3px rgba(0, 168, 150, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
}
