import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Search, Filter, Download, Eye, AlertTriangle, Shield, Bug, Zap } from 'lucide-react';

const threatData = [
  {
    id: 'TI-2024-001',
    name: 'APT29 Cozy Bear Phishing Campaign',
    type: 'Advanced Persistent Threat',
    severity: 'Critical',
    confidence: 'High',
    firstSeen: '2024-01-20T10:30:00Z',
    lastSeen: '2024-01-21T14:20:00Z',
    iocs: 47,
    status: 'Active',
    actor: 'APT29',
    malwareFamilies: ['Cobalt Strike', 'PowerShell Empire'],
    targetSectors: ['Government', 'Defense', 'Healthcare']
  },
  {
    id: 'TI-2024-002',
    name: 'Emotet Banking Trojan Resurgence',
    type: 'Malware',
    severity: 'High',
    confidence: 'High',
    firstSeen: '2024-01-19T08:15:00Z',
    lastSeen: '2024-01-21T11:45:00Z',
    iocs: 152,
    status: 'Active',
    actor: 'Unknown',
    malwareFamilies: ['Emotet', 'Qbot'],
    targetSectors: ['Financial', 'Healthcare', 'Manufacturing']
  },
  {
    id: 'TI-2024-003',
    name: 'Ransomware-as-a-Service Operation',
    type: 'Ransomware',
    severity: 'High',
    confidence: 'Medium',
    firstSeen: '2024-01-18T16:20:00Z',
    lastSeen: '2024-01-21T09:10:00Z',
    iocs: 89,
    status: 'Investigating',
    actor: 'BlackCat',
    malwareFamilies: ['ALPHV', 'BlackCat'],
    targetSectors: ['Energy', 'Critical Infrastructure']
  },
  {
    id: 'TI-2024-004',
    name: 'Supply Chain Compromise Campaign',
    type: 'Supply Chain Attack',
    severity: 'High',
    confidence: 'Medium',
    firstSeen: '2024-01-17T12:00:00Z',
    lastSeen: '2024-01-20T18:30:00Z',
    iocs: 34,
    status: 'Mitigated',
    actor: 'Lazarus Group',
    malwareFamilies: ['MATA', 'BLINDINGCAN'],
    targetSectors: ['Technology', 'Cryptocurrency']
  },
  {
    id: 'TI-2024-005',
    name: 'Credential Harvesting Campaign',
    type: 'Phishing',
    severity: 'Medium',
    confidence: 'High',
    firstSeen: '2024-01-16T14:45:00Z',
    lastSeen: '2024-01-21T07:20:00Z',
    iocs: 203,
    status: 'Active',
    actor: 'Unknown',
    malwareFamilies: ['Phishing Kit v3.2'],
    targetSectors: ['All Sectors']
  }
];

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'Critical':
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case 'High':
      return <Zap className="w-4 h-4 text-orange-500" />;
    case 'Medium':
      return <Shield className="w-4 h-4 text-yellow-500" />;
    default:
      return <Bug className="w-4 h-4 text-blue-500" />;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'Critical':
      return <Badge variant="destructive">{severity}</Badge>;
    case 'High':
      return <Badge className="bg-orange-500 hover:bg-orange-600">{severity}</Badge>;
    case 'Medium':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{severity}</Badge>;
    default:
      return <Badge variant="secondary">{severity}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return <Badge variant="destructive">{status}</Badge>;
    case 'Investigating':
      return <Badge className="bg-orange-500 hover:bg-orange-600">{status}</Badge>;
    case 'Mitigated':
      return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function ThreatsDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Threat Intelligence</h1>
          <p className="text-muted-foreground">Monitor and analyze current cyber threats</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            Add Threat
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search threats..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apt">Advanced Persistent Threat</SelectItem>
                <SelectItem value="malware">Malware</SelectItem>
                <SelectItem value="phishing">Phishing</SelectItem>
                <SelectItem value="ransomware">Ransomware</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="mitigated">Mitigated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Threats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Threats</CardTitle>
          <CardDescription>
            {threatData.length} threats detected • Last updated 2 minutes ago
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Threat</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>IOCs</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {threatData.map((threat) => (
                <TableRow key={threat.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(threat.severity)}
                      <div>
                        <div className="font-medium">{threat.name}</div>
                        <div className="text-sm text-muted-foreground">{threat.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{threat.type}</TableCell>
                  <TableCell>{getSeverityBadge(threat.severity)}</TableCell>
                  <TableCell>{getStatusBadge(threat.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{threat.actor}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{threat.iocs}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(threat.lastSeen).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Threat Details Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Threat Actors</CardTitle>
            <CardDescription>Most active threat actors this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['APT29', 'Lazarus Group', 'BlackCat', 'Unknown', 'APT28'].map((actor, index) => (
                <div key={actor} className="flex items-center justify-between">
                  <span className="font-medium">{actor}</span>
                  <Badge variant="outline">{Math.floor(Math.random() * 50) + 10}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Malware Families</CardTitle>
            <CardDescription>Top malware families detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Cobalt Strike', 'Emotet', 'ALPHV', 'Qbot', 'PowerShell Empire'].map((malware, index) => (
                <div key={malware} className="flex items-center justify-between">
                  <span className="font-medium">{malware}</span>
                  <Badge variant="outline">{Math.floor(Math.random() * 30) + 5}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Sectors</CardTitle>
            <CardDescription>Most targeted industry sectors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Government', 'Healthcare', 'Financial', 'Technology', 'Energy'].map((sector, index) => (
                <div key={sector} className="flex items-center justify-between">
                  <span className="font-medium">{sector}</span>
                  <Badge variant="outline">{Math.floor(Math.random() * 40) + 15}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}