/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#000000", // Pure Black
                surface: "#0a0a0a", // Almost Black for cards
                primary: "#FF0000", // Bright Red
                secondary: "#cf0000", // Darker Red for gradients
                muted: "#888888",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // We will use Inter but style it heavily
                display: ['Montserrat', 'sans-serif'], // For the bold headers
            },
            boxShadow: {
                'glow-red': '0 0 20px rgba(255, 0, 0, 0.5)',
                'glow-text': '0 0 10px rgba(255, 255, 255, 0.2)',
            },
            backgroundImage: {
                'gradient-text': 'linear-gradient(to right, #ffffff, #ff0000)',
            }
        },
    },
    plugins: [],
}
