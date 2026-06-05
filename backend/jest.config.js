/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  globalSetup: '<rootDir>/jest.global-setup.js',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  clearMocks: true,
};
