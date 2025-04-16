import defaultConfig from '@repo/eslint-config';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		ignores: [
			'**/.pnpm-store/**', // necessary for workflows
		],
	},
	...defaultConfig,
];
