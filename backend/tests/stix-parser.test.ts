/**
 * 🧪 STIX Parser Tests
 */

import { STIXParserService } from '../src/services/stix-parser.service';
import { v4 as uuidv4 } from 'uuid';

describe('STIX Parser Service', () => {
  describe('parseBundle', () => {
    it('should parse a valid STIX 2.1 bundle', () => {
      const bundle = {
        type: 'bundle',
        id: `bundle--${uuidv4()}`,
        spec_version: '2.1',
        objects: [
          {
            type: 'indicator',
            spec_version: '2.1',
            id: `indicator--${uuidv4()}`,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            pattern: "[ipv4-addr:value = '192.168.1.1']",
            pattern_type: 'stix',
            valid_from: new Date().toISOString(),
            name: 'Malicious IP',
            description: 'Test malicious IP address'
          }
        ]
      };

      const result = STIXParserService.parseBundle(bundle);

      expect(result).toBeDefined();
      expect(result.indicators).toHaveLength(1);
      expect(result.indicators[0].pattern).toBe("[ipv4-addr:value = '192.168.1.1']");
    });

    it('should extract multiple indicators from bundle', () => {
      const bundle = {
        type: 'bundle',
        id: `bundle--${uuidv4()}`,
        spec_version: '2.1',
        objects: [
          {
            type: 'indicator',
            spec_version: '2.1',
            id: `indicator--${uuidv4()}`,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            pattern: "[ipv4-addr:value = '192.168.1.1']",
            pattern_type: 'stix',
            valid_from: new Date().toISOString()
          },
          {
            type: 'indicator',
            spec_version: '2.1',
            id: `indicator--${uuidv4()}`,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            pattern: "[domain-name:value = 'malicious.com']",
            pattern_type: 'stix',
            valid_from: new Date().toISOString()
          }
        ]
      };

      const result = STIXParserService.parseBundle(bundle);

      expect(result.indicators).toHaveLength(2);
    });

    it('should handle empty bundle', () => {
      const bundle = {
        type: 'bundle',
        id: `bundle--${uuidv4()}`,
        spec_version: '2.1',
        objects: []
      };

      const result = STIXParserService.parseBundle(bundle);

      expect(result.indicators).toHaveLength(0);
    });
  });

  describe('extractIOCs', () => {
    it('should extract IP from STIX pattern', () => {
      const pattern = "[ipv4-addr:value = '8.8.8.8']";
      const iocs = STIXParserService.extractIOCsFromPattern(pattern);

      expect(iocs).toContain('8.8.8.8');
    });

    it('should extract domain from STIX pattern', () => {
      const pattern = "[domain-name:value = 'example.com']";
      const iocs = STIXParserService.extractIOCsFromPattern(pattern);

      expect(iocs).toContain('example.com');
    });

    it('should extract URL from STIX pattern', () => {
      const pattern = "[url:value = 'http://malicious.com/payload']";
      const iocs = STIXParserService.extractIOCsFromPattern(pattern);

      expect(iocs).toContain('http://malicious.com/payload');
    });

    it('should extract file hash from STIX pattern', () => {
      const pattern = "[file:hashes.'SHA-256' = 'abc123def456']";
      const iocs = STIXParserService.extractIOCsFromPattern(pattern);

      expect(iocs).toContain('abc123def456');
    });

    it('should extract email from STIX pattern', () => {
      const pattern = "[email-addr:value = 'attacker@evil.com']";
      const iocs = STIXParserService.extractIOCsFromPattern(pattern);

      expect(iocs).toContain('attacker@evil.com');
    });

    it('should extract CVE from STIX pattern', () => {
      const pattern = "[vulnerability:name = 'CVE-2024-1234']";
      const iocs = STIXParserService.extractIOCsFromPattern(pattern);

      expect(iocs).toContain('CVE-2024-1234');
    });

    it('should handle complex patterns with multiple IOCs', () => {
      const pattern = "[ipv4-addr:value = '192.168.1.1' AND domain-name:value = 'evil.com']";
      const iocs = STIXParserService.extractIOCsFromPattern(pattern);

      expect(iocs).toContain('192.168.1.1');
      expect(iocs).toContain('evil.com');
    });

    it('should return empty array for invalid pattern', () => {
      const pattern = "invalid pattern format";
      const iocs = STIXParserService.extractIOCsFromPattern(pattern);

      expect(iocs).toHaveLength(0);
    });
  });

  describe('validateBundle', () => {
    it('should validate correct STIX bundle structure', () => {
      const bundle = {
        type: 'bundle',
        id: `bundle--${uuidv4()}`,
        spec_version: '2.1',
        objects: []
      };

      const result = STIXParserService.validateBundle(bundle);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject bundle without type', () => {
      const bundle: any = {
        id: `bundle--${uuidv4()}`,
        objects: []
      };

      const result = STIXParserService.validateBundle(bundle);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Bundle must have type "bundle"');
    });

    it('should reject bundle without id', () => {
      const bundle: any = {
        type: 'bundle',
        objects: []
      };

      const result = STIXParserService.validateBundle(bundle);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject bundle without objects array', () => {
      const bundle: any = {
        type: 'bundle',
        id: `bundle--${uuidv4()}`
      };

      const result = STIXParserService.validateBundle(bundle);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Bundle must have objects array');
    });

    it('should accept bundle with spec_version 2.1', () => {
      const bundle = {
        type: 'bundle',
        id: `bundle--${uuidv4()}`,
        spec_version: '2.1',
        objects: []
      };

      const result = STIXParserService.validateBundle(bundle);

      expect(result.valid).toBe(true);
    });
  });

  describe('createTestStixBundle', () => {
    it('should create valid test bundle', () => {
      const bundle = STIXParserService.createTestStixBundle();

      expect(bundle.type).toBe('bundle');
      expect(bundle.id).toMatch(/^bundle--/);
      expect(bundle.spec_version).toBe('2.1');
      expect(Array.isArray(bundle.objects)).toBe(true);
      expect(bundle.objects.length).toBeGreaterThan(0);
    });

    it('should create bundle with indicators', () => {
      const bundle = STIXParserService.createTestStixBundle();

      const indicators = bundle.objects.filter((obj: any) => obj.type === 'indicator');
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('should create valid indicator objects', () => {
      const bundle = STIXParserService.createTestStixBundle();
      const indicator = bundle.objects[0] as any;

      expect(indicator.type).toBe('indicator');
      expect(indicator.spec_version).toBe('2.1');
      expect(indicator.id).toMatch(/^indicator--/);
      expect(indicator.pattern).toBeDefined();
      expect(indicator.pattern_type).toBe('stix');
      expect(indicator.valid_from).toBeDefined();
    });
  });

  describe('exportIOCsToSTIX', () => {
    it('should export IOCs to STIX bundle', () => {
      const iocs = [
        { type: 'IP', value: '192.168.1.1' },
        { type: 'DOMAIN', value: 'malicious.com' },
        { type: 'FILE_HASH', value: 'abc123def456' }
      ];

      const bundle = STIXParserService.exportIOCsToSTIX(iocs);

      expect(bundle.type).toBe('bundle');
      expect(bundle.objects).toHaveLength(3);
      expect(bundle.objects.every((obj: any) => obj.type === 'indicator')).toBe(true);
    });

    it('should create correct pattern for IP', () => {
      const iocs = [{ type: 'IP', value: '8.8.8.8' }];
      const bundle = STIXParserService.exportIOCsToSTIX(iocs);
      const indicator = bundle.objects[0] as any;

      expect(indicator.pattern).toBe("[ipv4-addr:value = '8.8.8.8']");
    });

    it('should create correct pattern for domain', () => {
      const iocs = [{ type: 'DOMAIN', value: 'example.com' }];
      const bundle = STIXParserService.exportIOCsToSTIX(iocs);
      const indicator = bundle.objects[0] as any;

      expect(indicator.pattern).toBe("[domain-name:value = 'example.com']");
    });

    it('should create correct pattern for URL', () => {
      const iocs = [{ type: 'URL', value: 'http://evil.com' }];
      const bundle = STIXParserService.exportIOCsToSTIX(iocs);
      const indicator = bundle.objects[0] as any;

      expect(indicator.pattern).toBe("[url:value = 'http://evil.com']");
    });

    it('should handle empty IOC list', () => {
      const bundle = STIXParserService.exportIOCsToSTIX([]);

      expect(bundle.objects).toHaveLength(0);
    });
  });
});




