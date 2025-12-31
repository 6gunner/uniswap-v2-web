module.exports = {
  // root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ["@repo/eslint-config/react-internal"],
  rules: {
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    quotes: "off",
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
  },
};
