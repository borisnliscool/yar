/** @type {import('tailwindcss').Config} */
export default {
	// I'm pretty sure there's a better way of doing this, but can't be bothered to figure that out
	content: ['./src/**/*.{html,js,svelte,ts}', '../../packages/ui/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [],
	darkMode: 'class'
};
