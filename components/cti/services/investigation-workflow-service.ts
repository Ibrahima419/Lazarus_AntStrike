/**
 * Service de Workflow d'Investigation
 * Remplace les données mockées par un système d'investigation réel avec report items Taranis
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';

// ============ TYPES & INTERFACES ============

export interface InvestigationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate?: Date;
  findings: string[];
  evidence: string[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Investigation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'completed' | 'closed' | 'cancelled';
  assignee: string;
  createdDate: Date;
  updatedDate: Date;
  dueDate?: Date;
  completedDate?: Date;
  steps: InvestigationStep[];
  findings: string[];
  tags: string[];
  relatedStories: string[];
  relatedIOCs: string[];
  relatedCampaigns: string[];
  reportItemId?: string; // ID du report item Taranis
}

export interface InvestigationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'apt' | 'ransomware' | 'phishing' | 'malware' | 'insider' | 'general';
  steps: Array<{
    title: string;
    description: string;
    estimatedDuration: number; // en heures
    required: boolean;
    assignee?: string;
  }>;
  tags: string[];
}

export interface InvestigationWorkflowConfig {
  enabled: boolean;
  autoCreateReportItems: boolean;
  reportItemTypeId: number;
  notificationEnabled: boolean;
  escalationEnabled: boolean;
  escalationDelay: number; // en heures
  templatesEnabled: boolean;
}

export interface InvestigationStatistics {
  totalInvestigations: number;
  activeInvestigations: number;
  completedInvestigations: number;
  overdueInvestigations: number;
  avgCompletionTime: number; // en heures
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  byAssignee: Record<string, number>;
}

// ============ TEMPLATES D'INVESTIGATION ============

const INVESTIGATION_TEMPLATES: InvestigationTemplate[] = [
  {
    id: 'template-apt',
    name: 'APT Investigation',
    description: 'Standard workflow for Advanced Persistent Threat investigations',
    category: 'apt',
    steps: [
      {
        title: 'Initial IOC Collection',
        description: 'Gather initial indicators of compromise',
        estimatedDuration: 4,
        required: true
      },
      {
        title: 'TTP Analysis',
        description: 'Analyze tactics, techniques, and procedures',
        estimatedDuration: 8,
        required: true
      },
      {
        title: 'Infrastructure Mapping',
        description: 'Map attacker infrastructure and C2 servers',
        estimatedDuration: 6,
        required: true
      },
      {
        title: 'Attribution Analysis',
        description: 'Determine threat actor attribution',
        estimatedDuration: 12,
        required: false
      },
      {
        title: 'Impact Assessment',
        description: 'Assess the impact and scope of the attack',
        estimatedDuration: 4,
        required: true
      }
    ],
    tags: ['APT', 'Advanced', 'Persistent', 'Attribution']
  },
  {
    id: 'template-ransomware',
    name: 'Ransomware Investigation',
    description: 'Workflow for ransomware incident response',
    category: 'ransomware',
    steps: [
      {
        title: 'Initial Assessment',
        description: 'Assess the scope and impact of the ransomware attack',
        estimatedDuration: 2,
        required: true
      },
      {
        title: 'Containment',
        description: 'Contain the spread of ransomware',
        estimatedDuration: 4,
        required: true
      },
      {
        title: 'Ransomware Analysis',
        description: 'Analyze the ransomware sample and behavior',
        estimatedDuration: 6,
        required: true
      },
      {
        title: 'Recovery Planning',
        description: 'Plan data recovery and system restoration',
        estimatedDuration: 8,
        required: true
      },
      {
        title: 'Lessons Learned',
        description: 'Document lessons learned and recommendations',
        estimatedDuration: 2,
        required: true
      }
    ],
    tags: ['Ransomware', 'Incident Response', 'Recovery']
  },
  {
    id: 'template-phishing',
    name: 'Phishing Investigation',
    description: 'Workflow for phishing campaign investigations',
    category: 'phishing',
    steps: [
      {
        title: 'Email Analysis',
        description: 'Analyze the phishing email and headers',
        estimatedDuration: 2,
        required: true
      },
      {
        title: 'URL Analysis',
        description: 'Analyze malicious URLs and landing pages',
        estimatedDuration: 4,
        required: true
      },
      {
        title: 'Victim Impact',
        description: 'Assess victim impact and credential compromise',
        estimatedDuration: 3,
        required: true
      },
      {
        title: 'Campaign Tracking',
        description: 'Track the broader phishing campaign',
        estimatedDuration: 6,
        required: false
      }
    ],
    tags: ['Phishing', 'Social Engineering', 'Credentials']
  }
];

// ============ SERVICE PRINCIPAL ============

export class InvestigationWorkflowService {
  private taranisService = getTaranisService();
  private config: InvestigationWorkflowConfig;
  private cache = new Map<string, Investigation[]>();
  private cacheExpiry = 10 * 60 * 1000; // 10 minutes

  constructor(config?: Partial<InvestigationWorkflowConfig>) {
    this.config = {
      enabled: true,
      autoCreateReportItems: true,
      reportItemTypeId: 4, // À configurer selon votre setup
      notificationEnabled: true,
      escalationEnabled: true,
      escalationDelay: 24, // 24 heures
      templatesEnabled: true,
      ...config
    };
  }

  // ============ GESTION DES INVESTIGATIONS ============

  /**
   * Récupère toutes les investigations
   */
  async getInvestigations(): Promise<Investigation[]> {
    try {
      const cached = this.getCached('investigations');
      if (cached) return cached;

      console.log('🔍 Récupération des investigations depuis Taranis...');

      // Récupérer les report items de type investigation
      const reportItems = await this.taranisService.getReportItems();
      
      // Filtrer les report items d'investigation
      const investigationReportItems = reportItems.filter(item => 
        item.report_item_type_id === this.config.reportItemTypeId
      );

      console.log(`📋 ${investigationReportItems.length} investigations trouvées`);

      // Convertir les report items en investigations
      const investigations: Investigation[] = investigationReportItems.map(item => 
        this.mapReportItemToInvestigation(item)
      );

      this.setCached('investigations', investigations);
      return investigations;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des investigations:', error);
      return [];
    }
  }

  /**
   * Crée une nouvelle investigation
   */
  async createInvestigation(data: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignee: string;
    templateId?: string;
    relatedStories?: string[];
    relatedIOCs?: string[];
    relatedCampaigns?: string[];
  }): Promise<Investigation> {
    try {
      console.log(`🔍 Création d'une nouvelle investigation: ${data.title}`);

      // Générer l'ID de l'investigation
      const investigationId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Créer les steps depuis le template ou par défaut
      const steps = data.templateId ? 
        await this.createStepsFromTemplate(data.templateId) :
        this.createDefaultSteps();

      // Créer l'investigation
      const investigation: Investigation = {
        id: investigationId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'open',
        assignee: data.assignee,
        createdDate: new Date(),
        updatedDate: new Date(),
        dueDate: this.calculateDueDate(data.priority),
        steps,
        findings: [],
        tags: this.generateTagsFromData(data),
        relatedStories: data.relatedStories || [],
        relatedIOCs: data.relatedIOCs || [],
        relatedCampaigns: data.relatedCampaigns || []
      };

      // Créer le report item dans Taranis
      if (this.config.autoCreateReportItems) {
        const reportItemId = await this.createInvestigationReportItem(investigation);
        investigation.reportItemId = reportItemId;
      }

      // Invalider le cache
      this.invalidateCache('investigations');

      console.log(`✅ Investigation créée: ${investigationId}`);
      return investigation;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'investigation:', error);
      throw error;
    }
  }

  /**
   * Met à jour une investigation
   */
  async updateInvestigation(id: string, updates: Partial<Investigation>): Promise<boolean> {
    try {
      const investigations = await this.getInvestigations();
      const investigation = investigations.find(inv => inv.id === id);
      
      if (!investigation) {
        throw new Error(`Investigation ${id} non trouvée`);
      }

      // Mettre à jour l'investigation
      const updatedInvestigation = {
        ...investigation,
        ...updates,
        updatedDate: new Date()
      };

      // Mettre à jour le report item dans Taranis
      if (investigation.reportItemId) {
        await this.updateInvestigationReportItem(investigation.reportItemId, updatedInvestigation);
      }

      // Invalider le cache
      this.invalidateCache('investigations');

      console.log(`✅ Investigation ${id} mise à jour`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de l'investigation ${id}:`, error);
      return false;
    }
  }

  /**
   * Met à jour une étape d'investigation
   */
  async updateInvestigationStep(
    investigationId: string, 
    stepId: string, 
    updates: Partial<InvestigationStep>
  ): Promise<boolean> {
    try {
      const investigations = await this.getInvestigations();
      const investigation = investigations.find(inv => inv.id === investigationId);
      
      if (!investigation) {
        throw new Error(`Investigation ${investigationId} non trouvée`);
      }

      // Mettre à jour l'étape
      const stepIndex = investigation.steps.findIndex(step => step.id === stepId);
      if (stepIndex === -1) {
        throw new Error(`Étape ${stepId} non trouvée`);
      }

      investigation.steps[stepIndex] = {
        ...investigation.steps[stepIndex],
        ...updates,
        updatedAt: new Date()
      };

      // Mettre à jour l'investigation
      await this.updateInvestigation(investigationId, {
        steps: investigation.steps,
        updatedDate: new Date()
      });

      console.log(`✅ Étape ${stepId} mise à jour dans l'investigation ${investigationId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de l'étape ${stepId}:`, error);
      return false;
    }
  }

  /**
   * Ajoute des findings à une investigation
   */
  async addInvestigationFindings(
    investigationId: string, 
    findings: string[]
  ): Promise<boolean> {
    try {
      const investigations = await this.getInvestigations();
      const investigation = investigations.find(inv => inv.id === investigationId);
      
      if (!investigation) {
        throw new Error(`Investigation ${investigationId} non trouvée`);
      }

      // Ajouter les nouveaux findings
      const updatedFindings = [...investigation.findings, ...findings];

      await this.updateInvestigation(investigationId, {
        findings: updatedFindings,
        updatedDate: new Date()
      });

      console.log(`✅ ${findings.length} findings ajoutés à l'investigation ${investigationId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout des findings:`, error);
      return false;
    }
  }

  /**
   * Ferme une investigation
   */
  async closeInvestigation(
    investigationId: string, 
    reason: string,
    finalFindings: string[]
  ): Promise<boolean> {
    try {
      const investigations = await this.getInvestigations();
      const investigation = investigations.find(inv => inv.id === investigationId);
      
      if (!investigation) {
        throw new Error(`Investigation ${investigationId} non trouvée`);
      }

      // Marquer toutes les étapes comme terminées
      const completedSteps = investigation.steps.map(step => ({
        ...step,
        status: 'completed' as const,
        completedAt: new Date()
      }));

      await this.updateInvestigation(investigationId, {
        status: 'completed',
        completedDate: new Date(),
        steps: completedSteps,
        findings: [...investigation.findings, ...finalFindings],
        updatedDate: new Date()
      });

      console.log(`✅ Investigation ${investigationId} fermée: ${reason}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la fermeture de l'investigation ${investigationId}:`, error);
      return false;
    }
  }

  // ============ TEMPLATES ============

  /**
   * Récupère les templates d'investigation
   */
  getInvestigationTemplates(): InvestigationTemplate[] {
    return INVESTIGATION_TEMPLATES;
  }

  /**
   * Crée des étapes depuis un template
   */
  private async createStepsFromTemplate(templateId: string): Promise<InvestigationStep[]> {
    const template = INVESTIGATION_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} non trouvé`);
    }

    return template.steps.map((stepTemplate, index) => ({
      id: `step_${Date.now()}_${index}`,
      title: stepTemplate.title,
      description: stepTemplate.description,
      status: 'pending' as const,
      assignee: stepTemplate.assignee || 'Unassigned',
      dueDate: new Date(Date.now() + stepTemplate.estimatedDuration * 60 * 60 * 1000),
      findings: [],
      evidence: [],
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  /**
   * Crée des étapes par défaut
   */
  private createDefaultSteps(): InvestigationStep[] {
    return [
      {
        id: `step_${Date.now()}_0`,
        title: 'Initial Assessment',
        description: 'Initial assessment and scoping of the investigation',
        status: 'pending',
        assignee: 'Unassigned',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        findings: [],
        evidence: [],
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `step_${Date.now()}_1`,
        title: 'Evidence Collection',
        description: 'Collect and preserve evidence',
        status: 'pending',
        assignee: 'Unassigned',
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
        findings: [],
        evidence: [],
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `step_${Date.now()}_2`,
        title: 'Analysis',
        description: 'Analyze collected evidence',
        status: 'pending',
        assignee: 'Unassigned',
        dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h
        findings: [],
        evidence: [],
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // ============ MAPPING ============

  /**
   * Mappe un report item vers une investigation
   */
  private mapReportItemToInvestigation(reportItem: any): Investigation {
    const attributes = reportItem.attributes || [];
    
    // Extraire les attributs
    const getAttribute = (key: string) => {
      const attr = attributes.find((a: any) => a.key === key);
      return attr ? attr.value : null;
    };

    const getAttributeAsArray = (key: string) => {
      const value = getAttribute(key);
      return value ? JSON.parse(value) : [];
    };

    const getAttributeAsDate = (key: string) => {
      const value = getAttribute(key);
      return value ? new Date(value) : new Date();
    };

    return {
      id: reportItem.id,
      title: reportItem.title,
      description: reportItem.description || '',
      priority: getAttribute('priority') || 'medium',
      status: getAttribute('status') || 'open',
      assignee: getAttribute('assignee') || 'Unassigned',
      createdDate: getAttributeAsDate('created_date'),
      updatedDate: getAttributeAsDate('updated_date'),
      dueDate: getAttribute('due_date') ? new Date(getAttribute('due_date')) : undefined,
      completedDate: getAttribute('completed_date') ? new Date(getAttribute('completed_date')) : undefined,
      steps: getAttributeAsArray('steps'),
      findings: getAttributeAsArray('findings'),
      tags: getAttributeAsArray('tags'),
      relatedStories: getAttributeAsArray('related_stories'),
      relatedIOCs: getAttributeAsArray('related_iocs'),
      relatedCampaigns: getAttributeAsArray('related_campaigns'),
      reportItemId: reportItem.id
    };
  }

  // ============ CRÉATION DE REPORT ITEMS ============

  /**
   * Crée un report item pour une investigation
   */
  private async createInvestigationReportItem(investigation: Investigation): Promise<string> {
    const reportItem = {
      title: investigation.title,
      description: investigation.description,
      report_item_type_id: this.config.reportItemTypeId,
      completed: investigation.status === 'completed',
      attributes: [
        {
          key: 'priority',
          value: investigation.priority,
          type: 'STRING'
        },
        {
          key: 'status',
          value: investigation.status,
          type: 'STRING'
        },
        {
          key: 'assignee',
          value: investigation.assignee,
          type: 'STRING'
        },
        {
          key: 'created_date',
          value: investigation.createdDate.toISOString(),
          type: 'DATE_TIME'
        },
        {
          key: 'updated_date',
          value: investigation.updatedDate.toISOString(),
          type: 'DATE_TIME'
        },
        {
          key: 'due_date',
          value: investigation.dueDate?.toISOString() || '',
          type: 'DATE_TIME'
        },
        {
          key: 'completed_date',
          value: investigation.completedDate?.toISOString() || '',
          type: 'DATE_TIME'
        },
        {
          key: 'steps',
          value: JSON.stringify(investigation.steps),
          type: 'TEXT'
        },
        {
          key: 'findings',
          value: JSON.stringify(investigation.findings),
          type: 'TEXT'
        },
        {
          key: 'tags',
          value: JSON.stringify(investigation.tags),
          type: 'TEXT'
        },
        {
          key: 'related_stories',
          value: JSON.stringify(investigation.relatedStories),
          type: 'TEXT'
        },
        {
          key: 'related_iocs',
          value: JSON.stringify(investigation.relatedIOCs),
          type: 'TEXT'
        },
        {
          key: 'related_campaigns',
          value: JSON.stringify(investigation.relatedCampaigns),
          type: 'TEXT'
        }
      ]
    };

    // Créer le report item via l'API Taranis
    const response = await this.taranisService.createReportItem(reportItem);
    return response.id;
  }

  /**
   * Met à jour un report item d'investigation
   */
  private async updateInvestigationReportItem(
    reportItemId: string, 
    investigation: Investigation
  ): Promise<void> {
    const updateData = {
      id: reportItemId,
      message: JSON.stringify({
        priority: investigation.priority,
        status: investigation.status,
        assignee: investigation.assignee,
        updated_date: investigation.updatedDate.toISOString(),
        due_date: investigation.dueDate?.toISOString() || '',
        completed_date: investigation.completedDate?.toISOString() || '',
        steps: investigation.steps,
        findings: investigation.findings,
        tags: investigation.tags,
        related_stories: investigation.relatedStories,
        related_iocs: investigation.relatedIOCs,
        related_campaigns: investigation.relatedCampaigns
      })
    };

    await this.taranisService.updateReportItem(reportItemId, updateData);
  }

  // ============ MÉTHODES UTILITAIRES ============

  /**
   * Calcule la date d'échéance basée sur la priorité
   */
  private calculateDueDate(priority: string): Date {
    const now = new Date();
    const hours = {
      'critical': 24,
      'high': 72,
      'medium': 168, // 1 semaine
      'low': 336 // 2 semaines
    };
    
    return new Date(now.getTime() + (hours[priority as keyof typeof hours] || 168) * 60 * 60 * 1000);
  }

  /**
   * Génère des tags depuis les données d'investigation
   */
  private generateTagsFromData(data: any): string[] {
    const tags: string[] = [];
    
    // Tags basés sur la priorité
    tags.push(data.priority.toUpperCase());
    
    // Tags basés sur le template
    if (data.templateId) {
      const template = INVESTIGATION_TEMPLATES.find(t => t.id === data.templateId);
      if (template) {
        tags.push(...template.tags);
      }
    }
    
    // Tags basés sur le contenu
    const content = `${data.title} ${data.description}`.toLowerCase();
    if (content.includes('apt')) tags.push('APT');
    if (content.includes('ransomware')) tags.push('Ransomware');
    if (content.includes('phishing')) tags.push('Phishing');
    if (content.includes('malware')) tags.push('Malware');
    if (content.includes('insider')) tags.push('Insider Threat');
    
    return [...new Set(tags)];
  }

  /**
   * Calcule les statistiques des investigations
   */
  async getInvestigationStatistics(): Promise<InvestigationStatistics> {
    try {
      const investigations = await this.getInvestigations();
      
      const totalInvestigations = investigations.length;
      const activeInvestigations = investigations.filter(inv => 
        inv.status === 'open' || inv.status === 'in-progress'
      ).length;
      const completedInvestigations = investigations.filter(inv => 
        inv.status === 'completed'
      ).length;
      
      const now = new Date();
      const overdueInvestigations = investigations.filter(inv => 
        inv.dueDate && inv.dueDate < now && inv.status !== 'completed'
      ).length;
      
      // Calculer le temps moyen de completion
      const completed = investigations.filter(inv => inv.completedDate);
      const avgCompletionTime = completed.length > 0 ?
        completed.reduce((sum, inv) => {
          const duration = inv.completedDate!.getTime() - inv.createdDate.getTime();
          return sum + (duration / (1000 * 60 * 60)); // en heures
        }, 0) / completed.length : 0;
      
      // Statistiques par priorité
      const byPriority: Record<string, number> = {};
      investigations.forEach(inv => {
        byPriority[inv.priority] = (byPriority[inv.priority] || 0) + 1;
      });
      
      // Statistiques par statut
      const byStatus: Record<string, number> = {};
      investigations.forEach(inv => {
        byStatus[inv.status] = (byStatus[inv.status] || 0) + 1;
      });
      
      // Statistiques par assigné
      const byAssignee: Record<string, number> = {};
      investigations.forEach(inv => {
        byAssignee[inv.assignee] = (byAssignee[inv.assignee] || 0) + 1;
      });
      
      return {
        totalInvestigations,
        activeInvestigations,
        completedInvestigations,
        overdueInvestigations,
        avgCompletionTime,
        byPriority,
        byStatus,
        byAssignee
      };
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      return {
        totalInvestigations: 0,
        activeInvestigations: 0,
        completedInvestigations: 0,
        overdueInvestigations: 0,
        avgCompletionTime: 0,
        byPriority: {},
        byStatus: {},
        byAssignee: {}
      };
    }
  }

  // ============ GESTION DU CACHE ============

  private getCached(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private setCached(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  // ============ MÉTHODES PUBLIQUES ============

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<InvestigationWorkflowConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.cache.clear();
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig(): InvestigationWorkflowConfig {
    return { ...this.config };
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Crée une investigation depuis un template
   */
  async createInvestigationFromTemplate(
    templateId: string,
    data: {
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      assignee: string;
      relatedStories?: string[];
      relatedIOCs?: string[];
      relatedCampaigns?: string[];
    }
  ): Promise<Investigation> {
    return await this.createInvestigation({
      ...data,
      templateId
    });
  }
}

// ============ INSTANCE SINGLETON ============

let investigationWorkflowInstance: InvestigationWorkflowService | null = null;

export function getInvestigationWorkflowService(): InvestigationWorkflowService {
  if (!investigationWorkflowInstance) {
    investigationWorkflowInstance = new InvestigationWorkflowService();
  }
  return investigationWorkflowInstance;
}
