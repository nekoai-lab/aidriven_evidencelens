/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#111827', // Dark gray
                primary: '#D8B4FE', // Neon Purple
                secondary: '#22D3EE', // Neon Cyan
            },
            fontFamily: {
                sans: ['"M PLUS Rounded 1c"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
