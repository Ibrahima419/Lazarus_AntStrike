import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Search, Play, Download, Share, GitBranch, Target, Zap, Brain, Network, AlertTriangle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar } from 'recharts';

const correlationData = [
  { 
    id: 'corr-001',
    title: 'APT29 Infrastructure Overlap',
    confidence: 92,
    entities: ['185.159.157.13', 'malicious-c2.com', 'APT29'],
    type: 'Infrastructure Correlation',
    discovered: '2024-01-21T10:30:00Z',
    indicators: 15,
    techniques: ['T1071.001', 'T1095']
  },
  {
    id: 'corr-002', 
    title: 'Emotet Delivery Chain',
    confidence: 87,
    entities: ['phishing-email.exe', 'download-server.biz', 'TA542'],
    type: 'Kill Chain Analysis',
    discovered: '2024-01-20T14:20:00Z',
    indicators: 23,
    techniques: ['T1566.001', 'T1055', 'T1082']
  },
  {
    id: 'corr-003',
    title: 'BlackCat Ransomware TTPs',
    confidence: 78,
    entities: ['ALPHV Ransomware', 'BlackCat', 'Healthcare Sector'],
    type: 'TTP Clustering',
    discovered: '2024-01-19T09:15:00Z',
    indicators: 34,
    techniques: ['T1486', 'T1490', 'T1083']
  }
];

const attackPathData = [
  { step: 'Initial Access', techniques: 12, frequency: 85 },
  { step: 'Execution', techniques: 8, frequency: 92 },
  { step: 'Persistence', techniques: 15, frequency: 67 },
  { step: 'Privilege Escalation', techniques: 10, frequency: 73 },
  { step: 'Defense Evasion', techniques: 22, frequency: 89 },
  { step: 'Credential Access', techniques: 7, frequency: 56 },
  { step: 'Discovery', techniques: 18, frequency: 78 },
  { step: 'Lateral Movement', techniques: 6, frequency: 45 },
  { step: 'Collection', techniques: 9, frequency: 62 },
  { step: 'Exfiltration', techniques: 5, frequency: 34 },
  { step: 'Impact', techniques: 11, frequency: 41 }
];

const threatEvolutionData = [
  { month: '2023-08', apt29: 45, lazarus: 32, blackcat: 12 },
  { month: '2023-09', apt29: 52, lazarus: 28, blackcat: 18 },
  { month: '2023-10', apt29: 38, lazarus: 35, blackcat: 25 },
  { month: '2023-11', apt29: 61, lazarus: 42, blackcat: 31 },
  { month: '2023-12', apt29: 74, lazarus: 38, blackcat: 45 },
  { month: '2024-01', apt29: 89, lazarus: 29, blackcat: 52 }
];

const riskScoreData = [
  { entity: 'APT29', riskScore: 95, indicators: 47, lastActivity: '2h ago' },
  { entity: 'Lazarus Group', riskScore: 88, indicators: 34, lastActivity: '6h ago' },
  { entity: 'BlackCat', riskScore: 82, indicators: 52, lastActivity: '4h ago' },
  { entity: 'Emotet', riskScore: 76, indicators: 156, lastActivity: '1h ago' },
  { entity: 'Cobalt Strike', riskScore: 91, indicators: 89, lastActivity: '3h ago' }
];

const getConfidenceBadge = (confidence: number) => {
  if (confidence >= 90) {
    return <Badge className="bg-green-500 hover:bg-green-600">High ({confidence}%)</Badge>;
  } else if (confidence >= 70) {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium ({confidence}%)</Badge>;
  } else {
    return <Badge className="bg-red-500 hover:bg-red-600">Low ({confidence}%)</Badge>;
  }
};

const getRiskBadge = (score: number) => {
  if (score >= 90) {
    return <Badge variant="destructive">Critical ({score})</Badge>;
  } else if (score >= 70) {
    return <Badge className="bg-orange-500 hover:bg-orange-600">High ({score})</Badge>;
  } else if (score >= 50) {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium ({score})</Badge>;
  } else {
    return <Badge className="bg-green-500 hover:bg-green-600">Low ({score})</Badge>;
  }
};

export function AnalysisDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Threat Analysis & Correlation</h1>
          <p className="text-muted-foreground">Advanced analytics and threat intelligence correlation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Analysis
          </Button>
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Analysis Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Correlations</CardTitle>
            <GitBranch className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <div className="text-xs text-muted-foreground">
              +23 this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <div className="text-xs text-muted-foreground">
              Confidence ≥ 80%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score Avg</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76.4</div>
            <div className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +2.3 from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MITRE Techniques</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">134</div>
            <div className="text-xs text-muted-foreground">
              Techniques observed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different analysis views */}
      <Tabs defaultValue="correlations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="attack-paths">Attack Paths</TabsTrigger>
          <TabsTrigger value="evolution">Threat Evolution</TabsTrigger>
          <TabsTrigger value="risk-scoring">Risk Scoring</TabsTrigger>
        </TabsList>

        <TabsContent value="correlations" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search correlations..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Correlation Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="kill-chain">Kill Chain</SelectItem>
                <SelectItem value="ttp">TTP Clustering</SelectItem>
                <SelectItem value="timeline">Timeline</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (≥80%)</SelectItem>
                <SelectItem value="medium">Medium (≥60%)</SelectItem>
                <SelectItem value="low">Low (&lt;60%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Intelligence Correlations</CardTitle>
              <CardDescription>
                Automated correlations between threat intelligence entities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correlationData.map((correlation) => (
                  <div key={correlation.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <GitBranch className="w-5 h-5 text-blue-500" />
                        <h4 className="font-medium">{correlation.title}</h4>
                        {getConfidenceBadge(correlation.confidence)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Network className="w-4 h-4 mr-2" />
                          Visualize
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <Badge variant="outline">{correlation.type}</Badge>
                      <Badge variant="secondary">{correlation.indicators} indicators</Badge>
                      <span className="text-sm text-muted-foreground">
                        Discovered {new Date(correlation.discovered).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Related Entities:</span>
                        <div className="flex gap-2 mt-1">
                          {correlation.entities.map((entity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {entity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">MITRE Techniques:</span>
                        <div className="flex gap-2 mt-1">
                          {correlation.techniques.map((technique, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {technique}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attack-paths" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>MITRE ATT&CK Technique Frequency</CardTitle>
                <CardDescription>Most observed techniques across all threats</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={attackPathData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="step" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attack Path Analysis</CardTitle>
                <CardDescription>Common attack progression patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attackPathData.slice(0, 6).map((step, index) => (
                    <div key={step.step} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{step.step}</div>
                          <div className="text-sm text-muted-foreground">{step.techniques} techniques</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={step.frequency} className="w-20" />
                        <span className="text-sm font-medium">{step.frequency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kill Chain Visualization</CardTitle>
              <CardDescription>Interactive attack chain analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
                <div className="text-center">
                  <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Interactive Kill Chain Graph</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Visualize attack progression and technique relationships
                  </p>
                  <Button variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Generate Visualization
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Actor Activity Trends</CardTitle>
              <CardDescription>Evolution of threat actor activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={threatEvolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="apt29" stroke="#ef4444" strokeWidth={2} name="APT29" />
                  <Line type="monotone" dataKey="lazarus" stroke="#f97316" strokeWidth={2} name="Lazarus Group" />
                  <Line type="monotone" dataKey="blackcat" stroke="#eab308" strokeWidth={2} name="BlackCat" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Technique Evolution</CardTitle>
                <CardDescription>Emerging and declining techniques</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Emerging Techniques</h4>
                    <div className="space-y-2">
                      {['T1071.004 - DNS', 'T1557.001 - LLMNR/NBT-NS', 'T1087.002 - Domain Account'].map((technique, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{technique}</span>
                          <Badge className="bg-green-500 hover:bg-green-600">
                            +{Math.floor(Math.random() * 50 + 20)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Declining Techniques</h4>
                    <div className="space-y-2">
                      {['T1055 - Process Injection', 'T1036 - Masquerading', 'T1053 - Scheduled Task'].map((technique, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{technique}</span>
                          <Badge variant="secondary">
                            -{Math.floor(Math.random() * 30 + 10)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sector Targeting Trends</CardTitle>
                <CardDescription>Changes in sector targeting over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Healthcare', 'Financial', 'Government', 'Technology', 'Energy'].map((sector, index) => (
                    <div key={sector} className="flex items-center justify-between">
                      <span className="font-medium">{sector}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.floor(Math.random() * 100)} className="w-24" />
                        <span className="text-sm">{Math.floor(Math.random() * 50 + 25)}%</span>
                        <Badge variant={Math.random() > 0.5 ? "default" : "secondary"}>
                          {Math.random() > 0.5 ? "+" : "-"}{Math.floor(Math.random() * 20 + 5)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk-scoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entity Risk Scoring</CardTitle>
              <CardDescription>
                AI-powered risk assessment for threat entities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskScoreData.map((entity) => (
                  <div key={entity.entity} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <div>
                          <div className="font-medium">{entity.entity}</div>
                          <div className="text-sm text-muted-foreground">
                            {entity.indicators} indicators • Last activity: {entity.lastActivity}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">Risk Score</div>
                        <Progress value={entity.riskScore} className="w-24 mt-1" />
                      </div>
                      {getRiskBadge(entity.riskScore)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Factors</CardTitle>
                <CardDescription>Key factors contributing to risk scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { factor: 'Active C2 Infrastructure', weight: 35, impact: 'Critical' },
                    { factor: 'Recent Campaign Activity', weight: 25, impact: 'High' },
                    { factor: 'Novel TTPs', weight: 20, impact: 'High' },
                    { factor: 'Target Sector Overlap', weight: 15, impact: 'Medium' },
                    { factor: 'Historical Success Rate', weight: 5, impact: 'Low' }
                  ].map((factor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{factor.factor}</div>
                        <div className="text-sm text-muted-foreground">Weight: {factor.weight}%</div>
                      </div>
                      <Badge variant={
                        factor.impact === 'Critical' ? 'destructive' :
                        factor.impact === 'High' ? 'default' :
                        factor.impact === 'Medium' ? 'secondary' : 'outline'
                      }>
                        {factor.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prediction Model</CardTitle>
                <CardDescription>ML model performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Model Accuracy</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20" />
                      <span className="font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Precision</span>
                    <div className="flex items-center gap-2">
                      <Progress value={89} className="w-20" />
                      <span className="font-medium">89%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Recall</span>
                    <div className="flex items-center gap-2">
                      <Progress value={94} className="w-20" />
                      <span className="font-medium">94%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>F1 Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={91} className="w-20" />
                      <span className="font-medium">91%</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Model last trained: 2024-01-15<br />
                      Training data: 50,000+ samples<br />
                      Next training: 2024-01-29
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}