const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: '#167bff',
          'primary-content': '#ffffff',
          'secondary': '#494949',
          'secondary-content': '#d8d8d8',
          'accent': '#00c7b5',
          'accent-content': '#000e0c',
          'neutral': '#2a323c',
          'neutral-content': '#a6adbb',
          'base-100': '#191e23',
          'base-200': '#252b32',
          'base-300': '#2a3038',
          'base-content': '#dcebfa',
          'info': '#00e1ff',
          'info-content': '#001216',
          'success': '#24b75e',
          'success-content': '#ffffff',
          'warning': '#f5a524',
          'warning-content': '#150a00',
          'error': '#dd204b',
          'error-content': '#ffffff',
        }
      }
    ],
  },
  plugins: [require("daisyui")],
};
