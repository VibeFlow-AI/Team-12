const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-node',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  testMatch: [
    '**/__tests__/**/*.(test|spec).{js,jsx,ts,tsx}',
  ],
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/**/*.(test|spec).{js,ts}',
        '!<rootDir>/__tests__/**/*.component.(test|spec).{js,jsx,ts,tsx}',
        '!<rootDir>/__tests__/components/**/*',
      ],
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/__tests__/**/*.component.(test|spec).{js,jsx,ts,tsx}',
        '<rootDir>/__tests__/components/**/*.(test|spec).{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
  ],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!app/layout.tsx',
    '!app/page.tsx',
    '!**/prisma/**',
    '!lib/generated/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 