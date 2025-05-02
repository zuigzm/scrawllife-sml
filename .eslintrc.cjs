module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    // 自定义规则
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 0,
    'import/no-unresolved': [2, { caseSensitiveStrict: true }],
    // 放宽一些规则以适应项目需求
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'no-underscore-dangle': 'off',
  },
  ignorePatterns: ['bin/**/*', 'node_modules/**/*'],
};
