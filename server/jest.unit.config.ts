import { Config } from 'jest';

const jestConfig: Config = {
  roots: ['./dist/test/test/unit'],
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'reports/unit-test/coverage',
  collectCoverageFrom: [
    '!**/objects/implementation/*.js',
    '!**/services/websocket.js',
    // "**/services/implementation/handler.service.ts",
    // "**/services/implementation/preflight.service.ts",
    // "**/storage/implementation/storage.service.ts",
    '!**/*.types.*',
    '!**/index.ts',
    '!**/do-not-commit*'
  ],
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: 'Planning poker server test suite',
        outputPath: 'reports/unit-test/jest/index.html',
        includeFailureMsg: true
        // "styleOverridePath": "src/teststyle.css"
      }
    ]
  ]
};

export default jestConfig;
