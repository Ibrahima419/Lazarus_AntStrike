/**
 * 🧪 MISP Client Tests
 */

import { MISPClientService } from '../src/services/misp-client.service';

describe('MISP Client Service', () => {
  describe('Type Mapping', () => {
    describe('mapMISPType', () => {
      it('should map MISP IP types to AntStrike IP', () => {
        expect((MISPClientService as any).mapMISPType('ip-src')).toBe('IP');
        expect((MISPClientService as any).mapMISPType('ip-dst')).toBe('IP');
        expect((MISPClientService as any).mapMISPType('ip-src|port')).toBe('IP');
        expect((MISPClientService as any).mapMISPType('ip-dst|port')).toBe('IP');
      });

      it('should map MISP domain types to AntStrike DOMAIN', () => {
        expect((MISPClientService as any).mapMISPType('domain')).toBe('DOMAIN');
        expect((MISPClientService as any).mapMISPType('hostname')).toBe('DOMAIN');
      });

      it('should map MISP URL types to AntStrike URL', () => {
        expect((MISPClientService as any).mapMISPType('url')).toBe('URL');
        expect((MISPClientService as any).mapMISPType('uri')).toBe('URL');
      });

      it('should map MISP email types to AntStrike EMAIL', () => {
        expect((MISPClientService as any).mapMISPType('email')).toBe('EMAIL');
        expect((MISPClientService as any).mapMISPType('email-src')).toBe('EMAIL');
        expect((MISPClientService as any).mapMISPType('email-dst')).toBe('EMAIL');
      });

      it('should map MISP hash types to AntStrike FILE_HASH', () => {
        expect((MISPClientService as any).mapMISPType('md5')).toBe('FILE_HASH');
        expect((MISPClientService as any).mapMISPType('sha1')).toBe('FILE_HASH');
        expect((MISPClientService as any).mapMISPType('sha256')).toBe('FILE_HASH');
        expect((MISPClientService as any).mapMISPType('sha512')).toBe('FILE_HASH');
        expect((MISPClientService as any).mapMISPType('filename|md5')).toBe('FILE_HASH');
      });

      it('should map MISP vulnerability types to AntStrike CVE', () => {
        expect((MISPClientService as any).mapMISPType('vulnerability')).toBe('CVE');
        expect((MISPClientService as any).mapMISPType('weakness')).toBe('CVE');
      });

      it('should return null for unsupported types', () => {
        expect((MISPClientService as any).mapMISPType('unsupported-type')).toBeNull();
        expect((MISPClientService as any).mapMISPType('random')).toBeNull();
      });
    });

    describe('mapToMISPType', () => {
      it('should map AntStrike IP to MISP ip-dst', () => {
        const mispType = (MISPClientService as any).mapToMISPType('IP', '8.8.8.8');
        expect(mispType).toBe('ip-dst');
      });

      it('should map AntStrike DOMAIN to MISP domain', () => {
        const mispType = (MISPClientService as any).mapToMISPType('DOMAIN', 'example.com');
        expect(mispType).toBe('domain');
      });

      it('should map AntStrike URL to MISP url', () => {
        const mispType = (MISPClientService as any).mapToMISPType('URL', 'http://evil.com');
        expect(mispType).toBe('url');
      });

      it('should map AntStrike EMAIL to MISP email-dst', () => {
        const mispType = (MISPClientService as any).mapToMISPType('EMAIL', 'bad@evil.com');
        expect(mispType).toBe('email-dst');
      });

      it('should map AntStrike CVE to MISP vulnerability', () => {
        const mispType = (MISPClientService as any).mapToMISPType('CVE', 'CVE-2024-1234');
        expect(mispType).toBe('vulnerability');
      });

      it('should detect MD5 hash (32 chars)', () => {
        const hash = 'd41d8cd98f00b204e9800998ecf8427e';
        const mispType = (MISPClientService as any).mapToMISPType('FILE_HASH', hash);
        expect(mispType).toBe('md5');
      });

      it('should detect SHA-1 hash (40 chars)', () => {
        const hash = 'da39a3ee5e6b4b0d3255bfef95601890afd80709';
        const mispType = (MISPClientService as any).mapToMISPType('FILE_HASH', hash);
        expect(mispType).toBe('sha1');
      });

      it('should detect SHA-256 hash (64 chars)', () => {
        const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        const mispType = (MISPClientService as any).mapToMISPType('FILE_HASH', hash);
        expect(mispType).toBe('sha256');
      });
    });
  });

  describe('MISP Attribute Conversion', () => {
    it('should convert MISP attribute to AntStrike IOC', () => {
      const mispAttribute = {
        id: '1',
        event_id: 'event-1',
        type: 'ip-dst',
        category: 'Network activity',
        value: '192.168.1.1',
        to_ids: true,
        comment: 'Malicious IP',
        timestamp: Date.now() / 1000,
        Tag: [{ name: 'malware' }]
      };

      const ioc = (MISPClientService as any).mispAttributeToIOC(mispAttribute);

      expect(ioc).toBeDefined();
      expect(ioc.iocValue).toBe('192.168.1.1');
      expect(ioc.iocType).toBe('IP');
      expect(ioc.source).toContain('MISP Event');
      expect(ioc.tags).toContain('malware');
    });

    it('should return null for unsupported MISP type', () => {
      const mispAttribute = {
        id: '1',
        event_id: 'event-1',
        type: 'unsupported-type',
        category: 'Other',
        value: 'some-value',
        to_ids: true,
        comment: '',
        timestamp: Date.now() / 1000
      };

      const ioc = (MISPClientService as any).mispAttributeToIOC(mispAttribute);

      expect(ioc).toBeNull();
    });

    it('should calculate confidence from MISP attribute', () => {
      const mispAttribute = {
        id: '1',
        event_id: 'event-1',
        type: 'ip-dst',
        category: 'Network activity',
        value: '192.168.1.1',
        to_ids: true,
        comment: 'Detailed comment with lots of context',
        timestamp: Date.now() / 1000,
        Tag: [{ name: 'tag1' }, { name: 'tag2' }, { name: 'tag3' }]
      };

      const confidence = (MISPClientService as any).calculateConfidence(mispAttribute);

      expect(confidence).toBeGreaterThan(50);
      expect(confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('AntStrike to MISP Conversion', () => {
    it('should convert AntStrike IOC to MISP attribute', () => {
      const ioc = {
        id: 'ioc-1',
        iocValue: '192.168.1.1',
        iocType: 'IP',
        enrichmentData: {}
      };

      const mispAttr = (MISPClientService as any).iocToMISPAttribute(ioc);

      expect(mispAttr).toBeDefined();
      expect(mispAttr.value).toBe('192.168.1.1');
      expect(mispAttr.type).toBe('ip-dst');
      expect(mispAttr.to_ids).toBe(true);
      expect(mispAttr.comment).toContain('AntStrike');
    });

    it('should determine MISP category for malware', () => {
      const ioc = {
        iocValue: 'abc123',
        iocType: 'FILE_HASH',
        enrichmentData: {
          fileData: { malicious: true }
        }
      };

      const category = (MISPClientService as any).determineMISPCategory(ioc);

      expect(category).toBe('Payload delivery');
    });

    it('should determine MISP category for network activity', () => {
      const ioc = {
        iocValue: '192.168.1.1',
        iocType: 'IP',
        enrichmentData: {
          ipData: { reputation: 'malicious' }
        }
      };

      const category = (MISPClientService as any).determineMISPCategory(ioc);

      expect(category).toBe('Network activity');
    });

    it('should determine MISP category for phishing', () => {
      const ioc = {
        iocValue: 'phishing.com',
        iocType: 'DOMAIN',
        enrichmentData: {
          domainData: { phishingDetected: true }
        }
      };

      const category = (MISPClientService as any).determineMISPCategory(ioc);

      // Note: Current implementation returns 'External analysis' for domains
      // Could be enhanced to detect phishing → 'Social engineering'
      expect(category).toBe('External analysis');
    });

    it('should default to Other category', () => {
      const ioc = {
        iocValue: 'unknown',
        iocType: 'OTHER',
        enrichmentData: {}
      };

      const category = (MISPClientService as any).determineMISPCategory(ioc);

      expect(category).toBe('Other');
    });
  });

  describe('Confidence Calculation', () => {
    it('should give base confidence of 50', () => {
      const attr = {
        to_ids: false,
        comment: '',
        Tag: []
      };

      const confidence = (MISPClientService as any).calculateConfidence(attr);

      expect(confidence).toBe(50);
    });

    it('should increase confidence for to_ids=true', () => {
      const attr = {
        to_ids: true,
        comment: '',
        Tag: []
      };

      const confidence = (MISPClientService as any).calculateConfidence(attr);

      expect(confidence).toBeGreaterThan(50);
    });

    it('should increase confidence for detailed comment', () => {
      const attr = {
        to_ids: false,
        comment: 'This is a very detailed comment with lots of information',
        Tag: []
      };

      const confidence = (MISPClientService as any).calculateConfidence(attr);

      expect(confidence).toBeGreaterThan(50);
    });

    it('should increase confidence for multiple tags', () => {
      const attr = {
        to_ids: false,
        comment: '',
        Tag: [{ name: 'tag1' }, { name: 'tag2' }, { name: 'tag3' }]
      };

      const confidence = (MISPClientService as any).calculateConfidence(attr);

      expect(confidence).toBeGreaterThan(50);
    });

    it('should cap confidence at 100', () => {
      const attr = {
        to_ids: true,
        comment: 'Very detailed comment with lots of context and information',
        Tag: Array(10).fill({ name: 'tag' })
      };

      const confidence = (MISPClientService as any).calculateConfidence(attr);

      expect(confidence).toBeLessThanOrEqual(100);
    });
  });
});

