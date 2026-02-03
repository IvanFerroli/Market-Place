const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // pega .test.ts e .test.tsx
  testMatch: ["<rootDir>/tests/unit/**/*.test.{ts,tsx}"],

  // ignores (unificado: antes tava duplicado e sobrescrevia)
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/tests/e2e/",
    "<rootDir>/playwright-report/",
    "<rootDir>/test-results/",
  ],

  // alias do tsconfig + mocks de style
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  // coverage
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

  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text-summary", "html", "lcov"],
};

module.exports = createJestConfig(customJestConfig);
