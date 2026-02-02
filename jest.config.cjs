const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // alias do tsconfig
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "!**/*.d.ts",

    // normalmente não vale a pena forçar coverage aqui:
    "!app/**/layout.tsx",
    "!app/**/not-found.tsx",
    "!app/**/sitemap.ts",
  ],

  coveragePathIgnorePatterns: [
    "<rootDir>/app/api/", // pode remover isso quando formos testar API routes
  ],
};

module.exports = createJestConfig(customJestConfig);
