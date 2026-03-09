module.exports = {
  preset: "ts-jest/presets/default-esm",

  testEnvironment: "node",

  roots: ["<rootDir>/tests"],

  extensionsToTreatAsEsm: [".ts"],

  moduleFileExtensions: ["ts", "js", "json"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.json",
        diagnostics: {
          ignoreCodes: [151002]
        }
      }
    ]
  },

  // optional but recommended
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};