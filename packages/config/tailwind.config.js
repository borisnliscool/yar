/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'../../packages/ui/components/**/*.{html,js,svelte,ts}',
	],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#f0f8ff',
					100: '#dff1ff',
					200: '#b8e4ff',
					300: '#7acfff',
					400: '#33b8fd',
					500: '#13a8f7',
					600: '#007fcc',
					700: '#0064a5',
					800: '#045588',
					900: '#094771',
					950: '#062d4b',
				},
				secondary: {
					50: '#fff7ed',
					100: '#ffedd4',
					200: '#ffd7a9',
					300: '#ffbb72',
					400: '#fe9339',
					500: '#fd7312',
					600: '#ec5708',
					700: '#c54109',
					800: '#9c3410',
					900: '#7e2c10',
					950: '#441306',
				},
			},
		},
	},
	plugins: [],
	darkMode: 'class',
};
