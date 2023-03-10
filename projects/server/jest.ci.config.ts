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
  ]
};

export default jestConfig;