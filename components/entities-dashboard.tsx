import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Search, Plus, Users, Bug, Shield, Globe, Server, Eye, Edit, Trash2, Link, Star } from 'lucide-react';

const threatActors = [
  {
    id: 'ta-001',
    name: 'APT29 (Cozy Bear)',
    aliases: ['The Dukes', 'CozyDuke', 'Dark Halo'],
    origin: 'Russia',
    firstSeen: '2008',
    lastActive: '2024-01-20',
    sophistication: 'High',
    primaryObjectives: ['Espionage', 'Intelligence Collection'],
    sectors: ['Government', 'Defense', 'Healthcare'],
    techniques: ['T1566.001', 'T1059.001', 'T1055'],
    campaigns: 12,
    confidence: 'High'
  },
  {
    id: 'ta-002',
    name: 'Lazarus Group',
    aliases: ['HIDDEN COBRA', 'Guardians of Peace'],
    origin: 'North Korea',
    firstSeen: '2009',
    lastActive: '2024-01-19',
    sophistication: 'High',
    primaryObjectives: ['Financial Gain', 'Espionage'],
    sectors: ['Financial', 'Cryptocurrency', 'Entertainment'],
    techniques: ['T1566.002', 'T1071.001', 'T1027'],
    campaigns: 8,
    confidence: 'High'
  },
  {
    id: 'ta-003',
    name: 'BlackCat (ALPHV)',
    aliases: ['ALPHV', 'Noberus'],
    origin: 'Unknown',
    firstSeen: '2021',
    lastActive: '2024-01-18',
    sophistication: 'Medium',
    primaryObjectives: ['Financial Gain'],
    sectors: ['Healthcare', 'Manufacturing', 'Energy'],
    techniques: ['T1486', 'T1490', 'T1083'],
    campaigns: 15,
    confidence: 'Medium'
  }
];

const malwareFamilies = [
  {
    id: 'mw-001',
    name: 'Emotet',
    type: 'Banking Trojan',
    platform: 'Windows',
    firstSeen: '2014',
    lastActive: '2024-01-21',
    threatLevel: 'High',
    distribution: 'Email',
    capabilities: ['Credential Theft', 'Email Harvesting', 'Modular Architecture'],
    actors: ['TA542'],
    samples: 2847,
    confidence: 'High'
  },
  {
    id: 'mw-002',
    name: 'Cobalt Strike',
    type: 'Post-Exploitation Tool',
    platform: 'Windows',
    firstSeen: '2012',
    lastActive: '2024-01-20',
    threatLevel: 'Critical',
    distribution: 'Multiple',
    capabilities: ['Command & Control', 'Lateral Movement', 'Persistence'],
    actors: ['APT29', 'APT40', 'Lazarus Group'],
    samples: 5632,
    confidence: 'High'
  },
  {
    id: 'mw-003',
    name: 'ALPHV Ransomware',
    type: 'Ransomware',
    platform: 'Cross-platform',
    firstSeen: '2021',
    lastActive: '2024-01-18',
    threatLevel: 'Critical',
    distribution: 'RaaS',
    capabilities: ['File Encryption', 'Data Exfiltration', 'Network Discovery'],
    actors: ['BlackCat'],
    samples: 1234,
    confidence: 'Medium'
  }
];

const infrastructure = [
  {
    id: 'inf-001',
    type: 'Command & Control',
    address: '185.159.157.13',
    domain: 'malicious-c2.com',
    firstSeen: '2024-01-15',
    lastActive: '2024-01-21',
    status: 'Active',
    geolocation: 'Russia',
    registrar: 'NameCheap',
    actors: ['APT29'],
    campaigns: ['Winter Campaign 2024'],
    confidence: 'High'
  },
  {
    id: 'inf-002',
    type: 'Phishing Infrastructure',
    address: '192.168.100.50',
    domain: 'fake-office365.net',
    firstSeen: '2024-01-18',
    lastActive: '2024-01-20',
    status: 'Sinkholed',
    geolocation: 'Unknown',
    registrar: 'GoDaddy',
    actors: ['Unknown'],
    campaigns: ['Office365 Phishing'],
    confidence: 'Medium'
  },
  {
    id: 'inf-003',
    type: 'Malware Hosting',
    address: '203.0.113.42',
    domain: 'download-server.biz',
    firstSeen: '2024-01-10',
    lastActive: '2024-01-19',
    status: 'Taken Down',
    geolocation: 'China',
    registrar: 'Alibaba Cloud',
    actors: ['Lazarus Group'],
    campaigns: ['Supply Chain Attack'],
    confidence: 'High'
  }
];

const getSophisticationBadge = (level: string) => {
  switch (level) {
    case 'High':
      return <Badge variant="destructive">{level}</Badge>;
    case 'Medium':
      return <Badge className="bg-orange-500 hover:bg-orange-600">{level}</Badge>;
    case 'Low':
      return <Badge className="bg-green-500 hover:bg-green-600">{level}</Badge>;
    default:
      return <Badge variant="secondary">{level}</Badge>;
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return <Badge variant="destructive">{status}</Badge>;
    case 'Sinkholed':
      return <Badge className="bg-orange-500 hover:bg-orange-600">{status}</Badge>;
    case 'Taken Down':
      return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function EntitiesDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Threat Entities</h1>
          <p className="text-muted-foreground">Manage threat actors, malware, and infrastructure entities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Link className="w-4 h-4 mr-2" />
            Relationships
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Entity
          </Button>
        </div>
      </div>

      {/* Entity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Actors</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <div className="text-xs text-muted-foreground">
              +3 this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Malware Families</CardTitle>
            <Bug className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <div className="text-xs text-muted-foreground">
              +7 this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Infrastructure</CardTitle>
            <Server className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <div className="text-xs text-muted-foreground">
              +15 this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <div className="text-xs text-muted-foreground">
              +2 this week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different entity types */}
      <Tabs defaultValue="actors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="actors">Threat Actors</TabsTrigger>
          <TabsTrigger value="malware">Malware</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="actors" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search threat actors..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Origin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="russia">Russia</SelectItem>
                <SelectItem value="china">China</SelectItem>
                <SelectItem value="north-korea">North Korea</SelectItem>
                <SelectItem value="iran">Iran</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sophistication" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Threat Actors</CardTitle>
              <CardDescription>
                Known threat actor groups and their attributes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actor</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Sophistication</TableHead>
                    <TableHead>Primary Objectives</TableHead>
                    <TableHead>Target Sectors</TableHead>
                    <TableHead>Campaigns</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {threatActors.map((actor) => (
                    <TableRow key={actor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {actor.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{actor.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {actor.aliases.slice(0, 2).join(', ')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>{actor.origin}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSophisticationBadge(actor.sophistication)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {actor.primaryObjectives.map((obj, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {obj}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {actor.sectors.slice(0, 2).map((sector, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                          {actor.sectors.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{actor.sectors.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{actor.campaigns}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(actor.lastActive).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
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

        <TabsContent value="malware" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search malware families..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trojan">Banking Trojan</SelectItem>
                <SelectItem value="ransomware">Ransomware</SelectItem>
                <SelectItem value="backdoor">Backdoor</SelectItem>
                <SelectItem value="tool">Post-Exploitation Tool</SelectItem>
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
              <CardTitle>Malware Families</CardTitle>
              <CardDescription>
                Cataloged malware families and their characteristics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Malware</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Threat Level</TableHead>
                    <TableHead>Capabilities</TableHead>
                    <TableHead>Associated Actors</TableHead>
                    <TableHead>Samples</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {malwareFamilies.map((malware) => (
                    <TableRow key={malware.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Bug className="w-5 h-5 text-red-500" />
                          <div>
                            <div className="font-medium">{malware.name}</div>
                            <div className="text-sm text-muted-foreground">
                              First seen: {malware.firstSeen}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{malware.type}</Badge>
                      </TableCell>
                      <TableCell>{malware.platform}</TableCell>
                      <TableCell>{getThreatLevelBadge(malware.threatLevel)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {malware.capabilities.slice(0, 2).map((cap, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                          {malware.capabilities.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{malware.capabilities.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {malware.actors.map((actor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {actor}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{malware.samples.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(malware.lastActive).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
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

        <TabsContent value="infrastructure" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search infrastructure..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c2">Command & Control</SelectItem>
                <SelectItem value="phishing">Phishing Infrastructure</SelectItem>
                <SelectItem value="hosting">Malware Hosting</SelectItem>
                <SelectItem value="proxy">Proxy/VPN</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sinkholed">Sinkholed</SelectItem>
                <SelectItem value="taken-down">Taken Down</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Threat Infrastructure</CardTitle>
              <CardDescription>
                Malicious infrastructure used by threat actors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Infrastructure</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Geolocation</TableHead>
                    <TableHead>Associated Actors</TableHead>
                    <TableHead>Campaigns</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {infrastructure.map((infra) => (
                    <TableRow key={infra.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Server className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="font-medium font-mono">{infra.domain}</div>
                            <div className="text-sm text-muted-foreground font-mono">{infra.address}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{infra.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(infra.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>{infra.geolocation}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {infra.actors.map((actor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {actor}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {infra.campaigns.map((campaign, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {campaign}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(infra.lastActive).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
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

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                Coordinated threat actor campaigns and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-red-500" />
                      <h4 className="font-medium">Winter Campaign 2024</h4>
                      <Badge variant="destructive">Active</Badge>
                      <Badge variant="outline">APT29</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">High Priority</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Large-scale phishing campaign targeting government and healthcare organizations with COVID-19 themed lures.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Started: Dec 2023</span>
                    <span>•</span>
                    <span>15 organizations affected</span>
                    <span>•</span>
                    <span>47 IOCs identified</span>
                    <span>•</span>
                    <span>12 infrastructure items</span>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-orange-500" />
                      <h4 className="font-medium">BlackCat Ransomware Spree</h4>
                      <Badge className="bg-orange-500 hover:bg-orange-600">Investigating</Badge>
                      <Badge variant="outline">BlackCat</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Medium Priority</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ransomware-as-a-Service operation targeting healthcare and manufacturing sectors.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Started: Jan 2024</span>
                    <span>•</span>
                    <span>8 organizations affected</span>
                    <span>•</span>
                    <span>23 IOCs identified</span>
                    <span>•</span>
                    <span>5 infrastructure items</span>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-500" />
                      <h4 className="font-medium">Lazarus Cryptocurrency Theft</h4>
                      <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>
                      <Badge variant="outline">Lazarus Group</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Completed</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Supply chain attack targeting cryptocurrency exchanges and DeFi platforms.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Duration: Nov 2023 - Jan 2024</span>
                    <span>•</span>
                    <span>3 organizations affected</span>
                    <span>•</span>
                    <span>34 IOCs identified</span>
                    <span>•</span>
                    <span>7 infrastructure items</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}