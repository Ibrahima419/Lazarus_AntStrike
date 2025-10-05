import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  FileText, Download, Calendar, TrendingUp, TrendingDown, Users, 
  DollarSign, Clock, AlertTriangle, Shield, Target, BarChart3, 
  PieChart, Settings, Send, Eye, Edit, Plus, Search 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

// Business Impact Metrics
const businessMetrics = {
  costSavings: {
    monthly: 45000,
    yearly: 540000,
    trend: '+23%'
  },
  efficiency: {
    timeToDetection: '2.3h', // down from 6h
    timeToResponse: '45min', // down from 3h
    falsePositiveRate: '12%', // down from 35%
    analystProductivity: '+67%'
  },
  riskReduction: {
    criticalThreats: 23, // down from 89
    meanTimeToRemediation: '4.2h', // down from 24h
    securityPosture: '89%', // up from 67%
    complianceScore: '94%'
  }
};

// Executive Reports Data
const executiveReports = [
  {
    id: 'exec-001',
    title: 'Q1 2024 Cyber Threat Landscape',
    type: 'Executive Summary',
    author: 'Sarah Chen',
    created: '2024-01-21T09:00:00Z',
    lastModified: '2024-01-21T14:30:00Z',
    status: 'Published',
    audience: 'Board of Directors',
    keyFindings: [
      'APT29 campaign blocked - potential $2.3M loss avoided',
      '67% improvement in analyst efficiency',
      '45% reduction in false positive alerts'
    ],
    businessImpact: 'High',
    confidentiality: 'Restricted'
  },
  {
    id: 'exec-002',
    title: 'Ransomware Risk Assessment',
    type: 'Risk Report',
    author: 'Mike Rodriguez',
    created: '2024-01-20T11:15:00Z',
    lastModified: '2024-01-21T10:20:00Z',
    status: 'Under Review',
    audience: 'CISO & Security Leadership',
    keyFindings: [
      'BlackCat ransomware targeting healthcare sector',
      '$150K investment needed for enhanced protection',
      '23% increase in ransomware attempts this quarter'
    ],
    businessImpact: 'Critical',
    confidentiality: 'Internal'
  },
  {
    id: 'exec-003',
    title: 'CTI Program ROI Analysis',
    type: 'Business Case',
    author: 'Lisa Wang',
    created: '2024-01-19T16:45:00Z',
    lastModified: '2024-01-20T09:10:00Z',
    status: 'Published',
    audience: 'CFO & Executive Team',
    keyFindings: [
      '340% ROI on CTI platform investment',
      '2.1 FTE saved through automation',
      '$540K annual cost avoidance achieved'
    ],
    businessImpact: 'High',
    confidentiality: 'Confidential'
  }
];

// Technical Reports
const technicalReports = [
  {
    id: 'tech-001',
    title: 'APT29 Campaign Technical Analysis',
    type: 'Threat Analysis',
    author: 'David Kim',
    created: '2024-01-21T08:30:00Z',
    ttps: ['T1566.001', 'T1059.001', 'T1055'],
    iocs: 47,
    confidence: 'High',
    severity: 'Critical'
  },
  {
    id: 'tech-002',
    title: 'Emotet Infrastructure Mapping',
    type: 'Infrastructure Report',
    author: 'Emma Johnson',
    created: '2024-01-20T14:20:00Z',
    ttps: ['T1071.001', 'T1105', 'T1082'],
    iocs: 156,
    confidence: 'High',
    severity: 'High'
  }
];

// Performance Analytics
const analystPerformance = [
  { month: 'Oct', casesResolved: 45, avgTime: 4.2, efficiency: 78 },
  { month: 'Nov', casesResolved: 52, avgTime: 3.8, efficiency: 82 },
  { month: 'Dec', casesResolved: 61, avgTime: 3.1, efficiency: 87 },
  { month: 'Jan', casesResolved: 74, avgTime: 2.3, efficiency: 94 }
];

const costSavingsData = [
  { month: 'Q4 2023', prevented: 120000, investment: 45000, roi: 167 },
  { month: 'Q1 2024', prevented: 230000, investment: 52000, roi: 342 }
];

const threatCategoriesData = [
  { name: 'Phishing', incidents: 45, cost: 67500, color: '#ef4444' },
  { name: 'Malware', incidents: 32, cost: 48000, color: '#f97316' },
  { name: 'Ransomware', incidents: 18, cost: 270000, color: '#eab308' },
  { name: 'Data Breach', incidents: 12, cost: 180000, color: '#22c55e' },
  { name: 'Insider Threat', incidents: 8, cost: 45000, color: '#3b82f6' }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Published':
      return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
    case 'Under Review':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>;
    case 'Draft':
      return <Badge variant="secondary">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getImpactBadge = (impact: string) => {
  switch (impact) {
    case 'Critical':
      return <Badge variant="destructive">{impact}</Badge>;
    case 'High':
      return <Badge className="bg-orange-500 hover:bg-orange-600">{impact}</Badge>;
    case 'Medium':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{impact}</Badge>;
    default:
      return <Badge variant="secondary">{impact}</Badge>;
  }
};

const getConfidentialityBadge = (level: string) => {
  switch (level) {
    case 'Restricted':
      return <Badge variant="destructive">{level}</Badge>;
    case 'Confidential':
      return <Badge className="bg-orange-500 hover:bg-orange-600">{level}</Badge>;
    case 'Internal':
      return <Badge className="bg-blue-500 hover:bg-blue-600">{level}</Badge>;
    default:
      return <Badge variant="secondary">{level}</Badge>;
  }
};

export function ReportsDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-muted-foreground">Business intelligence and threat reporting platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Business Impact Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${businessMetrics.costSavings.yearly.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
              {businessMetrics.costSavings.trend} vs last year
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time to Detection</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessMetrics.efficiency.timeToDetection}</div>
            <div className="text-xs text-muted-foreground">
              <TrendingDown className="w-3 h-3 inline mr-1 text-green-500" />
              62% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyst Productivity</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessMetrics.efficiency.analystProductivity}</div>
            <div className="text-xs text-muted-foreground">
              Efficiency improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Posture</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessMetrics.riskReduction.securityPosture}</div>
            <div className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
              +22 points improvement
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different report types */}
      <Tabs defaultValue="executive" className="space-y-4">
        <TabsList>
          <TabsTrigger value="executive">Executive Reports</TabsTrigger>
          <TabsTrigger value="technical">Technical Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="roi">ROI Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search executive reports..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="board">Board of Directors</SelectItem>
                <SelectItem value="ciso">CISO & Leadership</SelectItem>
                <SelectItem value="cfo">CFO & Finance</SelectItem>
                <SelectItem value="executives">Executive Team</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Impact Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Executive Reports</CardTitle>
              <CardDescription>
                Business-focused threat intelligence reports for leadership
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executiveReports.map((report) => (
                  <div key={report.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{report.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{report.type}</Badge>
                            {getStatusBadge(report.status)}
                            {getImpactBadge(report.businessImpact)}
                            {getConfidentialityBadge(report.confidentiality)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Target Audience:</span>
                        <span className="text-sm text-muted-foreground ml-2">{report.audience}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Key Business Findings:</span>
                        <ul className="mt-1 space-y-1">
                          {report.keyFindings.map((finding, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Author: {report.author}</span>
                        <span>•</span>
                        <span>Created: {new Date(report.created).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Last modified: {new Date(report.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Analysis Reports</CardTitle>
              <CardDescription>
                In-depth technical analysis for security teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>MITRE TTPs</TableHead>
                    <TableHead>IOCs</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicalReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="font-medium">{report.title}</div>
                            <div className="text-sm text-muted-foreground">{report.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {report.author.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.author}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {report.ttps.map((ttp, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {ttp}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.iocs}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={report.confidence === 'High' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {report.confidence}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.severity === 'Critical' ? 
                          <Badge variant="destructive">{report.severity}</Badge> :
                          <Badge className="bg-orange-500">{report.severity}</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(report.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyst Performance Trends</CardTitle>
                <CardDescription>Team efficiency and case resolution metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analystPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="efficiency" stroke="#22c55e" strokeWidth={2} name="Efficiency %" />
                    <Line type="monotone" dataKey="casesResolved" stroke="#3b82f6" strokeWidth={2} name="Cases Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threat Category Impact</CardTitle>
                <CardDescription>Financial impact by threat category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={threatCategoriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Financial Impact']} />
                    <Bar dataKey="cost" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Critical metrics tracking operational efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-green-600">2.3h</div>
                  <div className="text-sm text-muted-foreground">Avg Time to Detection</div>
                  <div className="text-xs text-green-600">↓ 62% improvement</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-blue-600">45min</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                  <div className="text-xs text-blue-600">↓ 75% improvement</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-purple-600">12%</div>
                  <div className="text-sm text-muted-foreground">False Positive Rate</div>
                  <div className="text-xs text-purple-600">↓ 66% reduction</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-2xl font-bold text-orange-600">94%</div>
                  <div className="text-sm text-muted-foreground">SLA Compliance</div>
                  <div className="text-xs text-orange-600">↑ 18% improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
                <CardDescription>Investment vs. cost avoidance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costSavingsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="prevented" fill="#22c55e" name="Cost Prevented" />
                    <Bar dataKey="investment" fill="#3b82f6" name="Investment" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown Analysis</CardTitle>
                <CardDescription>Where the savings come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Incident Prevention</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-24" />
                      <span className="text-sm font-medium">$243K</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Analyst Time Savings</span>
                    <div className="flex items-center gap-2">
                      <Progress value={35} className="w-24" />
                      <span className="text-sm font-medium">$189K</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>False Positive Reduction</span>
                    <div className="flex items-center gap-2">
                      <Progress value={20} className="w-24" />
                      <span className="text-sm font-medium">$108K</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Business Impact Summary</CardTitle>
              <CardDescription>Comprehensive ROI and business value metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-border rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-green-600">340%</div>
                  <div className="text-sm text-muted-foreground">Return on Investment</div>
                  <div className="text-xs text-green-600 mt-1">$540K saved vs $158K invested</div>
                </div>
                
                <div className="text-center p-6 border border-border rounded-lg">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-blue-600">2.1</div>
                  <div className="text-sm text-muted-foreground">FTE Equivalents Saved</div>
                  <div className="text-xs text-blue-600 mt-1">Through automation & efficiency</div>
                </div>
                
                <div className="text-center p-6 border border-border rounded-lg">
                  <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-purple-600">74%</div>
                  <div className="text-sm text-muted-foreground">Risk Reduction</div>
                  <div className="text-xs text-purple-600 mt-1">Critical threats mitigated</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Executive Summary</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  The CTI platform investment has delivered exceptional value with a 340% ROI in just 6 months. 
                  Key achievements include preventing $2.3M in potential breach costs, reducing analyst workload by 67%, 
                  and improving threat detection time from 6 hours to 2.3 hours. The platform has eliminated tool 
                  fragmentation pain points while providing executive visibility into cyber risk metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}