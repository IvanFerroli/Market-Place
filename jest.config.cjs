const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  testMatch: ["<rootDir>/tests/unit/**/*.test.{ts,tsx}"],

  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/tests/e2e/",
    "<rootDir>/playwright-report/",
    "<rootDir>/test-results/",
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!app/**/layout.tsx",
    "!app/**/not-found.tsx",
    "!app/**/sitemap.ts",
  ],

  coveragePathIgnorePatterns: ["<rootDir>/app/api/"],

  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text-summary", "html", "lcov"],
};

module.exports = createJestConfig(customJestConfig);
