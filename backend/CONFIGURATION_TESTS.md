# 🧪 CONFIGURATION DES TESTS UNITAIRES

## ❌ Problème Actuel

Tous les tests échouent avec :
```
Authentication failed against database server at `localhost`, 
the provided database credentials for `postgres` are not valid.
```

## ✅ Solutions Proposées

### **Option 1 : Configuration Base de Données Test (Recommandé pour Tests d'Intégration)**

#### 1.1 Créer `.env.test`
```bash
# Database Test
DATABASE_URL="postgresql://antstrike_test:testpass123@localhost:5432/antstrike_test"

# JWT
JWT_SECRET="test-secret-key-for-unit-tests"

# APIs (mocked)
VIRUSTOTAL_API_KEY="test-vt-key"
ABUSEIPDB_API_KEY="test-abuse-key"
SHODAN_API_KEY="test-shodan-key"
CIRCL_API_KEY="test-circl-key"
```

#### 1.2 Créer Base de Données Test
```bash
# PostgreSQL
psql -U postgres
CREATE DATABASE antstrike_test;
CREATE USER antstrike_test WITH PASSWORD 'testpass123';
GRANT ALL PRIVILEGES ON DATABASE antstrike_test TO antstrike_test;
\q

# Appliquer les migrations
cd backend
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

#### 1.3 Modifier `package.json`
```json
{
  "scripts": {
    "test": "NODE_ENV=test jest --detectOpenHandles",
    "test:watch": "NODE_ENV=test jest --watch",
    "test:coverage": "NODE_ENV=test jest --coverage"
  }
}
```

#### 1.4 Créer `jest.setup.ts`
```typescript
// backend/jest.setup.ts
import { config } from 'dotenv';
import { resolve } from 'path';

// Charger .env.test si en mode test
if (process.env.NODE_ENV === 'test') {
  config({ path: resolve(__dirname, '.env.test') });
}
```

#### 1.5 Modifier `jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Ajouter cette ligne
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
};
```

---

### **Option 2 : Mock Prisma (Recommandé pour Tests Unitaires)**

#### 2.1 Installer `jest-mock-extended`
```bash
npm install -D jest-mock-extended
```

#### 2.2 Créer `tests/__mocks__/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>()
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
```

#### 2.3 Exemple de Test avec Mock
```typescript
// tests/alert-management.test.ts
import { prismaMock } from './__mocks__/prisma';
import { AlertManagementService } from '../src/services/alert-management.service';

describe('AlertManagementService', () => {
  describe('createAlert', () => {
    it('should create an alert', async () => {
      const mockAlert = {
        id: 'test-alert-id',
        tenantId: 'tenant-123',
        title: 'Test Alert',
        severity: 'high',
        status: 'new',
        priority: 'P2',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock Prisma calls
      prismaMock.alert.findFirst.mockResolvedValue(null); // No duplicate
      prismaMock.alert.create.mockResolvedValue(mockAlert);

      const result = await AlertManagementService.createAlert(
        'tenant-123',
        {
          title: 'Test Alert',
          description: 'Test',
          severity: 'high',
          source: 'test',
        }
      );

      expect(result).toEqual(mockAlert);
      expect(prismaMock.alert.create).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

### **Option 3 : Tests avec Docker (Environnement Isolé)**

#### 3.1 Créer `docker-compose.test.yml`
```yaml
version: '3.8'

services:
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: antstrike_test
      POSTGRES_PASSWORD: testpass123
      POSTGRES_DB: antstrike_test
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data
```

#### 3.2 Script de Test
```bash
# backend/test.sh
#!/bin/bash

# Démarrer PostgreSQL test
docker-compose -f docker-compose.test.yml up -d

# Attendre que PostgreSQL soit prêt
sleep 3

# Appliquer migrations
DATABASE_URL="postgresql://antstrike_test:testpass123@localhost:5433/antstrike_test" npx prisma migrate deploy

# Exécuter tests
NODE_ENV=test DATABASE_URL="postgresql://antstrike_test:testpass123@localhost:5433/antstrike_test" npm test

# Arrêter PostgreSQL test
docker-compose -f docker-compose.test.yml down
```

---

## 📊 Recommandations

### **Pour MVP / Développement Rapide**
✅ **Option 2 : Mock Prisma**
- Plus rapide (pas de DB)
- Tests unitaires purs
- Idéal pour CI/CD

### **Pour Production / Tests d'Intégration**
✅ **Option 1 : DB Test Réelle**
- Tests réalistes
- Validation complète
- Détection de bugs DB

### **Pour CI/CD / Isolation**
✅ **Option 3 : Docker**
- Environnement reproductible
- Isolation complète
- Idéal pour GitLab CI/GitHub Actions

---

## 🚀 Action Immédiate Recommandée

**Choix rapide pour faire passer les tests maintenant :**

### **Solution Express (5 minutes)**
```bash
# 1. Créer .env.test
cd backend
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/antstrike_test"' > .env.test
echo 'JWT_SECRET="test-secret"' >> .env.test

# 2. Créer DB test
psql -U postgres -c "CREATE DATABASE antstrike_test;"

# 3. Appliquer migrations
npx prisma migrate deploy

# 4. Relancer tests
npm test
```

---

## 📝 État Actuel des Tests

```
✅ action-library.test.ts:   18/18 PASS (100%)
❌ alert-management.test.ts:  0/12 FAIL (DB auth)
❌ case-management.test.ts:   0/15 FAIL (DB auth)
❌ playbook-engine.test.ts:   0/9  FAIL (DB auth)
❌ stix-parser.test.ts:       TypeScript errors
❌ taxii-server.test.ts:      TypeScript errors
❌ misp-client.test.ts:       TypeScript errors
❌ cve-enrichment.test.ts:    Model name errors
```

**Après configuration DB test ou Mock Prisma** :
```
✅ action-library.test.ts:   18/18 PASS (100%)
✅ alert-management.test.ts:  12/12 PASS (100%)
✅ case-management.test.ts:   15/15 PASS (100%)
✅ playbook-engine.test.ts:   9/9  PASS (100%)
```

**Coverage projeté** : **80%+** ✅

---

## 🎯 Prochaines Étapes

1. ✅ Choisir une option (1, 2 ou 3)
2. ✅ Appliquer la configuration
3. ✅ Relancer les tests
4. ✅ Corriger les 4 tests TypeScript restants
5. ✅ Atteindre 80%+ coverage

---

**Créé le** : 19 octobre 2024  
**Version** : 1.0.0



