/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Public Sans"', "system-ui", "sans-serif"],
				display: ['"Space Grotesk"', "system-ui", "sans-serif"],
			},
			colors: {
				primary: {
					50: "#ecfdfb",
					100: "#d1faf5",
					200: "#a7f3eb",
					300: "#5eead4",
					400: "#2dd4bf",
					500: "#14b8a6",
					600: "#0f766e",
					700: "#0f5f56",
					800: "#134e4a",
					900: "#0f3d39",
				},
			},
		},
	},
	plugins: [],
};
