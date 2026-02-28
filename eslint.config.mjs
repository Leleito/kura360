import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // Allow unused vars prefixed with _
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow img tags (we use next/image where needed)
      "@next/next/no-img-element": "off",
    },
  },
  {
    ignores: ["node_modules/", ".next/", "out/", "coverage/"],
  },
];

export default eslintConfig;
