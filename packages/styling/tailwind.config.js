/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,js,ts}"],
	theme: {
		extend: {},
	},
	plugins: [
		require("@iconify/tailwind")({
			icons: {
				mdi: require("@iconify-json/mdi/icons.json"),
			},
		}),
	],
};
