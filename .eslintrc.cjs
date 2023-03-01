module.exports = {
  extends: [require.resolve('@scrawllife/fabric/dist/eslint')],
  rules: {
    // your rules
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 0,
    'import/no-unresolved': [2, { caseSensitiveStrict: true }],
  },
  extraFileExtensions: ['*.ts', '*.cjs'],
};
