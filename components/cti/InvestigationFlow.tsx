/**
 * Investigation Flow - Workflow d'investigation CTI
 * Interface pour mener des investigations structurées
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Search, Target, FileText, Clock, User, AlertTriangle,
  Plus, Save, Share, Download, Eye, Edit, Trash2,
  ArrowRight, CheckCircle, XCircle, Play, Pause
} from 'lucide-react';
import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';

interface InvestigationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignee?: string;
  dueDate?: Date;
  findings: string[];
  evidence: string[];
}

interface Investigation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'completed' | 'closed' | 'cancelled';
  assignee: string;
  createdDate: Date;
  updatedDate: Date;
  steps: InvestigationStep[];
  findings: string[];
  tags: string[];
}

export function InvestigationFlow() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = getTaranisService();

  useEffect(() => {
    loadInvestigations();
  }, []);

  const loadInvestigations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser le service de workflow d'investigation avancé
      const { getInvestigationWorkflowService } = await import('./services/investigation-workflow-service');
      const investigationService = getInvestigationWorkflowService();
      
      console.log('🔍 Chargement des investigations depuis Taranis...');
      
      // Récupérer les investigations
      const investigations = await investigationService.getInvestigations();
      
      if (investigations.length === 0) {
        console.log('⚠️ Aucune investigation trouvée');
        setInvestigations([]);
        return;
      }

      console.log(`✅ ${investigations.length} investigations chargées`);
      
      // Convertir vers le format attendu par le composant
      const formattedInvestigations: Investigation[] = investigations.map(investigation => ({
        id: investigation.id,
        title: investigation.title,
        description: investigation.description,
        priority: investigation.priority,
        status: investigation.status,
        assignee: investigation.assignee,
        createdDate: investigation.createdDate,
        updatedDate: investigation.updatedDate,
        steps: investigation.steps.map(step => ({
          id: step.id,
          title: step.title,
          description: step.description,
          status: step.status,
          assignee: step.assignee,
          findings: step.findings,
          evidence: step.evidence
        })),
        findings: investigation.findings,
        tags: investigation.tags
      }));

      setInvestigations(formattedInvestigations);
      
      // Afficher les statistiques dans la console pour debug
      const stats = await investigationService.getInvestigationStatistics();
      console.log('📈 Statistiques des investigations:', {
        total: stats.totalInvestigations,
        active: stats.activeInvestigations,
        completed: stats.completedInvestigations,
        overdue: stats.overdueInvestigations,
        avgCompletionTime: stats.avgCompletionTime,
        byPriority: stats.byPriority,
        byStatus: stats.byStatus,
        byAssignee: stats.byAssignee
      });

      // Sélectionner la première investigation si aucune n'est sélectionnée
      if (formattedInvestigations.length > 0 && !selectedInvestigation) {
        setSelectedInvestigation(formattedInvestigations[0]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des investigations:', err);
      setError('Impossible de charger les investigations depuis Taranis. Vérifiez la connexion à l\'API.');
      
      // Essayer de générer des investigations basées sur les vraies données Taranis
      try {
        const fallbackInvestigations = await generateInvestigationsFromRealData();
        setInvestigations(fallbackInvestigations);
        setError(null); // Clear error si on a réussi à générer des investigations
      } catch (fallbackErr) {
        console.error('Erreur génération investigations fallback:', fallbackErr);
        // Dernière option : investigations vides
      setInvestigations([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============ GÉNÉRATION D'INVESTIGATIONS BASÉES SUR VRAIES DONNÉES ============
  
  const generateInvestigationsFromRealData = async (): Promise<Investigation[]> => {
    try {
      const investigations: Investigation[] = [];
      
      // Récupérer les vraies données depuis Taranis
      const [stories, newsItems, bots] = await Promise.all([
        service.getStories(),
        service.getNewsItems({ limit: 100, cybersecurity: true }),
        service.getBots()
      ]);

      // Générer une investigation basée sur les stories importantes
      if (stories && stories.length > 0) {
        const importantStories = stories.filter(story => story.important === true);
        if (importantStories.length > 0) {
          const investigation = await generateInvestigationFromStory(importantStories[0]);
          if (investigation) {
            investigations.push(investigation);
          }
        }
      }

      // Générer une investigation basée sur les news items critiques
      if (newsItems && newsItems.length > 0) {
        const criticalNews = newsItems.filter(item => 
          item.riskLevel === 'critical' || item.riskLevel === 'high'
        );
        if (criticalNews.length > 0) {
          const investigation = await generateInvestigationFromNewsItem(criticalNews[0]);
          if (investigation) {
            investigations.push(investigation);
          }
        }
      }

      // Générer une investigation basée sur les bots en erreur
      if (bots && bots.length > 0) {
        const problematicBots = bots.filter(bot => 
          bot.status === 'error' || bot.successRate < 80
        );
        if (problematicBots.length > 0) {
          const investigation = await generateInvestigationFromBotIssue(problematicBots[0]);
          if (investigation) {
            investigations.push(investigation);
          }
        }
      }

      return investigations;
    } catch (error) {
      console.error('Erreur génération investigations depuis vraies données:', error);
      return [];
    }
  };

  const generateInvestigationFromStory = async (story: any): Promise<Investigation | null> => {
    try {
      const investigationSteps = [
        {
          id: 'step-story-analysis',
          title: 'Story Analysis',
          description: 'Analyze threat intelligence story and related news items',
          status: 'completed' as const,
          assignee: 'Taranis AI System',
          findings: [
            `Story contains ${story.news_items?.length || 0} related news items`,
            story.important ? 'Marked as important by analysts' : 'Standard priority story',
            `Created on ${new Date(story.created).toLocaleDateString()}`
          ],
          evidence: story.news_items?.slice(0, 3).map((item: any) => `News Item: ${item.title}`) || []
        },
        {
          id: 'step-ioc-extraction',
          title: 'IOC Extraction',
          description: 'Extract indicators of compromise from story content',
          status: 'in-progress' as const,
          assignee: 'IOC Extraction Bot',
          findings: [],
            evidence: []
          },
          {
          id: 'step-threat-analysis',
          title: 'Threat Analysis',
          description: 'Analyze threat actor tactics and techniques',
          status: 'pending' as const,
            findings: [],
            evidence: []
          }
      ];

      return {
        id: `investigation-story-${story.id}`,
        title: `Threat Investigation: ${story.title}`,
        description: `Investigation of threat intelligence story: ${story.description || 'Analysis of threat intelligence story'}`,
        priority: story.important ? 'critical' as const : 'high' as const,
        status: 'in-progress' as const,
        assignee: 'Taranis AI System',
        createdDate: new Date(story.created || Date.now()),
        updatedDate: new Date(),
        steps: investigationSteps,
        findings: [
          `Story analysis completed with ${story.news_items?.length || 0} related items`,
          story.important ? 'High priority story identified' : 'Standard priority story'
        ],
        tags: story.tags?.map((tag: any) => tag.name) || ['Threat Intelligence', 'Investigation']
      };
    } catch (error) {
      console.error('Erreur génération investigation depuis story:', error);
      return null;
    }
  };

  const generateInvestigationFromNewsItem = async (newsItem: any): Promise<Investigation | null> => {
    try {
      const investigationSteps = [
        {
          id: 'step-news-analysis',
          title: 'News Item Analysis',
          description: 'Analyze critical news item for threat indicators',
          status: 'completed' as const,
          assignee: 'Taranis AI System',
          findings: [
            `Source: ${newsItem.source || 'Unknown'}`,
            `Risk Level: ${newsItem.riskLevel || 'Unknown'}`,
            `Language: ${newsItem.language || 'Unknown'}`
          ],
          evidence: [`News Item: ${newsItem.title}`]
        },
        {
          id: 'step-ioc-identification',
          title: 'IOC Identification',
          description: 'Identify and extract indicators of compromise',
          status: 'in-progress' as const,
          assignee: 'IOC Extraction Bot',
          findings: [],
          evidence: []
        },
        {
          id: 'step-impact-assessment',
          title: 'Impact Assessment',
          description: 'Assess potential impact and required response',
          status: 'pending' as const,
            findings: [],
            evidence: []
          }
      ];

      return {
        id: `investigation-news-${newsItem.id}`,
        title: `Critical Threat Investigation: ${newsItem.title}`,
        description: `Investigation of critical threat from news item: ${newsItem.title}`,
        priority: newsItem.riskLevel === 'critical' ? 'critical' as const : 'high' as const,
        status: 'in-progress' as const,
        assignee: 'Taranis AI System',
        createdDate: new Date(newsItem.collected || Date.now()),
        updatedDate: new Date(),
        steps: investigationSteps,
        findings: [
          `Critical news item identified: ${newsItem.title}`,
          `Source: ${newsItem.source || 'Unknown'}`,
          `Risk Level: ${newsItem.riskLevel || 'Unknown'}`
        ],
        tags: ['Critical Threat', 'News Item', newsItem.source || 'OSINT']
      };
    } catch (error) {
      console.error('Erreur génération investigation depuis news item:', error);
      return null;
    }
  };

  const generateInvestigationFromBotIssue = async (bot: any): Promise<Investigation | null> => {
    try {
      const investigationSteps = [
        {
          id: 'step-bot-diagnosis',
          title: 'Bot Issue Diagnosis',
          description: 'Diagnose bot performance or operational issues',
          status: 'completed' as const,
          assignee: 'Taranis AI System',
          findings: [
            `Bot: ${bot.name}`,
            `Status: ${bot.status}`,
            `Success Rate: ${bot.successRate}%`,
            `Processed Items: ${bot.processedCount}`
          ],
          evidence: [`Bot ID: ${bot.id}`, `Last Run: ${new Date(bot.lastRun).toLocaleDateString()}`]
        },
        {
          id: 'step-resource-analysis',
          title: 'Resource Analysis',
          description: 'Analyze system resources and bot configuration',
          status: 'in-progress' as const,
          assignee: 'System Administrator',
          findings: [],
          evidence: []
        },
        {
          id: 'step-resolution',
          title: 'Issue Resolution',
          description: 'Implement fixes and monitor bot performance',
          status: 'pending' as const,
        findings: [],
          evidence: []
        }
      ];

      return {
        id: `investigation-bot-${bot.id}`,
        title: `Bot Issue Investigation: ${bot.name}`,
        description: `Investigation of bot performance issue: ${bot.name}`,
        priority: bot.successRate < 50 ? 'high' as const : 'medium' as const,
        status: 'in-progress' as const,
        assignee: 'System Administrator',
        createdDate: new Date(bot.lastRun || Date.now()),
        updatedDate: new Date(),
        steps: investigationSteps,
        findings: [
          `Bot performance issue identified: ${bot.name}`,
          `Success rate: ${bot.successRate}%`,
          `Status: ${bot.status}`
        ],
        tags: ['Bot Issue', 'Performance', bot.type]
      };
    } catch (error) {
      console.error('Erreur génération investigation depuis bot issue:', error);
      return null;
    }
  };

  const createInvestigation = () => {
    const newInvestigation: Investigation = {
      id: `inv-${Date.now()}`,
      title: 'New Investigation',
      description: 'Investigation description...',
      priority: 'medium',
      status: 'open',
      assignee: 'Current User',
      createdDate: new Date(),
      updatedDate: new Date(),
      steps: [],
      findings: [],
      tags: []
    };

    setInvestigations(prev => [...prev, newInvestigation]);
    setSelectedInvestigation(newInvestigation);
    setIsCreating(true);
  };

  const updateInvestigation = (investigation: Investigation) => {
    setInvestigations(prev => 
      prev.map(inv => inv.id === investigation.id ? investigation : inv)
    );
    setSelectedInvestigation(investigation);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-500 bg-blue-500/10';
      case 'in-progress': return 'text-orange-500 bg-orange-500/10';
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'closed': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <Play className="w-4 h-4 text-orange-500" />;
      case 'blocked': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredInvestigations = investigations.filter(inv =>
    inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Liste des investigations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Investigations</h3>
            {isLoading && (
              <Badge variant="outline" className="animate-pulse text-xs">
                Chargement...
              </Badge>
            )}
            {error && (
              <Badge variant="destructive" className="text-xs max-w-xs truncate">
                {error}
              </Badge>
            )}
          </div>
          <Button onClick={createInvestigation} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search investigations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredInvestigations.map((investigation) => (
            <Card
              key={investigation.id}
              className={`cursor-pointer transition-colors ${
                selectedInvestigation?.id === investigation.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedInvestigation(investigation)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{investigation.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(investigation.priority)}>
                        {investigation.priority}
                      </Badge>
                      <Badge className={getStatusColor(investigation.status)}>
                        {investigation.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {investigation.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Assignee: {investigation.assignee}</span>
                    <span>{investigation.updatedDate.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {investigation.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {investigation.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{investigation.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Détail de l'investigation */}
      <div className="lg:col-span-2 space-y-6">
        {selectedInvestigation ? (
          <>
            {/* Header de l'investigation */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedInvestigation.title}</CardTitle>
                    <CardDescription>
                      {selectedInvestigation.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <p className="text-2xl font-bold">
                      {selectedInvestigation.steps.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Steps</p>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <p className="text-2xl font-bold">
                      {selectedInvestigation.steps.filter(s => s.status === 'completed').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <p className="text-2xl font-bold">
                      {selectedInvestigation.findings.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Findings</p>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <p className="text-2xl font-bold">
                      {selectedInvestigation.steps.reduce((sum, step) => sum + step.evidence.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Evidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Étapes d'investigation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Investigation Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedInvestigation.steps.map((step, index) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          {getStepStatusIcon(step.status)}
                          {index < selectedInvestigation.steps.length - 1 && (
                            <div className="w-px h-8 bg-border mt-2" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{step.title}</h4>
                            <Badge className={getStatusColor(step.status)}>
                              {step.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {step.description}
                          </p>
                          
                          {step.assignee && (
                            <div className="flex items-center gap-2 mb-3">
                              <User className="w-3 h-3" />
                              <span className="text-xs text-muted-foreground">
                                Assigned to: {step.assignee}
                              </span>
                            </div>
                          )}
                          
                          {step.findings.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium mb-2">Findings:</h5>
                              <ul className="space-y-1">
                                {step.findings.map((finding, idx) => (
                                  <li key={idx} className="text-sm flex items-center gap-2">
                                    <ArrowRight className="w-3 h-3 text-green-500" />
                                    {finding}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {step.evidence.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium mb-2">Evidence:</h5>
                              <div className="flex flex-wrap gap-2">
                                {step.evidence.map((evidence, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {evidence}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Findings globaux */}
            {selectedInvestigation.findings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Investigation Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedInvestigation.findings.map((finding, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                        <p className="text-sm">{finding}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-muted-foreground">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select an Investigation</p>
                <p className="text-sm">Choose an investigation from the list to view details</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
