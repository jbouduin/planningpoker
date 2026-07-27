import { Config } from 'jest';

const jestConfig: Config = {
  roots: ['./dist/test'],
  testEnvironment: 'node',
  collectCoverage: false
};

export default jestConfig;
