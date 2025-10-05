import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Search, Plus, AlertTriangle, Clock, CheckCircle, XCircle, Users, Calendar, Filter, Eye } from 'lucide-react';

const incidents = [
  {
    id: 'INC-2024-001',
    title: 'Suspected APT29 Phishing Campaign',
    severity: 'Critical',
    status: 'Active',
    category: 'Phishing',
    assignee: 'Sarah Chen',
    reporter: 'SOC Analyst',
    created: '2024-01-21T10:30:00Z',
    updated: '2024-01-21T14:20:00Z',
    sla: '4h remaining',
    affectedSystems: 15,
    indicators: 47,
    description: 'Multiple phishing emails targeting government employees with COVID-19 themed lures.'
  },
  {
    id: 'INC-2024-002',
    title: 'Ransomware Detection - BlackCat',
    severity: 'Critical',
    status: 'Investigating',
    category: 'Malware',
    assignee: 'Mike Rodriguez',
    reporter: 'EDR System',
    created: '2024-01-21T08:15:00Z',
    updated: '2024-01-21T13:45:00Z',
    sla: '2h overdue',
    affectedSystems: 3,
    indicators: 23,
    description: 'Ransomware activity detected on file servers in the finance department.'
  },
  {
    id: 'INC-2024-003',
    title: 'Data Exfiltration Attempt',
    severity: 'High',
    status: 'Contained',
    category: 'Data Breach',
    assignee: 'Lisa Wang',
    reporter: 'DLP System',
    created: '2024-01-20T16:20:00Z',
    updated: '2024-01-21T12:10:00Z',
    sla: 'On time',
    affectedSystems: 1,
    indicators: 12,
    description: 'Unusual data transfer patterns detected to external IP addresses.'
  },
  {
    id: 'INC-2024-004',
    title: 'Supply Chain Compromise',
    severity: 'High',
    status: 'Resolved',
    category: 'Supply Chain',
    assignee: 'David Kim',
    reporter: 'Threat Intel',
    created: '2024-01-19T12:00:00Z',
    updated: '2024-01-21T09:30:00Z',
    sla: 'Completed',
    affectedSystems: 8,
    indicators: 34,
    description: 'Compromised third-party software component identified in development environment.'
  },
  {
    id: 'INC-2024-005',
    title: 'Credential Stuffing Attack',
    severity: 'Medium',
    status: 'Monitoring',
    category: 'Authentication',
    assignee: 'Emma Johnson',
    reporter: 'WAF',
    created: '2024-01-20T14:45:00Z',
    updated: '2024-01-21T11:20:00Z',
    sla: '6h remaining',
    affectedSystems: 0,
    indicators: 156,
    description: 'Large-scale login attempts detected against user portal.'
  }
];

const incidentStats = {
  total: 47,
  open: 23,
  investigating: 8,
  resolved: 16,
  avgResolutionTime: '4.2h',
  slaCompliance: 89
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'Critical':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'High':
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    case 'Medium':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-blue-500" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Active':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'Investigating':
      return <Clock className="w-4 h-4 text-orange-500" />;
    case 'Contained':
      return <CheckCircle className="w-4 h-4 text-blue-500" />;
    case 'Resolved':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'Monitoring':
      return <Eye className="w-4 h-4 text-purple-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
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
    case 'Contained':
      return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
    case 'Resolved':
      return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
    case 'Monitoring':
      return <Badge className="bg-purple-500 hover:bg-purple-600">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getSLABadge = (sla: string) => {
  if (sla.includes('overdue')) {
    return <Badge variant="destructive">{sla}</Badge>;
  } else if (sla.includes('remaining')) {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">{sla}</Badge>;
  } else if (sla === 'On time') {
    return <Badge className="bg-green-500 hover:bg-green-600">{sla}</Badge>;
  } else {
    return <Badge variant="secondary">{sla}</Badge>;
  }
};

export function IncidentsDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Security Incidents</h1>
          <p className="text-muted-foreground">Incident response and case management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Incident
          </Button>
        </div>
      </div>

      {/* Incident Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.total}</div>
            <div className="text-xs text-muted-foreground">
              This month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.open}</div>
            <div className="text-xs text-muted-foreground">
              Requires attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investigating</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.investigating}</div>
            <div className="text-xs text-muted-foreground">
              In progress
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.resolved}</div>
            <div className="text-xs text-muted-foreground">
              This month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.avgResolutionTime}</div>
            <div className="text-xs text-muted-foreground">
              Time to resolve
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.slaCompliance}%</div>
            <div className="text-xs text-muted-foreground">
              On-time resolution
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">All Incidents</TabsTrigger>
          <TabsTrigger value="my-incidents">My Incidents</TabsTrigger>
          <TabsTrigger value="escalated">Escalated</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search incidents..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
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
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="contained">Contained</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phishing">Phishing</SelectItem>
                <SelectItem value="malware">Malware</SelectItem>
                <SelectItem value="data-breach">Data Breach</SelectItem>
                <SelectItem value="supply-chain">Supply Chain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Incidents</CardTitle>
              <CardDescription>
                Active security incidents and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Systems</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(incident.severity)}
                          <div>
                            <div className="font-medium">{incident.title}</div>
                            <div className="text-sm text-muted-foreground">{incident.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(incident.status)}
                          {getStatusBadge(incident.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{incident.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {incident.assignee.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{incident.assignee}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSLABadge(incident.sla)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{incident.affectedSystems}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(incident.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Incidents</CardTitle>
              <CardDescription>
                Incidents currently assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.filter(inc => inc.assignee === 'Sarah Chen').map((incident) => (
                  <div key={incident.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(incident.severity)}
                        <h4 className="font-medium">{incident.title}</h4>
                        {getSeverityBadge(incident.severity)}
                        {getStatusBadge(incident.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getSLABadge(incident.sla)}
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{incident.id}</span>
                      <span>•</span>
                      <span>{incident.affectedSystems} systems affected</span>
                      <span>•</span>
                      <span>Created {new Date(incident.created).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escalated Incidents</CardTitle>
              <CardDescription>
                High-priority incidents requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.filter(inc => inc.severity === 'Critical' && inc.status === 'Active').map((incident) => (
                  <div key={incident.id} className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <h4 className="font-medium text-red-900 dark:text-red-100">{incident.title}</h4>
                        <Badge variant="destructive">ESCALATED</Badge>
                      </div>
                      <Button variant="destructive" size="sm">Take Action</Button>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">{incident.description}</p>
                    <div className="flex items-center gap-4 text-sm text-red-600 dark:text-red-400">
                      <span>SLA: {incident.sla}</span>
                      <span>•</span>
                      <span>Assignee: {incident.assignee}</span>
                      <span>•</span>
                      <span>{incident.indicators} IOCs detected</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Categories</CardTitle>
                <CardDescription>Distribution by incident type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Phishing</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-sm">40%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Malware</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-sm">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Breach</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="text-sm">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Supply Chain</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Team Performance</CardTitle>
                <CardDescription>Average resolution times by analyst</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Sarah Chen', 'Mike Rodriguez', 'Lisa Wang', 'David Kim', 'Emma Johnson'].map((analyst, index) => (
                    <div key={analyst} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {analyst.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{analyst}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{(Math.random() * 8 + 2).toFixed(1)}h</span>
                        <Badge variant="outline">{Math.floor(Math.random() * 10 + 5)} cases</Badge>
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