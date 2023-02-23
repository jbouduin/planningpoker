/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  "roots": [
    "./test"
  ],
  "testMatch": [
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      { tsconfig: 'tsconfig.json' }
    ]
  },
  "setupFiles": [
    './test/init.ts'
  ],
  "testPathIgnorePatterns": [
    "do-not-commit.*"
  ],
  "collectCoverageFrom": [
    "**/objects/team.ts",
    "**/services/implementation/handler.service.ts",
    "**/services/implementation/preflight.service.ts",
    "**/storage/implementation/storage.service.ts",
    "!**/*.types.*",
    "!**/index.ts",
    "!**/do-not-commit*"
  ]
};