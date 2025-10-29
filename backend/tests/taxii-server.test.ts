/**
 * 🧪 TAXII Server Tests
 */

import { TAXIIServerService } from '../src/services/taxii-server.service';

describe('TAXII Server Service', () => {
  const mockTenantId = 'test-tenant-id';

  describe('getDiscovery', () => {
    it('should return TAXII discovery response', () => {
      const discovery = TAXIIServerService.getDiscovery();

      expect(discovery).toBeDefined();
      expect(discovery.title).toBe('AntStrike CTI TAXII Server');
      expect(discovery.api_roots).toBeDefined();
      expect(Array.isArray(discovery.api_roots)).toBe(true);
    });

    it('should include contact information', () => {
      const discovery = TAXIIServerService.getDiscovery();

      expect(discovery.contact).toBe('support@antstrike-cti.com');
    });

    it('should include API root URL', () => {
      const discovery = TAXIIServerService.getDiscovery();

      expect(discovery.api_roots.length).toBeGreaterThan(0);
      expect(discovery.api_roots[0]).toContain('/taxii/');
    });
  });

  describe('getAPIRoot', () => {
    it('should return API root information', () => {
      const apiRoot = TAXIIServerService.getAPIRoot();

      expect(apiRoot).toBeDefined();
      expect(apiRoot.title).toBe('AntStrike CTI TAXII Server');
      expect(apiRoot.versions).toContain('application/taxii+json;version=2.1');
    });

    it('should include max content length', () => {
      const apiRoot = TAXIIServerService.getAPIRoot();

      expect(apiRoot.max_content_length).toBe(10485760); // 10MB
    });

    it('should include collections URL', () => {
      const apiRoot = TAXIIServerService.getAPIRoot();

      expect(apiRoot.collections).toContain('/taxii/collections/');
    });
  });

  describe('getCollections', () => {
    it('should return list of collections', async () => {
      const result = await TAXIIServerService.getCollections(mockTenantId);

      expect(result).toBeDefined();
      expect(result.collections).toBeDefined();
      expect(Array.isArray(result.collections)).toBe(true);
      expect(result.collections.length).toBeGreaterThan(0);
    });

    it('should include indicators collection', async () => {
      const result = await TAXIIServerService.getCollections(mockTenantId);

      const indicators = result.collections.find(c => c.id === 'indicators');
      expect(indicators).toBeDefined();
      expect(indicators?.title).toContain('IOCs');
      expect(indicators?.can_read).toBe(true);
      expect(indicators?.can_write).toBe(true);
    });

    it('should include threats collection', async () => {
      const result = await TAXIIServerService.getCollections(mockTenantId);

      const threats = result.collections.find(c => c.id === 'threats');
      expect(threats).toBeDefined();
      expect(threats?.title).toContain('Threat');
    });

    it('should include campaigns collection', async () => {
      const result = await TAXIIServerService.getCollections(mockTenantId);

      const campaigns = result.collections.find(c => c.id === 'campaigns');
      expect(campaigns).toBeDefined();
    });

    it('should include attack-patterns collection', async () => {
      const result = await TAXIIServerService.getCollections(mockTenantId);

      const attackPatterns = result.collections.find(c => c.id === 'attack-patterns');
      expect(attackPatterns).toBeDefined();
      expect(attackPatterns?.can_read).toBe(true);
      expect(attackPatterns?.can_write).toBe(false); // Read-only
    });

    it('should specify supported media types', async () => {
      const result = await TAXIIServerService.getCollections(mockTenantId);

      result.collections.forEach(collection => {
        expect(collection.media_types).toContain('application/taxii+json;version=2.1');
      });
    });
  });

  describe('getCollection', () => {
    it('should return specific collection', async () => {
      const collection = await TAXIIServerService.getCollection(mockTenantId, 'indicators');

      expect(collection).toBeDefined();
      expect(collection?.id).toBe('indicators');
    });

    it('should return null for non-existent collection', async () => {
      const collection = await TAXIIServerService.getCollection(mockTenantId, 'non-existent');

      expect(collection).toBeNull();
    });

    it('should return collection with read/write permissions', async () => {
      const collection = await TAXIIServerService.getCollection(mockTenantId, 'indicators');

      expect(collection?.can_read).toBeDefined();
      expect(collection?.can_write).toBeDefined();
    });
  });

  describe('checkCollectionPermissions', () => {
    it('should allow read on indicators collection', async () => {
      const canRead = await TAXIIServerService.checkCollectionPermissions(
        mockTenantId,
        'indicators',
        'read'
      );

      expect(canRead).toBe(true);
    });

    it('should allow write on indicators collection', async () => {
      const canWrite = await TAXIIServerService.checkCollectionPermissions(
        mockTenantId,
        'indicators',
        'write'
      );

      expect(canWrite).toBe(true);
    });

    it('should deny write on attack-patterns collection', async () => {
      const canWrite = await TAXIIServerService.checkCollectionPermissions(
        mockTenantId,
        'attack-patterns',
        'write'
      );

      expect(canWrite).toBe(false);
    });

    it('should return false for non-existent collection', async () => {
      const canRead = await TAXIIServerService.checkCollectionPermissions(
        mockTenantId,
        'non-existent',
        'read'
      );

      expect(canRead).toBe(false);
    });
  });

  describe('iocToSTIXIndicator', () => {
    it('should convert IP IOC to STIX indicator', () => {
      const ioc = {
        id: 'test-id',
        iocValue: '192.168.1.1',
        iocType: 'IP',
        createdAt: new Date(),
        lastEnriched: new Date(),
        enrichmentData: {}
      };

      const indicator = (TAXIIServerService as any).iocToSTIXIndicator(ioc);

      expect(indicator.type).toBe('indicator');
      expect(indicator.pattern).toContain('192.168.1.1');
      expect(indicator.pattern).toMatch(/ipv4-addr:value/);
    });

    it('should convert domain IOC to STIX indicator', () => {
      const ioc = {
        id: 'test-id',
        iocValue: 'malicious.com',
        iocType: 'DOMAIN',
        createdAt: new Date(),
        lastEnriched: new Date(),
        enrichmentData: {}
      };

      const indicator = (TAXIIServerService as any).iocToSTIXIndicator(ioc);

      expect(indicator.pattern).toContain('malicious.com');
      expect(indicator.pattern).toMatch(/domain-name:value/);
    });

    it('should include confidence score', () => {
      const ioc = {
        id: 'test-id',
        iocValue: '192.168.1.1',
        iocType: 'IP',
        createdAt: new Date(),
        lastEnriched: new Date(),
        enrichmentData: {
          ipData: { totalReports: 100 }
        }
      };

      const indicator = (TAXIIServerService as any).iocToSTIXIndicator(ioc);

      expect(indicator.confidence).toBeDefined();
      expect(typeof indicator.confidence).toBe('number');
      expect(indicator.confidence).toBeGreaterThanOrEqual(0);
      expect(indicator.confidence).toBeLessThanOrEqual(100);
    });

    it('should include labels', () => {
      const ioc = {
        id: 'test-id',
        iocValue: '192.168.1.1',
        iocType: 'IP',
        createdAt: new Date(),
        lastEnriched: new Date(),
        enrichmentData: {
          ipData: { reputation: 'malicious' }
        }
      };

      const indicator = (TAXIIServerService as any).iocToSTIXIndicator(ioc);

      expect(Array.isArray(indicator.labels)).toBe(true);
      expect(indicator.labels.length).toBeGreaterThan(0);
    });
  });

  describe('createSTIXPattern', () => {
    it('should create pattern for IP', () => {
      const pattern = (TAXIIServerService as any).createSTIXPattern('8.8.8.8', 'IP');

      expect(pattern).toBe("[ipv4-addr:value = '8.8.8.8']");
    });

    it('should create pattern for domain', () => {
      const pattern = (TAXIIServerService as any).createSTIXPattern('example.com', 'DOMAIN');

      expect(pattern).toBe("[domain-name:value = 'example.com']");
    });

    it('should create pattern for URL', () => {
      const pattern = (TAXIIServerService as any).createSTIXPattern('http://evil.com', 'URL');

      expect(pattern).toBe("[url:value = 'http://evil.com']");
    });

    it('should create pattern for email', () => {
      const pattern = (TAXIIServerService as any).createSTIXPattern('bad@evil.com', 'EMAIL');

      expect(pattern).toBe("[email-addr:value = 'bad@evil.com']");
    });

    it('should create pattern for CVE', () => {
      const pattern = (TAXIIServerService as any).createSTIXPattern('CVE-2024-1234', 'CVE');

      expect(pattern).toBe("[vulnerability:name = 'CVE-2024-1234']");
    });

    it('should create MD5 hash pattern', () => {
      const hash = 'd41d8cd98f00b204e9800998ecf8427e'; // 32 chars = MD5
      const pattern = (TAXIIServerService as any).createHashPattern(hash);

      expect(pattern).toContain('MD5');
      expect(pattern).toContain(hash);
    });

    it('should create SHA-1 hash pattern', () => {
      const hash = 'da39a3ee5e6b4b0d3255bfef95601890afd80709'; // 40 chars = SHA-1
      const pattern = (TAXIIServerService as any).createHashPattern(hash);

      expect(pattern).toContain('SHA-1');
      expect(pattern).toContain(hash);
    });

    it('should create SHA-256 hash pattern', () => {
      const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // 64 chars
      const pattern = (TAXIIServerService as any).createHashPattern(hash);

      expect(pattern).toContain('SHA-256');
      expect(pattern).toContain(hash);
    });
  });

  describe('calculateConfidence', () => {
    it('should calculate base confidence', () => {
      const ioc = { enrichmentData: {} };
      const confidence = (TAXIIServerService as any).calculateConfidence(ioc);

      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it('should increase confidence with sources', () => {
      const iocWithoutSources = { enrichmentData: {} };
      const iocWithSources = {
        enrichmentData: {
          ipData: { sources: ['source1', 'source2', 'source3'] }
        }
      };

      const confidenceWithout = (TAXIIServerService as any).calculateConfidence(iocWithoutSources);
      const confidenceWith = (TAXIIServerService as any).calculateConfidence(iocWithSources);

      expect(confidenceWith).toBeGreaterThan(confidenceWithout);
    });

    it('should increase confidence with high detections', () => {
      const ioc = {
        enrichmentData: {
          fileData: { detections: 15 }
        }
      };

      const confidence = (TAXIIServerService as any).calculateConfidence(ioc);

      expect(confidence).toBeGreaterThan(50);
    });

    it('should cap confidence at 100', () => {
      const ioc = {
        enrichmentData: {
          ipData: {
            sources: Array(20).fill('source'),
            totalReports: 1000
          },
          fileData: { detections: 50 }
        }
      };

      const confidence = (TAXIIServerService as any).calculateConfidence(ioc);

      expect(confidence).toBeLessThanOrEqual(100);
    });
  });
});




