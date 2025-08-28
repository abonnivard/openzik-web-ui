// Jest configuration for Create React App
const { createJestConfig } = require('@craco/craco');

const jestConfig = createJestConfig({
  eslint: {
    enable: false,
  },
  jest: {
    configure: {
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/index.js',
        '!src/reportWebVitals.js',
        '!src/**/*.test.{js,jsx}',
        '!src/__tests__/**',
      ],
      coverageReporters: ['text', 'lcov', 'html'],
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
        '<rootDir>/src/**/*.{spec,test}.{js,jsx}',
      ],
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$',
      ],
    },
  },
});

module.exports = jestConfig;
