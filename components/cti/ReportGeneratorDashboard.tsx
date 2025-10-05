/**
 * Report Generator Dashboard
 * Interface pour créer, prévisualiser et exporter des rapports CTI
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Mail,
  MessageSquare,
  FileJson,
  FileCode
} from 'lucide-react';
import { 
  generateCTIReport,
  exportToMarkdown,
  exportToJSON,
  REPORT_TEMPLATES,
  type CTIReport
} from './services/report-generator-service';

export function ReportGeneratorDashboard() {
  const [reportTitle, setReportTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('full-analysis');
  const [analystName, setAnalystName] = useState('CTI Analyst');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<CTIReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('configure');

  const handleGenerateReport = async () => {
    if (!reportTitle.trim()) {
      setError('Le titre du rapport est requis');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const report = await generateCTIReport(reportTitle, selectedTemplate, analystName);
      setGeneratedReport(report);
      setActiveTab('preview');
    } catch (err) {
      console.error('Erreur génération rapport:', err);
      setError('Impossible de générer le rapport. Vérifiez que Taranis AI est connecté.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!generatedReport) return;
    
    const markdown = exportToMarkdown(generatedReport);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.id}_report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!generatedReport) return;
    
    const json = exportToJSON(generatedReport);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.id}_report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareEmail = () => {
    if (!generatedReport) return;
    
    const subject = encodeURIComponent(generatedReport.title);
    const body = encodeURIComponent(`
Bonjour,

Je partage avec vous le rapport CTI suivant :

Titre : ${generatedReport.title}
Date : ${generatedReport.createdAt.toLocaleDateString()}
Sévérité : ${generatedReport.severity}
Confiance : ${(generatedReport.confidence * 100).toFixed(0)}%

${generatedReport.summary}

---
Rapport complet disponible dans AntStrike CTI Platform.

Cordialement,
${generatedReport.createdBy}
    `);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const selectedTemplateData = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Générateur de Rapports CTI</h1>
          <p className="text-muted-foreground">
            Créez des rapports structurés depuis les données Taranis AI
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Powered by Taranis AI
        </Badge>
      </div>

      {/* Erreur */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configure">Configuration</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedReport}>Prévisualisation</TabsTrigger>
          <TabsTrigger value="export" disabled={!generatedReport}>Export & Partage</TabsTrigger>
        </TabsList>

        {/* Tab Configuration */}
        <TabsContent value="configure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration du Rapport</CardTitle>
                <CardDescription>
                  Définissez les paramètres de génération
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du Rapport *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Analyse APT29 - Q4 2024"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analyst">Nom de l'Analyste</Label>
                  <Input
                    id="analyst"
                    placeholder="Votre nom"
                    value={analystName}
                    onChange={(e) => setAnalystName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template de Rapport</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TEMPLATES.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplateData && (
                    <p className="text-sm text-muted-foreground">
                      {selectedTemplateData.description}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleGenerateReport} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Générer le Rapport
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Aperçu Template */}
            <Card>
              <CardHeader>
                <CardTitle>Sections Incluses</CardTitle>
                <CardDescription>
                  Contenu du template sélectionné
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTemplateData && (
                  <div className="space-y-3">
                    {selectedTemplateData.sections.map((section, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium capitalize">{section.replace('-', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {getSectionDescription(section)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Génération Automatique</h4>
                  <p className="text-sm text-muted-foreground">
                    Le rapport sera généré automatiquement à partir des données Taranis AI : 
                    news items, menaces géolocalisées, IOCs, TTPs MITRE ATT&CK, campagnes actives, etc.
                    Toutes les informations sont extraites et structurées intelligemment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Prévisualisation */}
        <TabsContent value="preview" className="space-y-6">
          {generatedReport && (
            <>
              {/* Header du rapport */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{generatedReport.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Créé le {generatedReport.createdAt.toLocaleDateString()} par {generatedReport.createdBy}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={generatedReport.severity === 'critical' ? 'destructive' : 'default'}>
                        {generatedReport.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        Confiance: {(generatedReport.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedReport.threatActor && (
                    <div>
                      <span className="font-semibold">Threat Actor: </span>
                      <Badge variant="secondary">{generatedReport.threatActor}</Badge>
                    </div>
                  )}
                  {generatedReport.campaign && (
                    <div>
                      <span className="font-semibold">Campagne: </span>
                      <Badge variant="secondary">{generatedReport.campaign}</Badge>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {generatedReport.tags.slice(0, 10).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Executive Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{generatedReport.executiveSummary}</p>
                </CardContent>
              </Card>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-500">
                      {generatedReport.geographicDistribution.totalThreats}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Menaces</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-500">
                      {generatedReport.iocs.total}
                    </div>
                    <p className="text-sm text-muted-foreground">IOCs Collectés</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-500">
                      {generatedReport.geographicDistribution.affectedCountries.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Pays Affectés</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-500">
                      {generatedReport.recommendations.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Recommandations</p>
                  </CardContent>
                </Card>
              </div>

              {/* IOCs */}
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Indicateurs de Compromission (Top 20)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="ips" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="ips">
                        IPs ({generatedReport.iocs.ipAddresses.length})
                      </TabsTrigger>
                      <TabsTrigger value="domains">
                        Domaines ({generatedReport.iocs.domains.length})
                      </TabsTrigger>
                      <TabsTrigger value="hashes">
                        Hashes ({generatedReport.iocs.fileHashes.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ips">
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {generatedReport.iocs.ipAddresses.slice(0, 20).map((ioc, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                            <code className="text-sm">{ioc.value}</code>
                            <Badge variant="outline">
                              {(ioc.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="domains">
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {generatedReport.iocs.domains.slice(0, 20).map((ioc, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                            <code className="text-sm">{ioc.value}</code>
                            <Badge variant="outline">
                              {(ioc.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="hashes">
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {generatedReport.iocs.fileHashes.slice(0, 20).map((ioc, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                            <code className="text-sm text-xs">{ioc.value}</code>
                            <Badge variant="outline">{ioc.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Recommandations */}
              <Card>
                <CardHeader>
                  <CardTitle>✅ Recommandations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {generatedReport.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-semibold">{i + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab Export */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Formats */}
            <Card>
              <CardHeader>
                <CardTitle>Formats d'Export</CardTitle>
                <CardDescription>
                  Téléchargez le rapport dans différents formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleExportMarkdown}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Markdown (.md)
                </Button>

                <Button 
                  onClick={handleExportJSON}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Export JSON (.json)
                </Button>

                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  Export STIX 2.1 (Bientôt)
                </Button>

                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF (Bientôt)
                </Button>
              </CardContent>
            </Card>

            {/* Partage */}
            <Card>
              <CardHeader>
                <CardTitle>Partager le Rapport</CardTitle>
                <CardDescription>
                  Envoyez le rapport à vos collègues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleShareEmail}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Partager par Email
                </Button>

                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Partager sur Slack (Bientôt)
                </Button>

                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager sur Teams (Bientôt)
                </Button>

                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Générer Lien de Partage (Bientôt)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Rapport Généré avec Succès</h4>
                  <p className="text-sm text-muted-foreground">
                    Votre rapport est prêt à être exporté et partagé avec votre équipe. 
                    Tous les formats d'export incluent les données complètes extraites depuis Taranis AI.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getSectionDescription(section: string): string {
  const descriptions: Record<string, string> = {
    'executive': 'Résumé exécutif pour le management',
    'technical': 'Analyse technique détaillée',
    'geographic': 'Distribution géographique des menaces',
    'iocs': 'Liste des indicateurs de compromission',
    'ttps': 'Tactiques, techniques et procédures',
    'timeline': 'Chronologie des événements',
    'recommendations': 'Actions recommandées'
  };
  return descriptions[section] || section;
}

