/**
 * Reports Builder - Générateur de rapports CTI
 * Interface pour créer et gérer les rapports de threat intelligence
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  FileText, Plus, Save, Download, Share, Eye, Edit, 
  Trash2, Calendar, User, Target, AlertTriangle, 
  Search, Filter, BookOpen, BarChart3, Image
} from 'lucide-react';
import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'threat' | 'campaign' | 'ioc' | 'attribution' | 'trend';
  status: 'draft' | 'review' | 'published' | 'archived';
  severity: 'low' | 'medium' | 'high' | 'critical';
  author: string;
  createdDate: Date;
  updatedDate: Date;
  publishedDate?: Date;
  tags: string[];
  content: string;
  executiveSummary: string;
  keyFindings: string[];
  recommendations: string[];
  iocs: string[];
  ttp: string[];
  references: string[];
  audience: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  sections: string[];
}

export function ReportsBuilder() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = getTaranisService();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Charger les report items et products depuis Taranis
      const [reportItems, products] = await Promise.all([
        service.getReports(),
        service.listProducts()
      ]);

      // Transformer les report items en Reports
      const reportsFromItems: Report[] = reportItems.map((item: any) => {
        // Extraire les tags depuis les attributs ou le contenu
        const tags = item.tags || [];
        
        // Déterminer le type basé sur le titre ou le contenu
        let type: 'threat' | 'campaign' | 'ioc' | 'attribution' | 'trend' = 'threat';
        const titleLower = (item.title || '').toLowerCase();
        if (titleLower.includes('campaign')) type = 'campaign';
        else if (titleLower.includes('ioc')) type = 'ioc';
        else if (titleLower.includes('attribution')) type = 'attribution';
        else if (titleLower.includes('trend') || titleLower.includes('quarterly')) type = 'trend';

        // Mapper le threat level à severity
        const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
          low: 'low',
          medium: 'medium',
          high: 'high',
          critical: 'critical'
        };
        const severity = severityMap[item.threatLevel as string] || 'medium';

        // Status basé sur completed
        const status = item.completed ? 'published' : 'draft';

        return {
          id: item.id,
          title: item.title,
          description: item.content.substring(0, 200) + '...' || 'No description',
          type,
          status,
          severity,
          author: 'Taranis User',
          createdDate: new Date(item.createdDate),
          updatedDate: new Date(item.createdDate),
          publishedDate: item.completed ? new Date(item.createdDate) : undefined,
          tags,
          content: item.content,
          executiveSummary: item.content.substring(0, 500) + '...',
          keyFindings: extractKeyFindings(item.content),
          recommendations: extractRecommendations(item.content),
          iocs: extractIOCs(item.content),
          ttp: extractTTPs(item.content),
          references: [],
          audience: ['Security Team', 'Analysts']
        };
      });

      // Transformer les products en Reports
      const reportsFromProducts: Report[] = products.map((product: any) => ({
        id: product.id,
        title: product.title || 'Untitled Product',
        description: product.description || 'No description',
        type: 'threat' as const,
        status: 'published' as const,
        severity: 'medium' as const,
        author: 'Taranis User',
        createdDate: new Date(product.createdDate || Date.now()),
        updatedDate: new Date(product.updatedDate || Date.now()),
        publishedDate: new Date(product.createdDate || Date.now()),
        tags: [],
        content: product.content || '',
        executiveSummary: (product.content || '').substring(0, 500) + '...',
        keyFindings: [],
        recommendations: [],
        iocs: [],
        ttp: [],
        references: [],
        audience: ['Security Team']
      }));

      // Combiner les deux sources
      const allReports = [...reportsFromItems, ...reportsFromProducts];
      setReports(allReports);

      // Sélectionner le premier rapport si aucun n'est sélectionné
      if (allReports.length > 0 && !selectedReport) {
        setSelectedReport(allReports[0]);
      }
    } catch (err) {
      console.error('Erreur chargement rapports:', err);
      setError('Impossible de charger les rapports depuis Taranis');
      
      // Essayer de générer des rapports basés sur les vraies données Taranis
      try {
        const fallbackReports = await generateReportsFromRealData();
        setReports(fallbackReports);
        setError(null); // Clear error si on a réussi à générer des rapports
      } catch (fallbackErr) {
        console.error('Erreur génération rapports fallback:', fallbackErr);
        // Dernière option : rapports de démonstration minimaux
        setReports([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============ GÉNÉRATION DE RAPPORTS BASÉS SUR VRAIES DONNÉES ============
  
  const generateReportsFromRealData = async (): Promise<Report[]> => {
    try {
      const reports: Report[] = [];
      
      // Récupérer les vraies données depuis Taranis
      const [stories, newsItems, bots] = await Promise.all([
        service.getStories(),
        service.getNewsItems(50),
        service.getBots()
      ]);

      // Générer un rapport basé sur les stories récentes
      if (stories && stories.length > 0) {
        const recentStories = stories.slice(0, 3);
        
        for (const story of recentStories) {
          const report = await generateReportFromStory(story);
          if (report) {
            reports.push(report);
          }
        }
      }

      // Générer un rapport basé sur les news items critiques
      if (newsItems && newsItems.length > 0) {
        const criticalNews = newsItems.filter(item => 
          item.riskLevel === 'critical' || item.riskLevel === 'high'
        ).slice(0, 2);
        
        for (const newsItem of criticalNews) {
          const report = await generateReportFromNewsItem(newsItem);
          if (report) {
            reports.push(report);
          }
        }
      }

      // Générer un rapport basé sur les performances des bots
      if (bots && bots.length > 0) {
        const botReport = await generateBotPerformanceReport(bots);
        if (botReport) {
          reports.push(botReport);
        }
      }

      return reports;
    } catch (error) {
      console.error('Erreur génération rapports depuis vraies données:', error);
      return [];
    }
  };

  const generateReportFromStory = async (story: any): Promise<Report | null> => {
    try {
      return {
        id: `story-report-${story.id}`,
        title: `Threat Intelligence Report: ${story.title}`,
        description: `Analysis report based on story: ${story.description || 'Threat intelligence story analysis'}`,
        type: 'intelligence',
        status: 'published',
        severity: story.important ? 'critical' : 'high',
        author: 'Taranis AI System',
        createdDate: new Date(story.created || Date.now()),
        updatedDate: new Date(story.last_change || Date.now()),
        publishedDate: new Date(),
        tags: story.tags?.map((tag: any) => tag.name) || ['Threat Intelligence', 'Analysis'],
        content: story.description || 'Automated threat intelligence analysis',
        executiveSummary: `This report analyzes the threat intelligence story: ${story.title}`,
        keyFindings: [
          `Story contains ${story.news_items?.length || 0} related news items`,
          story.important ? 'Marked as important by analysts' : 'Standard priority analysis',
          `Created on ${new Date(story.created).toLocaleDateString()}`
        ],
        recommendations: [
          'Monitor related indicators of compromise',
          'Update threat detection rules',
          'Share intelligence with relevant teams'
        ],
        iocs: extractIOCsFromStory(story),
        ttp: extractTTPsFromStory(story),
        references: ['Taranis Threat Intelligence', 'Story Analysis'],
        audience: ['Security Team', 'Threat Analysts']
      };
    } catch (error) {
      console.error('Erreur génération rapport depuis story:', error);
      return null;
    }
  };

  const generateReportFromNewsItem = async (newsItem: any): Promise<Report | null> => {
    try {
      return {
        id: `news-report-${newsItem.id}`,
        title: `Threat Alert Report: ${newsItem.title}`,
        description: `Critical threat analysis based on news item: ${newsItem.title}`,
        type: 'alert',
        status: 'published',
        severity: newsItem.riskLevel === 'critical' ? 'critical' : 'high',
        author: 'Taranis AI System',
        createdDate: new Date(newsItem.collected || Date.now()),
        updatedDate: new Date(newsItem.last_change || Date.now()),
        publishedDate: new Date(),
        tags: ['Threat Alert', 'Critical', newsItem.source || 'OSINT'],
        content: newsItem.content || newsItem.title,
        executiveSummary: `Critical threat identified: ${newsItem.title}`,
        keyFindings: [
          `Source: ${newsItem.source || 'Unknown'}`,
          `Language: ${newsItem.language || 'Unknown'}`,
          `Risk Level: ${newsItem.riskLevel || 'Unknown'}`,
          `Collected: ${new Date(newsItem.collected).toLocaleDateString()}`
        ],
        recommendations: [
          'Immediate investigation required',
          'Update security monitoring rules',
          'Notify relevant stakeholders'
        ],
        iocs: extractIOCsFromNewsItem(newsItem),
        ttp: [],
        references: [newsItem.source || 'OSINT Source'],
        audience: ['Security Team', 'Incident Response']
      };
    } catch (error) {
      console.error('Erreur génération rapport depuis news item:', error);
      return null;
    }
  };

  const generateBotPerformanceReport = async (bots: any[]): Promise<Report | null> => {
    try {
      const activeBots = bots.filter(bot => bot.status === 'active' || bot.status === 'running');
      const totalProcessed = bots.reduce((sum, bot) => sum + (bot.processedCount || 0), 0);
      const avgSuccessRate = bots.length > 0 
        ? bots.reduce((sum, bot) => sum + (bot.successRate || 0), 0) / bots.length 
        : 0;

      return {
        id: 'bot-performance-report',
        title: 'Bot Performance Analysis Report',
        description: 'Comprehensive analysis of AI bot performance and system health',
        type: 'performance',
        status: 'published',
        severity: avgSuccessRate < 80 ? 'high' : 'medium',
        author: 'Taranis AI System',
        createdDate: new Date(),
        updatedDate: new Date(),
        publishedDate: new Date(),
        tags: ['Performance', 'AI Bots', 'System Health'],
        content: `Analysis of ${bots.length} AI bots with ${activeBots.length} currently active`,
        executiveSummary: `Bot performance analysis shows ${avgSuccessRate.toFixed(1)}% average success rate with ${totalProcessed} total items processed`,
        keyFindings: [
          `Total bots: ${bots.length}`,
          `Active bots: ${activeBots.length}`,
          `Total items processed: ${totalProcessed}`,
          `Average success rate: ${avgSuccessRate.toFixed(1)}%`
        ],
        recommendations: avgSuccessRate < 80 ? [
          'Review bot configurations',
          'Check for system resource constraints',
          'Investigate failed bot executions'
        ] : [
          'Continue monitoring bot performance',
          'Consider scaling successful bots',
          'Maintain current configurations'
        ],
        iocs: [],
        ttp: [],
        references: ['Taranis Bot Analytics'],
        audience: ['System Administrators', 'AI Operations']
      };
    } catch (error) {
      console.error('Erreur génération rapport performance bots:', error);
      return null;
    }
  };

  // ============ FONCTIONS UTILITAIRES D'EXTRACTION ============
  
  const extractIOCsFromStory = (story: any): string[] => {
    const iocs: string[] = [];
    if (story.news_items) {
      story.news_items.forEach((item: any) => {
        if (item.attributes) {
          item.attributes.forEach((attr: any) => {
            if (attr.key === 'ip' || attr.key === 'domain' || attr.key === 'url') {
              iocs.push(attr.value);
            }
          });
        }
      });
    }
    return iocs.slice(0, 5); // Limiter à 5 IOCs
  };

  const extractIOCsFromNewsItem = (newsItem: any): string[] => {
    const iocs: string[] = [];
    if (newsItem.attributes) {
      newsItem.attributes.forEach((attr: any) => {
        if (attr.key === 'ip' || attr.key === 'domain' || attr.key === 'url') {
          iocs.push(attr.value);
        }
      });
    }
    return iocs.slice(0, 3); // Limiter à 3 IOCs
  };

  const extractTTPsFromStory = (story: any): string[] => {
    // Extraire les TTPs basés sur les tags ou le contenu
    const ttps: string[] = [];
    if (story.tags) {
      story.tags.forEach((tag: any) => {
        if (tag.name && tag.name.includes('T')) {
          ttps.push(tag.name);
        }
      });
    }
    return ttps.slice(0, 3); // Limiter à 3 TTPs
  };

  // Fonctions helper pour extraire des informations du contenu
  const extractKeyFindings = (content: string): string[] => {
    const findings: string[] = [];
    const lines = content.split('\n');
    
    // Chercher des sections "Key Findings" ou "Findings"
    let inFindingsSection = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('key finding') || line.toLowerCase().includes('findings:')) {
        inFindingsSection = true;
        continue;
      }
      if (inFindingsSection && line.trim().startsWith('-')) {
        findings.push(line.trim().substring(1).trim());
      }
      if (line.trim() === '' && inFindingsSection && findings.length > 0) {
        break;
      }
    }
    
    return findings.slice(0, 5); // Max 5 findings
  };

  const extractRecommendations = (content: string): string[] => {
    const recommendations: string[] = [];
    const lines = content.split('\n');
    
    let inRecommendationsSection = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('recommendation')) {
        inRecommendationsSection = true;
        continue;
      }
      if (inRecommendationsSection && line.trim().startsWith('-')) {
        recommendations.push(line.trim().substring(1).trim());
      }
      if (line.trim() === '' && inRecommendationsSection && recommendations.length > 0) {
        break;
      }
    }
    
    return recommendations.slice(0, 5);
  };

  const extractIOCs = (content: string): string[] => {
    const iocs: string[] = [];
    
    // Regex pour IPs
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const ips = content.match(ipRegex) || [];
    iocs.push(...ips);
    
    // Regex pour domaines
    const domainRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
    const domains = content.match(domainRegex) || [];
    iocs.push(...domains.slice(0, 10));
    
    // Regex pour hashes (MD5, SHA1, SHA256)
    const hashRegex = /\b[a-f0-9]{32,64}\b/gi;
    const hashes = content.match(hashRegex) || [];
    iocs.push(...hashes);
    
    return [...new Set(iocs)].slice(0, 20); // Unique et max 20
  };

  const extractTTPs = (content: string): string[] => {
    const ttps: string[] = [];
    
    // Regex pour MITRE ATT&CK techniques (T1234, T1234.001, etc.)
    const ttpRegex = /\bT\d{4}(?:\.\d{3})?\b/g;
    const matches = content.match(ttpRegex) || [];
    ttps.push(...matches);
    
    return [...new Set(ttps)]; // Unique
  };

  const createNewReport = () => {
    const newReport: Report = {
      id: `report-${Date.now()}`,
      title: 'New Threat Intelligence Report',
      description: 'Report description...',
      type: 'threat',
      status: 'draft',
      severity: 'medium',
      author: 'Current User',
      createdDate: new Date(),
      updatedDate: new Date(),
      tags: [],
      content: '',
      executiveSummary: '',
      keyFindings: [],
      recommendations: [],
      iocs: [],
      ttp: [],
      references: [],
      audience: []
    };

    setReports(prev => [...prev, newReport]);
    setSelectedReport(newReport);
    setIsCreating(true);
    setIsEditing(true);
  };

  const saveReport = (report: Report) => {
    setReports(prev => prev.map(r => r.id === report.id ? report : r));
    setSelectedReport(report);
    setIsEditing(false);
  };

  const publishReport = (report: Report) => {
    const updatedReport = {
      ...report,
      status: 'published' as const,
      publishedDate: new Date(),
      updatedDate: new Date()
    };
    saveReport(updatedReport);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'threat': return 'bg-red-500/10 text-red-700';
      case 'campaign': return 'bg-orange-500/10 text-orange-700';
      case 'ioc': return 'bg-blue-500/10 text-blue-700';
      case 'attribution': return 'bg-purple-500/10 text-purple-700';
      case 'trend': return 'bg-green-500/10 text-green-700';
      default: return 'bg-gray-500/10 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-500 bg-gray-500/10';
      case 'review': return 'text-yellow-500 bg-yellow-500/10';
      case 'published': return 'text-green-500 bg-green-500/10';
      case 'archived': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const filteredReports = reports.filter(report => {
    if (searchTerm && !report.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !report.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'all' && report.type !== selectedType) return false;
    if (selectedStatus !== 'all' && report.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Reports Builder
          </h2>
          <p className="text-muted-foreground">
            Create and manage threat intelligence reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <Badge variant="outline" className="animate-pulse">
              Chargement depuis Taranis...
            </Badge>
          )}
          {error && (
            <Badge variant="destructive" className="max-w-md truncate">
              {error}
            </Badge>
          )}
          <Button variant="outline">
            <BookOpen className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button onClick={createNewReport}>
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{reports.length}</p>
            <p className="text-sm text-muted-foreground">Total Reports</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {reports.filter(r => r.status === 'published').length}
            </p>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {reports.filter(r => r.status === 'draft').length}
            </p>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {reports.filter(r => r.severity === 'critical' || r.severity === 'high').length}
            </p>
            <p className="text-sm text-muted-foreground">High/Critical</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="threat">Threat</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="ioc">IOC</SelectItem>
                <SelectItem value="attribution">Attribution</SelectItem>
                <SelectItem value="trend">Trend</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des rapports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Reports ({filteredReports.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReport?.id === report.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{report.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {report.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(report.type)}>
                            {report.type}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge className={getSeverityColor(report.severity)}>
                            {report.severity}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {report.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {report.updatedDate.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>{report.iocs.length} IOCs</span>
                          <span>{report.ttp.length} TTPs</span>
                        </div>
                      </div>
                      
                      {report.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {report.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {report.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{report.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détail du rapport sélectionné */}
        <div>
          {selectedReport ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Report Details
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {selectedReport.status === 'draft' && (
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant="outline"
                        size="sm"
                      >
                        {isEditing ? <Eye className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                        {isEditing ? 'View' : 'Edit'}
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={selectedReport.title}
                        onChange={(e) => setSelectedReport({
                          ...selectedReport,
                          title: e.target.value
                        })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={selectedReport.description}
                        onChange={(e) => setSelectedReport({
                          ...selectedReport,
                          description: e.target.value
                        })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={selectedReport.type}
                          onValueChange={(value) => setSelectedReport({
                            ...selectedReport,
                            type: value as any
                          })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="threat">Threat</SelectItem>
                            <SelectItem value="campaign">Campaign</SelectItem>
                            <SelectItem value="ioc">IOC</SelectItem>
                            <SelectItem value="attribution">Attribution</SelectItem>
                            <SelectItem value="trend">Trend</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Severity</label>
                        <Select
                          value={selectedReport.severity}
                          onValueChange={(value) => setSelectedReport({
                            ...selectedReport,
                            severity: value as any
                          })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Executive Summary</label>
                      <Textarea
                        value={selectedReport.executiveSummary}
                        onChange={(e) => setSelectedReport({
                          ...selectedReport,
                          executiveSummary: e.target.value
                        })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => saveReport(selectedReport)}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      {selectedReport.status === 'draft' && (
                        <Button
                          onClick={() => publishReport(selectedReport)}
                          variant="outline"
                          className="flex-1"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Title</h4>
                      <p className="text-sm text-muted-foreground">{selectedReport.title}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">Type</h4>
                        <Badge className={getTypeColor(selectedReport.type)}>
                          {selectedReport.type}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium">Status</h4>
                        <Badge className={getStatusColor(selectedReport.status)}>
                          {selectedReport.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Severity</h4>
                      <Badge className={getSeverityColor(selectedReport.severity)}>
                        {selectedReport.severity}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Author</h4>
                      <p className="text-sm text-muted-foreground">{selectedReport.author}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Created</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.createdDate.toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Last Updated</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.updatedDate.toLocaleDateString()}
                      </p>
                    </div>
                    
                    {selectedReport.publishedDate && (
                      <div>
                        <h4 className="font-medium">Published</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedReport.publishedDate.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium">Executive Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedReport.executiveSummary || 'No summary provided'}
                      </p>
                    </div>
                    
                    {selectedReport.keyFindings.length > 0 && (
                      <div>
                        <h4 className="font-medium">Key Findings</h4>
                        <ul className="space-y-1">
                          {selectedReport.keyFindings.map((finding, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedReport.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium">Recommendations</h4>
                        <ul className="space-y-1">
                          {selectedReport.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedReport.iocs.length > 0 && (
                      <div>
                        <h4 className="font-medium">IOCs</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedReport.iocs.map((ioc) => (
                            <Badge key={ioc} variant="outline" className="text-xs">
                              {ioc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedReport.ttp.length > 0 && (
                      <div>
                        <h4 className="font-medium">TTPs</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedReport.ttp.map((ttp) => (
                            <Badge key={ttp} variant="outline" className="text-xs">
                              {ttp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedReport.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedReport.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a Report</p>
                  <p className="text-sm">Choose a report from the list to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
