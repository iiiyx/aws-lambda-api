module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@functions/(.*)$": "<rootDir>/src/functions/$1",
    "^@common/(.*)$": "<rootDir>/../common/src/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
};
