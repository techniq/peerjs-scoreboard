const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

module.exports = {
	content: ['./src/**/*.{html,svelte}', './node_modules/svelte-ux/**/*.{svelte,js}'],
	theme: {
		extend: {
			colors: {
				'color-var': 'var(--color)',
				accent: colors.blue
			}
		}
	},
	variants: {
		extend: {}
	},
	plugins: [require('svelte-ux/plugins/tailwind.cjs')],
	// Remove hover on mobile - https://github.com/tailwindlabs/tailwindcss/pull/8394
	future: {
		hoverOnlyWhenSupported: true
	}
};
