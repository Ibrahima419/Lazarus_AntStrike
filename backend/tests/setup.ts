/**
 * 🧪 Test Setup
 * Configuration globale pour les tests
 */

// Augmenter timeout pour tests d'intégration
jest.setTimeout(30000);

// Mock console pour réduire le bruit pendant les tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Variables d'environnement pour tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/antstrike_test';
process.env.TARANIS_API_URL = 'http://localhost:8080';
process.env.BACKEND_URL = 'http://localhost:4000';




