import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Upload, Download, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle,
  FileJson, FileText, Database, Globe, Settings, Play, Pause, Square,
  Eye, Edit, Trash2, Plus, Search, Filter, Share, ExternalLink
} from 'lucide-react';

// Import Sources Configuration
const importSources = [
  {
    id: 'misp-001',
    name: 'MISP Threat Intelligence',
    type: 'MISP',
    url: 'https://misp.example.org',
    status: 'Active',
    lastSync: '2024-01-21T14:30:00Z',
    itemsImported: 12847,
    errors: 3,
    format: 'JSON',
    authType: 'API Key',
    tlpLevel: 'TLP:AMBER'
  },
  {
    id: 'taxii-001',
    name: 'TAXII 2.1 Collection',
    type: 'TAXII',
    url: 'https://cti-taxii.mitre.org/stix/collections/',
    status: 'Active',
    lastSync: '2024-01-21T14:25:00Z',
    itemsImported: 8934,
    errors: 0,
    format: 'STIX 2.1',
    authType: 'Basic Auth',
    tlpLevel: 'TLP:WHITE'
  },
  {
    id: 'nvd-001',
    name: 'NVD CVE Feed',
    type: 'CVE/NVD',
    url: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
    status: 'Active',
    lastSync: '2024-01-21T14:20:00Z',
    itemsImported: 15672,
    errors: 1,
    format: 'JSON',
    authType: 'API Key',
    tlpLevel: 'TLP:WHITE'
  },
  {
    id: 'rss-001',
    name: 'Security RSS Feeds',
    type: 'RSS/Atom',
    url: 'https://feeds.feedburner.com/eset/blog',
    status: 'Active',
    lastSync: '2024-01-21T14:15:00Z',
    itemsImported: 456,
    errors: 0,
    format: 'XML',
    authType: 'None',
    tlpLevel: 'TLP:GREEN'
  },
  {
    id: 'github-001',
    name: 'GitHub Security Advisories',
    type: 'GitHub',
    url: 'https://api.github.com/advisories',
    status: 'Warning',
    lastSync: '2024-01-21T12:45:00Z',
    itemsImported: 2847,
    errors: 5,
    format: 'JSON',
    authType: 'OAuth2',
    tlpLevel: 'TLP:WHITE'
  }
];

// Export Jobs
const exportJobs = [
  {
    id: 'export-001',
    name: 'Weekly STIX Bundle',
    type: 'STIX 2.1',
    destination: 'Local Download',
    status: 'Completed',
    schedule: 'Weekly - Monday 06:00',
    lastRun: '2024-01-21T06:00:00Z',
    itemsExported: 1247,
    fileSize: '15.2 MB',
    format: 'JSON',
    tlpFilter: 'TLP:WHITE,TLP:GREEN'
  },
  {
    id: 'export-002',
    name: 'MISP Sync Feed',
    type: 'MISP',
    destination: 'https://partner-misp.org',
    status: 'Running',
    schedule: 'Daily - 02:00',
    lastRun: '2024-01-21T02:00:00Z',
    itemsExported: 567,
    fileSize: '8.7 MB',
    format: 'JSON',
    tlpFilter: 'TLP:AMBER'
  },
  {
    id: 'export-003',
    name: 'IOC Feed CSV',
    type: 'CSV',
    destination: 'SIEM Integration',
    status: 'Scheduled',
    schedule: 'Hourly',
    lastRun: '2024-01-21T13:00:00Z',
    itemsExported: 2847,
    fileSize: '892 KB',
    format: 'CSV',
    tlpFilter: 'TLP:WHITE'
  },
  {
    id: 'export-004',
    name: 'Executive Report PDF',
    type: 'Report',
    destination: 'Email Distribution',
    status: 'Failed',
    schedule: 'Weekly - Friday 17:00',
    lastRun: '2024-01-19T17:00:00Z',
    itemsExported: 0,
    fileSize: '0 MB',
    format: 'PDF',
    tlpFilter: 'TLP:GREEN'
  }
];

// Manual Import History
const importHistory = [
  {
    id: 'import-001',
    filename: 'apt29-indicators.json',
    type: 'STIX 2.1',
    uploadTime: '2024-01-21T10:30:00Z',
    status: 'Completed',
    itemsProcessed: 47,
    itemsImported: 45,
    itemsSkipped: 2,
    errors: 0,
    user: 'Sarah Chen'
  },
  {
    id: 'import-002',
    filename: 'malware-families.misp',
    type: 'MISP',
    uploadTime: '2024-01-20T14:20:00Z',
    status: 'Completed',
    itemsProcessed: 156,
    itemsImported: 152,
    itemsSkipped: 3,
    errors: 1,
    user: 'Mike Rodriguez'
  },
  {
    id: 'import-003',
    filename: 'iocs-batch.csv',
    type: 'CSV',
    uploadTime: '2024-01-19T09:15:00Z',
    status: 'Failed',
    itemsProcessed: 2847,
    itemsImported: 0,
    itemsSkipped: 0,
    errors: 1,
    user: 'Lisa Wang'
  }
];

// Support formats
const supportedFormats = {
  import: [
    { name: 'STIX 2.1', extension: '.json', description: 'Structured Threat Information eXpression v2.1' },
    { name: 'MISP', extension: '.json', description: 'Malware Information Sharing Platform format' },
    { name: 'OpenIOC', extension: '.xml', description: 'Open Indicators of Compromise' },
    { name: 'CSV', extension: '.csv', description: 'Comma-separated values with IOCs' },
    { name: 'YARA', extension: '.yar', description: 'YARA rules for malware detection' },
    { name: 'TAXII', extension: '.json', description: 'Trusted Automated eXchange of Indicator Information' }
  ],
  export: [
    { name: 'STIX 2.1', extension: '.json', description: 'Industry standard for threat intelligence' },
    { name: 'MISP', extension: '.json', description: 'Compatible with MISP platforms' },
    { name: 'CSV', extension: '.csv', description: 'Simple format for SIEM integration' },
    { name: 'PDF', extension: '.pdf', description: 'Human-readable reports' },
    { name: 'TAXII Bundle', extension: '.json', description: 'TAXII 2.1 compliant bundle' },
    { name: 'OpenIOC', extension: '.xml', description: 'Legacy IOC format' }
  ]
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Active':
    case 'Completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'Running':
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    case 'Warning':
    case 'Scheduled':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'Failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
    case 'Completed':
      return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
    case 'Running':
      return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
    case 'Warning':
    case 'Scheduled':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>;
    case 'Failed':
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getTLPBadge = (tlp: string) => {
  switch (tlp) {
    case 'TLP:RED':
      return <Badge variant="destructive">{tlp}</Badge>;
    case 'TLP:AMBER':
      return <Badge className="bg-orange-500 hover:bg-orange-600">{tlp}</Badge>;
    case 'TLP:GREEN':
      return <Badge className="bg-green-500 hover:bg-green-600">{tlp}</Badge>;
    case 'TLP:WHITE':
      return <Badge variant="outline">{tlp}</Badge>;
    default:
      return <Badge variant="secondary">{tlp}</Badge>;
  }
};

export function ImportExportDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Import / Export Management</h1>
          <p className="text-muted-foreground">Manage threat intelligence data flows and integrations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Integration
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
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
            <CardTitle className="text-sm font-medium">Items Imported Today</CardTitle>
            <Upload className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,341</div>
            <div className="text-xs text-muted-foreground">
              +15% vs yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Jobs</CardTitle>
            <Download className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <div className="text-xs text-muted-foreground">
              1 failed, 3 active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Volume (24h)</CardTitle>
            <Globe className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127 MB</div>
            <div className="text-xs text-muted-foreground">
              Processed successfully
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Import Sources</TabsTrigger>
          <TabsTrigger value="manual">Manual Import</TabsTrigger>
          <TabsTrigger value="exports">Export Jobs</TabsTrigger>
          <TabsTrigger value="formats">Supported Formats</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search import sources..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="misp">MISP</SelectItem>
                <SelectItem value="taxii">TAXII</SelectItem>
                <SelectItem value="rss">RSS/Atom</SelectItem>
                <SelectItem value="cve">CVE/NVD</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Automated Import Sources</CardTitle>
              <CardDescription>
                Configure and monitor automated threat intelligence feeds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>TLP Level</TableHead>
                    <TableHead>Items Imported</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getStatusIcon(source.status)}
                          <div>
                            <div className="font-medium">{source.name}</div>
                            <div className="text-sm text-muted-foreground font-mono text-xs">
                              {source.url}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{source.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(source.status)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{source.format}</Badge>
                      </TableCell>
                      <TableCell>{getTLPBadge(source.tlpLevel)}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{source.itemsImported.toLocaleString()}</div>
                          {source.errors > 0 && (
                            <div className="text-xs text-red-500">{source.errors} errors</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(source.lastSync).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
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

        <TabsContent value="manual" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>File Upload</CardTitle>
                <CardDescription>
                  Upload threat intelligence files for processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8">
                  <div className="text-center space-y-4">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="font-medium">Upload Files</h3>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop files here or click to browse
                      </p>
                    </div>
                    <Button>
                      <Upload className="w-4 h-4 mr-2" />
                      Select Files
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="format">File Format</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-detect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value="stix">STIX 2.1</SelectItem>
                        <SelectItem value="misp">MISP JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xml">OpenIOC XML</SelectItem>
                        <SelectItem value="yara">YARA Rules</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tlp">TLP Classification</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="TLP:WHITE" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white">TLP:WHITE</SelectItem>
                        <SelectItem value="green">TLP:GREEN</SelectItem>
                        <SelectItem value="amber">TLP:AMBER</SelectItem>
                        <SelectItem value="red">TLP:RED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description"
                    placeholder="Describe the content and source of this import..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="validate" />
                  <Label htmlFor="validate">Validate before import</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="deduplicate" />
                  <Label htmlFor="deduplicate">Skip duplicates</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>URL Import</CardTitle>
                <CardDescription>
                  Import directly from URLs (TAXII, MISP feeds, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="url">Source URL</Label>
                  <Input 
                    id="url"
                    placeholder="https://example.com/threat-feed.json"
                    type="url"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="auth-type">Authentication</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="api-key">API Key</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="format-url">Expected Format</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-detect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value="stix">STIX 2.1</SelectItem>
                        <SelectItem value="taxii">TAXII Bundle</SelectItem>
                        <SelectItem value="misp">MISP JSON</SelectItem>
                        <SelectItem value="rss">RSS/Atom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="credentials">Credentials</Label>
                  <Input 
                    id="credentials"
                    placeholder="API key, token, or username:password"
                    type="password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headers">Custom Headers (Optional)</Label>
                  <Textarea 
                    id="headers"
                    placeholder="User-Agent: TaranisAI/1.0&#10;X-API-Version: 2.1"
                    rows={3}
                  />
                </div>

                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Import from URL
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                Recent manual imports and their processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed/Imported</TableHead>
                    <TableHead>Upload Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileJson className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{item.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">
                            {item.itemsImported} / {item.itemsProcessed}
                          </div>
                          {item.itemsSkipped > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {item.itemsSkipped} skipped
                            </div>
                          )}
                          {item.errors > 0 && (
                            <div className="text-xs text-red-500">
                              {item.errors} errors
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(item.uploadTime).toLocaleString()}
                      </TableCell>
                      <TableCell>{item.user}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {item.status === 'Failed' && (
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search export jobs..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Export Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stix">STIX 2.1</SelectItem>
                <SelectItem value="misp">MISP</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="taxii">TAXII Bundle</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Export Job
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Export Jobs</CardTitle>
              <CardDescription>
                Scheduled and on-demand exports of threat intelligence data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Export Job</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Items/Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getStatusIcon(job.status)}
                          <div>
                            <div className="font-medium">{job.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Filter: {job.tlpFilter}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {job.destination.startsWith('http') ? (
                            <ExternalLink className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Download className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-sm">{job.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{job.schedule}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(job.lastRun).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{job.itemsExported.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{job.fileSize}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Export</CardTitle>
                <CardDescription>Generate exports on-demand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stix">STIX 2.1 Bundle</SelectItem>
                      <SelectItem value="misp">MISP JSON</SelectItem>
                      <SelectItem value="csv">IOC CSV</SelectItem>
                      <SelectItem value="pdf">Executive Report PDF</SelectItem>
                      <SelectItem value="yara">YARA Rules</SelectItem>
                      <SelectItem value="taxii">TAXII Collection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time-range">Time Range</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Last 7 days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tlp-filter">TLP Filter</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All TLP levels</SelectItem>
                      <SelectItem value="white">TLP:WHITE only</SelectItem>
                      <SelectItem value="white-green">TLP:WHITE + GREEN</SelectItem>
                      <SelectItem value="public">Public (WHITE/GREEN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Export
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Statistics</CardTitle>
                <CardDescription>Export volume and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>STIX 2.1 Exports</span>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="w-20" />
                      <span className="text-sm">1,247</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>MISP Exports</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-20" />
                      <span className="text-sm">567</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CSV Exports</span>
                    <div className="flex items-center gap-2">
                      <Progress value={90} className="w-20" />
                      <span className="text-sm">2,847</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>PDF Reports</span>
                    <div className="flex items-center gap-2">
                      <Progress value={25} className="w-20" />
                      <span className="text-sm">89</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Data Exported</span>
                    <span className="font-medium">247 GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average File Size</span>
                    <span className="font-medium">12.3 MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span className="font-medium text-green-600">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supported Import Formats</CardTitle>
                <CardDescription>
                  File formats that can be imported into the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportedFormats.import.map((format, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                      <FileJson className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{format.name}</h4>
                          <Badge variant="outline">{format.extension}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supported Export Formats</CardTitle>
                <CardDescription>
                  File formats that can be exported from the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportedFormats.export.map((format, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                      <Download className="w-5 h-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{format.name}</h4>
                          <Badge variant="outline">{format.extension}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Integration Protocols</CardTitle>
              <CardDescription>
                Supported protocols for automated threat intelligence exchange
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-6 h-6 text-blue-500" />
                    <h4 className="font-medium">TAXII 2.1</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trusted Automated eXchange of Indicator Information protocol for standardized threat intel sharing.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="w-6 h-6 text-purple-500" />
                    <h4 className="font-medium">MISP API</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Native integration with MISP platforms for bidirectional threat intelligence synchronization.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Share className="w-6 h-6 text-green-500" />
                    <h4 className="font-medium">Webhooks</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Real-time push notifications to external systems via HTTP webhooks with custom payloads.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-6 h-6 text-orange-500" />
                    <h4 className="font-medium">RSS/Atom</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consumption of RSS and Atom feeds from threat intelligence providers and security blogs.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <ExternalLink className="w-6 h-6 text-red-500" />
                    <h4 className="font-medium">REST APIs</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Direct integration with vendor APIs including NVD, VirusTotal, and GitHub Security Advisories.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="w-6 h-6 text-gray-500" />
                    <h4 className="font-medium">Custom Connectors</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Extensible framework for developing custom integrations with proprietary or specialized systems.
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