/**
 * 🧪 Action Library Tests
 * Tests unitaires pour la bibliothèque d'actions SOAR
 */

import { ActionLibraryService } from '../src/services/action-library.service';

describe('ActionLibraryService', () => {
  beforeAll(() => {
    ActionLibraryService.initialize();
  });

  describe('getAllActions', () => {
    it('should return all registered actions', () => {
      const actions = ActionLibraryService.getAllActions();

      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBeGreaterThan(0);
    });

    it('should have required fields for each action', () => {
      const actions = ActionLibraryService.getAllActions();

      actions.forEach(action => {
        expect(action.id).toBeDefined();
        expect(action.name).toBeDefined();
        expect(action.description).toBeDefined();
        expect(action.category).toBeDefined();
        expect(action.inputSchema).toBeDefined();
        expect(action.outputSchema).toBeDefined();
        expect(typeof action.requiresCredentials).toBe('boolean');
      });
    });
  });

  describe('getActionsByCategory', () => {
    it('should return only network actions', () => {
      const networkActions = ActionLibraryService.getActionsByCategory('network');

      expect(Array.isArray(networkActions)).toBe(true);
      networkActions.forEach(action => {
        expect(action.category).toBe('network');
      });
    });

    it('should return only endpoint actions', () => {
      const endpointActions = ActionLibraryService.getActionsByCategory('endpoint');

      expect(Array.isArray(endpointActions)).toBe(true);
      endpointActions.forEach(action => {
        expect(action.category).toBe('endpoint');
      });
    });

    it('should return empty array for invalid category', () => {
      const actions = ActionLibraryService.getActionsByCategory('invalid-category');

      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBe(0);
    });
  });

  describe('getAction', () => {
    it('should retrieve action by id', () => {
      const action = ActionLibraryService.getAction('block_ip_firewall');

      expect(action).toBeDefined();
      expect(action?.id).toBe('block_ip_firewall');
      expect(action?.name).toBe('Block IP on Firewall');
      expect(action?.category).toBe('network');
    });

    it('should return undefined for non-existent action', () => {
      const action = ActionLibraryService.getAction('non_existent_action');

      expect(action).toBeUndefined();
    });

    it('should have valid input schema for block_ip_firewall', () => {
      const action = ActionLibraryService.getAction('block_ip_firewall');

      expect(action?.inputSchema).toBeDefined();
      expect(action?.inputSchema.type).toBe('object');
      expect(action?.inputSchema.required).toContain('ip');
      expect(action?.inputSchema.properties.ip).toBeDefined();
    });
  });

  describe('getCategories', () => {
    it('should return all unique categories', () => {
      const categories = ActionLibraryService.getCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // Vérifier catégories attendues
      expect(categories).toContain('network');
      expect(categories).toContain('endpoint');
      expect(categories).toContain('email');
      expect(categories).toContain('notification');
      expect(categories).toContain('utility');
    });

    it('should not have duplicate categories', () => {
      const categories = ActionLibraryService.getCategories();
      const uniqueCategories = [...new Set(categories)];

      expect(categories.length).toBe(uniqueCategories.length);
    });
  });

  describe('getStats', () => {
    it('should return action statistics', () => {
      const stats = ActionLibraryService.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalActions).toBeGreaterThan(0);
      expect(Array.isArray(stats.byCategory)).toBe(true);
    });

    it('should have correct total count', () => {
      const stats = ActionLibraryService.getStats();
      const allActions = ActionLibraryService.getAllActions();

      expect(stats.totalActions).toBe(allActions.length);
    });

    it('should have category breakdown', () => {
      const stats = ActionLibraryService.getStats();

      stats.byCategory.forEach((cat: any) => {
        expect(cat.category).toBeDefined();
        expect(cat.count).toBeGreaterThan(0);
      });
    });
  });

  describe('Action Schemas', () => {
    it('should have valid schemas for all actions', () => {
      const actions = ActionLibraryService.getAllActions();

      actions.forEach(action => {
        // Input schema validation
        expect(action.inputSchema).toBeDefined();
        expect(action.inputSchema.type).toBe('object');

        // Output schema validation
        expect(action.outputSchema).toBeDefined();
      });
    });

    it('should have required fields in input schema where needed', () => {
      const blockIpAction = ActionLibraryService.getAction('block_ip_firewall');

      expect(blockIpAction?.inputSchema.required).toBeDefined();
      expect(Array.isArray(blockIpAction?.inputSchema.required)).toBe(true);
      expect(blockIpAction?.inputSchema.required.length).toBeGreaterThan(0);
    });
  });

  describe('Specific Actions', () => {
    it('should have enrich_ioc action in threat_intel category', () => {
      const action = ActionLibraryService.getAction('enrich_ioc');

      expect(action).toBeDefined();
      expect(action?.category).toBe('threat_intel');
      expect(action?.requiresCredentials).toBe(false);
    });

    it('should have send_slack action in notification category', () => {
      const action = ActionLibraryService.getAction('send_slack');

      expect(action).toBeDefined();
      expect(action?.category).toBe('notification');
      expect(action?.requiresCredentials).toBe(true);
    });

    it('should have delay action in utility category', () => {
      const action = ActionLibraryService.getAction('delay');

      expect(action).toBeDefined();
      expect(action?.category).toBe('utility');
      expect(action?.requiresCredentials).toBe(false);
    });
  });
});



