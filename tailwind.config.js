/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./js/index.js"],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}

