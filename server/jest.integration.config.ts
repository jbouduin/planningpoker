import { Config } from 'jest';

const jestConfig: Config = {
  roots: ['./dist/test/test/integration'],
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'reports/integration/coverage',
  collectCoverageFrom: [
    'dist/test/**/storage/implementation/*.js',
    'dist/test/**/services/implementation/*.js',
    '!**/services/implementation/cron.service.js',
    '!**/services/implementation/environment.service.js',
    '!**/services/implementation/logger.service.js',
    '!**/services/implementation/route.service.js',
    '!**/services/implementation/sender.service.js',
    '!**/services/implementation/serialization.service.js',
    '!**/services/implementation/socket.service.js',
    '!**/*.types.*',
    '!**/index.js',
    '!**/do-not-commit*'
  ],
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: 'Planning poker server test suite',
        outputPath: 'reports/integration/jest/index.html',
        includeFailureMsg: true
        // "styleOverridePath": "src/teststyle.css"
      }
    ]
  ]
};

export default jestConfig;
