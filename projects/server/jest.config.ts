import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  roots: [
    "./test"
  ],
  testEnvironment: "node",
  testMatch: [
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    // "^.+\\.(ts|tsx)$":
    '^.+\\.m?[tj]sx?$':
      [
        "ts-jest",
        { tsconfig: 'tsconfig.json' }
      ]
  },
  "transformIgnorePatterns": [
    "node_modules/(?!moq\.ts)"
  ],
  setupFiles: [
    './test/init.ts'
  ],
  testPathIgnorePatterns: [
    "do-not-commit.*"
  ],
  coverageDirectory: "reports/coverage",
  collectCoverageFrom: [
    "**/objects/team.ts",
    "**/services/implementation/handler.service.ts",
    "**/services/implementation/preflight.service.ts",
    "**/storage/implementation/storage.service.ts",
    "!**/*.types.*",
    "!**/index.ts",
    "!**/do-not-commit*"
  ],
  reporters: [
    "default",
    [
      "./node_modules/jest-html-reporter",
      {
        "pageTitle": "Planning poker server test suite",
        "outputPath": "reports/jest/index.html",
        "includeFailureMsg": true,
        // "styleOverridePath": "src/teststyle.css"
      }
    ]
  ]
};

export default jestConfig;