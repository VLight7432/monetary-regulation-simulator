/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        institution: {
          bleu: '#003366',
          bleuClair: '#0055a4',
          gris: '#e5e5e5',
          grisFonce: '#333333',
          rouge: '#e2001a',
          vert: '#008941',
        }
      }
    }
  },
  plugins: [],
}