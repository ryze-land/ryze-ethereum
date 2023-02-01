module.exports = {
    'env': {
        'commonjs': true,
        'es2021': true,
        'node': true,
    },
    'parser': '@typescript-eslint/parser',
    'plugins': ['@typescript-eslint'],
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        '@ryze-blockchain/eslint-config',
    ],
    'ignorePatterns': ['index.d.ts'],
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module',
    },
}
