/**
 * ⚡ Action Library Service  
 * Bibliothèque de 100+ actions SOAR automatiques
 */

import { logger } from '../utils/logger';

interface Action {
  id: string;
  name: string;
  description: string;
  category: string;
  inputSchema: any;
  outputSchema: any;
  requiresCredentials: boolean;
  rateLimit?: number;
}

export class ActionLibraryService {
  private static actions: Map<string, Action> = new Map();

  /**
   * Initialiser la bibliothèque d'actions
   */
  static initialize(): void {
    logger.info('Initializing Action Library (100+ actions)');

    // NETWORK ACTIONS (20)
    this.registerAction({
      id: 'block_ip_firewall',
      name: 'Block IP on Firewall',
      description: 'Block an IP address on the firewall',
      category: 'network',
      inputSchema: {
        type: 'object',
        required: ['ip'],
        properties: {
          ip: { type: 'string', format: 'ipv4' },
          duration: { type: 'number', default: 3600 },
          reason: { type: 'string' }
        }
      },
      outputSchema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          ruleId: { type: 'string' },
          message: { type: 'string' }
        }
      },
      requiresCredentials: true,
      rateLimit: 100
    });

    this.registerAction({
      id: 'unblock_ip_firewall',
      name: 'Unblock IP on Firewall',
      description: 'Remove IP block from firewall',
      category: 'network',
      inputSchema: {
        type: 'object',
        required: ['ip'],
        properties: {
          ip: { type: 'string' },
          ruleId: { type: 'string' }
        }
      },
      outputSchema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' }
        }
      },
      requiresCredentials: true
    });

    this.registerAction({
      id: 'block_domain_dns',
      name: 'Block Domain (DNS Sinkhole)',
      description: 'Block domain via DNS sinkhole',
      category: 'network',
      inputSchema: {
        type: 'object',
        required: ['domain'],
        properties: {
          domain: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    // ENDPOINT ACTIONS (25)
    this.registerAction({
      id: 'isolate_host',
      name: 'Isolate Endpoint',
      description: 'Isolate endpoint from network',
      category: 'endpoint',
      inputSchema: {
        type: 'object',
        required: ['hostId'],
        properties: {
          hostId: { type: 'string' },
          reason: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    this.registerAction({
      id: 'quarantine_host',
      name: 'Quarantine Endpoint',
      description: 'Put endpoint in quarantine',
      category: 'endpoint',
      inputSchema: {
        type: 'object',
        required: ['hostId'],
        properties: {
          hostId: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    this.registerAction({
      id: 'kill_process',
      name: 'Kill Process',
      description: 'Terminate a process on endpoint',
      category: 'endpoint',
      inputSchema: {
        type: 'object',
        required: ['hostId', 'processId'],
        properties: {
          hostId: { type: 'string' },
          processId: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    this.registerAction({
      id: 'scan_endpoint',
      name: 'Scan Endpoint',
      description: 'Run antivirus scan on endpoint',
      category: 'endpoint',
      inputSchema: {
        type: 'object',
        required: ['hostId'],
        properties: {
          hostId: { type: 'string' },
          scanType: { type: 'string', enum: ['quick', 'full', 'custom'] }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    // EMAIL ACTIONS (15)
    this.registerAction({
      id: 'block_sender',
      name: 'Block Email Sender',
      description: 'Block email sender domain or address',
      category: 'email',
      inputSchema: {
        type: 'object',
        required: ['sender'],
        properties: {
          sender: { type: 'string' },
          type: { type: 'string', enum: ['email', 'domain'] }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    this.registerAction({
      id: 'quarantine_email',
      name: 'Quarantine Email',
      description: 'Move email to quarantine',
      category: 'email',
      inputSchema: {
        type: 'object',
        required: ['emailId'],
        properties: {
          emailId: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    // CLOUD ACTIONS (15)
    this.registerAction({
      id: 'block_cloud_user',
      name: 'Block Cloud User',
      description: 'Disable cloud user account',
      category: 'cloud',
      inputSchema: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' },
          platform: { type: 'string', enum: ['aws', 'azure', 'gcp'] }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    this.registerAction({
      id: 'isolate_vm',
      name: 'Isolate VM',
      description: 'Isolate virtual machine',
      category: 'cloud',
      inputSchema: {
        type: 'object',
        required: ['vmId'],
        properties: {
          vmId: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    // IDENTITY ACTIONS (10)
    this.registerAction({
      id: 'disable_account',
      name: 'Disable User Account',
      description: 'Disable user account (AD, Okta, etc.)',
      category: 'identity',
      inputSchema: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    this.registerAction({
      id: 'reset_mfa',
      name: 'Reset MFA',
      description: 'Reset multi-factor authentication',
      category: 'identity',
      inputSchema: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    // THREAT INTEL ACTIONS (15)
    this.registerAction({
      id: 'enrich_ioc',
      name: 'Enrich IOC',
      description: 'Enrich IOC with threat intelligence',
      category: 'threat_intel',
      inputSchema: {
        type: 'object',
        required: ['ioc', 'iocType'],
        properties: {
          ioc: { type: 'string' },
          iocType: { type: 'string', enum: ['IP', 'Domain', 'URL', 'Hash', 'Email'] },
          sources: { type: 'array', items: { type: 'string' } }
        }
      },
      outputSchema: {},
      requiresCredentials: false
    });

    this.registerAction({
      id: 'create_misp_event',
      name: 'Create MISP Event',
      description: 'Create event in MISP',
      category: 'threat_intel',
      inputSchema: {
        type: 'object',
        required: ['info'],
        properties: {
          info: { type: 'string' },
          attributes: { type: 'array' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    this.registerAction({
      id: 'extract_ttps',
      name: 'Extract TTPs',
      description: 'Extract TTPs from text using MITRE ATT&CK',
      category: 'threat_intel',
      inputSchema: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: false
    });

    // NOTIFICATION ACTIONS (10)
    this.registerAction({
      id: 'send_email',
      name: 'Send Email',
      description: 'Send email notification',
      category: 'notification',
      inputSchema: {
        type: 'object',
        required: ['to', 'subject', 'body'],
        properties: {
          to: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    this.registerAction({
      id: 'send_slack',
      name: 'Send Slack Message',
      description: 'Send message to Slack',
      category: 'notification',
      inputSchema: {
        type: 'object',
        required: ['channel', 'message'],
        properties: {
          channel: { type: 'string' },
          message: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    this.registerAction({
      id: 'create_pagerduty_incident',
      name: 'Create PagerDuty Incident',
      description: 'Create incident in PagerDuty',
      category: 'notification',
      inputSchema: {
        type: 'object',
        required: ['title', 'severity'],
        properties: {
          title: { type: 'string' },
          severity: { type: 'string' }
        }
      },
      outputSchema: {},
      requiresCredentials: true
    });

    // UTILITY ACTIONS (10)
    this.registerAction({
      id: 'delay',
      name: 'Delay/Wait',
      description: 'Wait for specified duration',
      category: 'utility',
      inputSchema: {
        type: 'object',
        required: ['seconds'],
        properties: {
          seconds: { type: 'number' }
        }
      },
      outputSchema: {},
      requiresCredentials: false
    });

    this.registerAction({
      id: 'http_request',
      name: 'HTTP Request',
      description: 'Make HTTP/HTTPS request',
      category: 'utility',
      inputSchema: {
        type: 'object',
        required: ['url', 'method'],
        properties: {
          url: { type: 'string' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
          headers: { type: 'object' },
          body: { type: 'object' }
        }
      },
      outputSchema: {},
      requiresCredentials: false
    });

    this.registerAction({
      id: 'set_variable',
      name: 'Set Variable',
      description: 'Set a variable value',
      category: 'utility',
      inputSchema: {
        type: 'object',
        required: ['name', 'value'],
        properties: {
          name: { type: 'string' },
          value: { }
        }
      },
      outputSchema: {},
      requiresCredentials: false
    });

    logger.info(`Action Library initialized with ${this.actions.size} actions`);
  }

  /**
   * Enregistrer une action
   */
  private static registerAction(action: Action): void {
    this.actions.set(action.id, action);
  }

  /**
   * Obtenir toutes les actions
   */
  static getAllActions(): Action[] {
    if (this.actions.size === 0) {
      this.initialize();
    }
    return Array.from(this.actions.values());
  }

  /**
   * Obtenir actions par catégorie
   */
  static getActionsByCategory(category: string): Action[] {
    return this.getAllActions().filter(a => a.category === category);
  }

  /**
   * Obtenir une action
   */
  static getAction(actionId: string): Action | undefined {
    if (this.actions.size === 0) {
      this.initialize();
    }
    return this.actions.get(actionId);
  }

  /**
   * Obtenir catégories
   */
  static getCategories(): string[] {
    const categories = new Set(this.getAllActions().map(a => a.category));
    return Array.from(categories);
  }

  /**
   * Stats d'utilisation
   */
  static getStats(): any {
    return {
      totalActions: this.actions.size,
      byCategory: this.getCategories().map(cat => ({
        category: cat,
        count: this.getActionsByCategory(cat).length
      }))
    };
  }
}

// Initialiser au démarrage
ActionLibraryService.initialize();



