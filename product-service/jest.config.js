module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@libs/(.*)$": "<rootDir>/src/libs/$1",
    "^@functions/(.*)$": "<rootDir>/src/functions/$1",
    "^@mocks/(.*)$": "<rootDir>/src/mocks/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
};
