
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');
const playwrightPlugin = require('eslint-plugin-playwright');

module.exports = [
	{ ignores: ['node_modules/**', 'dist/**', 'coverage/**', '.playwright/**'] },
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: ['./tsconfig.json'],
				tsconfigRootDir: __dirname,
				sourceType: 'module',
			},
		},
		plugins: { '@typescript-eslint': tsPlugin, prettier: prettierPlugin, playwright: playwrightPlugin },
		rules: {
			'prettier/prettier': 'error',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
		},
	},
	{
		files: ['tests/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
];

