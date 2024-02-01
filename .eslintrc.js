module.exports = {
  parser: "babel-eslint",
  env: {
    es6: true,
    node: true,
    browser: true
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["react"],
  extends: ["react-app"],
  rules: {
    "no-undef": 0,
    "semi": [
      "warn",
      "always"
    ],
    "no-duplicate-imports": "warn",
    "no-empty-function": "warn",
    "no-var": "warn",
    "prefer-const": "warn",
    "camelcase": "off",
    "no-const-assign": "warn",
    "no-nested-ternary": "warn",
    "no-else-return": "warn",
    "no-unreachable": "warn",
    "valid-typeof": "warn",
  }
};
