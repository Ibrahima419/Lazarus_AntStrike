import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Search, Download, RefreshCw, Globe, Database, Hash, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const intelligenceFeeds = [
  {
    id: 'feed-001',
    name: 'MISP Threat Intelligence',
    type: 'MISP',
    status: 'Active',
    lastSync: '2024-01-21T14:30:00Z',
    indicators: 12847,
    reliability: 'High',
    url: 'https://misp.example.org'
  },
  {
    id: 'feed-002',
    name: 'AlienVault OTX',
    type: 'TAXII',
    status: 'Active',
    lastSync: '2024-01-21T14:25:00Z',
    indicators: 8934,
    reliability: 'Medium',
    url: 'https://otx.alienvault.com'
  },
  {
    id: 'feed-003',
    name: 'VirusTotal Intelligence',
    type: 'API',
    status: 'Active',
    lastSync: '2024-01-21T14:20:00Z',
    indicators: 15672,
    reliability: 'High',
    url: 'https://www.virustotal.com'
  },
  {
    id: 'feed-004',
    name: 'Cyber Threat Alliance',
    type: 'STIX',
    status: 'Warning',
    lastSync: '2024-01-21T12:45:00Z',
    indicators: 5432,
    reliability: 'High',
    url: 'https://cyberthreatalliance.org'
  },
  {
    id: 'feed-005',
    name: 'Internal IOCs',
    type: 'Manual',
    status: 'Active',
    lastSync: '2024-01-21T14:35:00Z',
    indicators: 2847,
    reliability: 'High',
    url: 'Internal Source'
  }
];

const recentIOCs = [
  {
    id: 'ioc-001',
    indicator: '192.168.1.100',
    type: 'IP Address',
    threatLevel: 'High',
    firstSeen: '2024-01-21T10:30:00Z',
    source: 'MISP',
    tags: ['APT29', 'Command & Control'],
    confidence: 85
  },
  {
    id: 'ioc-002',
    indicator: 'malware.exe',
    type: 'File Hash',
    threatLevel: 'Critical',
    firstSeen: '2024-01-21T09:15:00Z',
    source: 'VirusTotal',
    tags: ['Emotet', 'Banking Trojan'],
    confidence: 95
  },
  {
    id: 'ioc-003',
    indicator: 'evil-domain.com',
    type: 'Domain',
    threatLevel: 'Medium',
    firstSeen: '2024-01-21T08:45:00Z',
    source: 'AlienVault OTX',
    tags: ['Phishing', 'Social Engineering'],
    confidence: 75
  },
  {
    id: 'ioc-004',
    indicator: 'HKEY_LOCAL_MACHINE\\Software\\Evil',
    type: 'Registry Key',
    threatLevel: 'High',
    firstSeen: '2024-01-21T07:20:00Z',
    source: 'Internal',
    tags: ['Persistence', 'Registry Modification'],
    confidence: 90
  }
];

const stixObjects = [
  {
    id: 'stix-001',
    type: 'Attack Pattern',
    name: 'Spearphishing Attachment',
    stixId: 'attack-pattern--3f18edba-28f4-4bb9-82c3-8aa60dcac5f7',
    created: '2024-01-20T10:30:00Z',
    techniques: ['T1566.001']
  },
  {
    id: 'stix-002',
    type: 'Malware',
    name: 'Emotet',
    stixId: 'malware--fdd60b30-b67c-41e3-b0b9-f01faf20d111',
    created: '2024-01-19T15:20:00Z',
    techniques: ['T1055', 'T1082', 'T1083']
  },
  {
    id: 'stix-003',
    type: 'Threat Actor',
    name: 'APT29',
    stixId: 'threat-actor--899ce53f-13a0-479b-a0e4-67d46e241542',
    created: '2024-01-18T12:45:00Z',
    techniques: ['T1566', 'T1059', 'T1105']
  },
  {
    id: 'stix-004',
    type: 'Infrastructure',
    name: 'Command and Control Server',
    stixId: 'infrastructure--38c47d93-d984-4fd9-b87b-d69d5841628d',
    created: '2024-01-17T09:15:00Z',
    techniques: ['T1071.001']
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Active':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'Warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'Error':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getThreatLevelBadge = (level: string) => {
  switch (level) {
    case 'Critical':
      return <Badge variant="destructive">{level}</Badge>;
    case 'High':
      return <Badge className="bg-orange-500 hover:bg-orange-600">{level}</Badge>;
    case 'Medium':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{level}</Badge>;
    case 'Low':
      return <Badge className="bg-green-500 hover:bg-green-600">{level}</Badge>;
    default:
      return <Badge variant="secondary">{level}</Badge>;
  }
};

export function IntelligenceDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Threat Intelligence Feeds</h1>
          <p className="text-muted-foreground">Manage intelligence sources and indicators of compromise</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export STIX
          </Button>
          <Button size="sm">
            Add Feed
          </Button>
        </div>
      </div>

      {/* Intelligence Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total IOCs</CardTitle>
            <Hash className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,732</div>
            <div className="text-xs text-muted-foreground">
              +2,341 today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Feeds</CardTitle>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <div className="text-xs text-muted-foreground">
              4 healthy, 1 warning
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">STIX Objects</CardTitle>
            <Database className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-xs text-muted-foreground">
              +89 this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <div className="text-xs text-muted-foreground">
              Confidence ≥ 80%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="feeds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feeds">Intelligence Feeds</TabsTrigger>
          <TabsTrigger value="iocs">Indicators (IOCs)</TabsTrigger>
          <TabsTrigger value="stix">STIX Objects</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="feeds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligence Feeds Status</CardTitle>
              <CardDescription>
                Monitor and manage threat intelligence data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feed Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Indicators</TableHead>
                    <TableHead>Reliability</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intelligenceFeeds.map((feed) => (
                    <TableRow key={feed.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{feed.name}</div>
                          <div className="text-sm text-muted-foreground">{feed.url}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{feed.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(feed.status)}
                          <span>{feed.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{feed.indicators.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={feed.reliability === 'High' ? 'default' : 'secondary'}
                        >
                          {feed.reliability}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(feed.lastSync).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iocs" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search IOCs..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="IOC Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ip">IP Address</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="hash">File Hash</SelectItem>
                <SelectItem value="registry">Registry Key</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Threat Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Indicators of Compromise</CardTitle>
              <CardDescription>
                Latest IOCs from all intelligence feeds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicator</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Threat Level</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>First Seen</TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentIOCs.map((ioc) => (
                    <TableRow key={ioc.id}>
                      <TableCell>
                        <div className="font-mono text-sm">{ioc.indicator}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ioc.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {getThreatLevelBadge(ioc.threatLevel)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={ioc.confidence} className="w-16" />
                          <span className="text-sm">{ioc.confidence}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ioc.source}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(ioc.firstSeen).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {ioc.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>STIX Objects</CardTitle>
              <CardDescription>
                Structured Threat Information eXpression objects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>STIX ID</TableHead>
                    <TableHead>MITRE Techniques</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stixObjects.map((obj) => (
                    <TableRow key={obj.id}>
                      <TableCell>
                        <div className="font-medium">{obj.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{obj.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">{obj.stixId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {obj.techniques.map((technique, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {technique}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(obj.created).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>IOC Type Distribution</CardTitle>
                <CardDescription>Distribution of indicator types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>IP Addresses</span>
                    <div className="flex items-center gap-2">
                      <Progress value={35} className="w-24" />
                      <span className="text-sm">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>File Hashes</span>
                    <div className="flex items-center gap-2">
                      <Progress value={28} className="w-24" />
                      <span className="text-sm">28%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Domains</span>
                    <div className="flex items-center gap-2">
                      <Progress value={22} className="w-24" />
                      <span className="text-sm">22%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>URLs</span>
                    <div className="flex items-center gap-2">
                      <Progress value={15} className="w-24" />
                      <span className="text-sm">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feed Performance</CardTitle>
                <CardDescription>Intelligence feed reliability metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {intelligenceFeeds.map((feed) => (
                    <div key={feed.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{feed.name}</div>
                        <div className="text-sm text-muted-foreground">{feed.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={feed.reliability === 'High' ? 90 : feed.reliability === 'Medium' ? 70 : 50} 
                          className="w-20" 
                        />
                        <Badge variant="outline">{feed.reliability}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}