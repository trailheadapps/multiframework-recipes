const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

module.exports = {
  ...jestConfig,
  // Only the microfrontend LWC has jest tests; the React bundle has its own
  // vitest/Playwright suites (`npm test`). Scoping here keeps sfdx-lwc-jest
  // from trying to run those specs or the .sf metadata cache.
  roots: ["<rootDir>/force-app/main/microfrontend-recipes/lwc"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/.sf/",
    "<rootDir>/.localdevserver/",
    "<rootDir>/force-app/main/react-recipes/"
  ],
  modulePathIgnorePatterns: ["<rootDir>/.localdevserver"],
  moduleNameMapper: {
    // lightning/uiEmbedding (<lightning-ui-embedding>) is a Developer Preview
    // base component not covered by sfdx-lwc-jest's stubs; map it to a local mock.
    "^lightning/uiEmbedding$":
      "<rootDir>/test/jest-mocks/lightning/uiEmbedding/uiEmbedding"
  }
};
