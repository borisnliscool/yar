import pluginJs from '@eslint/js';
import turboEslint from 'eslint-config-turbo/flat';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
	...turboEslint,
	{ ignores: ['**/dist/**'] },
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules: {
			'no-undef': 'off',
		},
	},
];
