// jest.config.js
const config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node', // Or 'jsdom' if testing browser-specific code
  roots: ['<rootDir>/test'], // Assuming your source files are in a 'src' directory
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      'ts-jest': {
        tsconfig: './tsconfig.json',
        useESM: true,
      },
    }],
  }
};




export default config;