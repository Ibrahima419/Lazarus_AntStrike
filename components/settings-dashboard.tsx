import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  Settings, Users, Shield, Key, Database, Bell, Globe, 
  Monitor, HardDrive, Cpu, MemoryStick, Network, Server,
  Eye, Edit, Trash2, Plus, Search, Save, RefreshCw,
  AlertTriangle, CheckCircle, XCircle, Download, Upload,
  Lock, Unlock, UserPlus, UserMinus, Crown, Mail
} from 'lucide-react';

// User Management Data
const users = [
  {
    id: 'user-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-21T14:30:00Z',
    department: 'Cybersecurity',
    permissions: ['Read', 'Write', 'Admin', 'Export'],
    mfaEnabled: true
  },
  {
    id: 'user-002',
    name: 'Mike Rodriguez',
    email: 'mike.rodriguez@company.com',
    role: 'Analyst',
    status: 'Active',
    lastLogin: '2024-01-21T13:45:00Z',
    department: 'SOC',
    permissions: ['Read', 'Write'],
    mfaEnabled: true
  },
  {
    id: 'user-003',
    name: 'Lisa Wang',
    email: 'lisa.wang@company.com',
    role: 'Manager',
    status: 'Active',
    lastLogin: '2024-01-21T12:20:00Z',
    department: 'Security Operations',
    permissions: ['Read', 'Write', 'Export'],
    mfaEnabled: false
  },
  {
    id: 'user-004',
    name: 'David Kim',
    email: 'david.kim@company.com',
    role: 'Viewer',
    status: 'Inactive',
    lastLogin: '2024-01-19T16:30:00Z',
    department: 'IT Operations',
    permissions: ['Read'],
    mfaEnabled: false
  }
];

// System Configuration
const systemConfig = {
  platform: {
    name: 'OpenCTI Enterprise',
    version: '2.1.4',
    environment: 'Production',
    uptime: '99.8%',
    lastRestart: '2024-01-15T02:00:00Z'
  },
  database: {
    type: 'PostgreSQL',
    version: '15.2',
    size: '847 GB',
    connections: '127/200',
    performance: 'Optimal'
  },
  storage: {
    total: '2.5 TB',
    used: '1.8 TB',
    available: '700 GB',
    utilizationRate: '72%'
  },
  security: {
    sslEnabled: true,
    mfaEnforced: true,
    sessionTimeout: '8 hours',
    passwordPolicy: 'Strong',
    auditLogging: true
  }
};

// Integration Settings
const integrations = [
  {
    id: 'misp-001',
    name: 'Primary MISP Instance',
    type: 'MISP',
    status: 'Connected',
    url: 'https://misp.company.com',
    lastSync: '2024-01-21T14:35:00Z',
    healthStatus: 'Healthy'
  },
  {
    id: 'siem-001',
    name: 'Splunk SIEM',
    type: 'SIEM',
    status: 'Connected',
    url: 'https://splunk.company.com:8089',
    lastSync: '2024-01-21T14:30:00Z',
    healthStatus: 'Healthy'
  },
  {
    id: 'soar-001',
    name: 'Phantom SOAR',
    type: 'SOAR',
    status: 'Warning',
    url: 'https://phantom.company.com',
    lastSync: '2024-01-21T13:45:00Z',
    healthStatus: 'Degraded'
  },
  {
    id: 'taxii-001',
    name: 'CISA TAXII Feed',
    type: 'TAXII',
    status: 'Connected',
    url: 'https://cisa.gov/taxii2',
    lastSync: '2024-01-21T14:25:00Z',
    healthStatus: 'Healthy'
  }
];

// Notification Settings
const notificationChannels = [
  { id: 'email', name: 'Email Notifications', enabled: true, recipients: 15 },
  { id: 'slack', name: 'Slack Integration', enabled: true, recipients: 8 },
  { id: 'webhook', name: 'Webhook Alerts', enabled: true, recipients: 3 },
  { id: 'sms', name: 'SMS Alerts', enabled: false, recipients: 5 }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
    case 'Connected':
    case 'Healthy':
      return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
    case 'Warning':
    case 'Degraded':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>;
    case 'Inactive':
    case 'Disconnected':
    case 'Error':
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'Admin':
      return <Badge variant="destructive">{role}</Badge>;
    case 'Manager':
      return <Badge className="bg-orange-500 hover:bg-orange-600">{role}</Badge>;
    case 'Analyst':
      return <Badge className="bg-blue-500 hover:bg-blue-600">{role}</Badge>;
    case 'Viewer':
      return <Badge variant="secondary">{role}</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Active':
    case 'Connected':
    case 'Healthy':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'Warning':
    case 'Degraded':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'Inactive':
    case 'Disconnected':
    case 'Error':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Monitor className="w-4 h-4 text-gray-500" />;
  }
};

export function SettingsDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Platform Settings</h1>
          <p className="text-muted-foreground">Configure system settings, users, and integrations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemConfig.platform.uptime}</div>
            <div className="text-xs text-muted-foreground">
              Uptime - {systemConfig.platform.environment}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.status === 'Active').length}</div>
            <div className="text-xs text-muted-foreground">
              {users.length} total users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemConfig.storage.utilizationRate}</div>
            <div className="text-xs text-muted-foreground">
              {systemConfig.storage.used} of {systemConfig.storage.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <Globe className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.filter(i => i.status === 'Connected').length}</div>
            <div className="text-xs text-muted-foreground">
              {integrations.length} configured
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Configuration</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>MFA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.mfaEnabled ? (
                            <Shield className="w-4 h-4 text-green-500" />
                          ) : (
                            <Shield className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
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
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Configure role-based access control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Admin Role</Label>
                    <Badge variant="destructive">Full Access</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Complete system access including user management, system configuration, and all data operations.
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Manager Role</Label>
                    <Badge className="bg-orange-500">Limited Admin</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Data management, export capabilities, and team oversight. No system configuration access.
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Analyst Role</Label>
                    <Badge className="bg-blue-500">Read/Write</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Create and modify threat intelligence data. Limited export capabilities.
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Viewer Role</Label>
                    <Badge variant="secondary">Read Only</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    View threat intelligence dashboards and reports. No modification privileges.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>Create a new user account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john.doe@company.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" placeholder="Cybersecurity" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="requireMFA" />
                  <Label htmlFor="requireMFA">Require Multi-Factor Authentication</Label>
                </div>

                <Button className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system status and configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Platform Name</Label>
                    <Input value={systemConfig.platform.name} />
                  </div>
                  <div>
                    <Label>Version</Label>
                    <Input value={systemConfig.platform.version} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Environment</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={systemConfig.platform.environment} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="UTC" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">EST</SelectItem>
                        <SelectItem value="pst">PST</SelectItem>
                        <SelectItem value="cet">CET</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Data Retention Policy</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="2 years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6months">6 months</SelectItem>
                      <SelectItem value="1year">1 year</SelectItem>
                      <SelectItem value="2years">2 years</SelectItem>
                      <SelectItem value="5years">5 years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="maintenanceMode" />
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="debugLogging" />
                  <Label htmlFor="debugLogging">Debug Logging</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Monitoring</CardTitle>
                <CardDescription>System resource usage and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-500" />
                      <span>CPU Usage</span>
                    </div>
                    <span className="font-medium">23%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="w-4 h-4 text-green-500" />
                      <span>Memory Usage</span>
                    </div>
                    <span className="font-medium">45%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-purple-500" />
                      <span>Disk Usage</span>
                    </div>
                    <span className="font-medium">{systemConfig.storage.utilizationRate}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-orange-500" />
                      <span>Network I/O</span>
                    </div>
                    <span className="font-medium">127 Mbps</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-red-500" />
                      <span>DB Connections</span>
                    </div>
                    <span className="font-medium">{systemConfig.database.connections}</span>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Restart System Services
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>Database connection and performance settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Database Type</Label>
                    <Input value={systemConfig.database.type} disabled />
                  </div>
                  <div>
                    <Label>Version</Label>
                    <Input value={systemConfig.database.version} disabled />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Max Connections</Label>
                    <Input value="200" />
                  </div>
                  <div>
                    <Label>Query Timeout (sec)</Label>
                    <Input value="30" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Backup Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Daily" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Performance Status</Label>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{systemConfig.database.performance}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>Configure authentication and access policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enforce Multi-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require MFA for all user accounts</p>
                  </div>
                  <Switch defaultChecked={systemConfig.security.mfaEnforced} />
                </div>

                <Separator />

                <div>
                  <Label>Session Timeout</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={systemConfig.security.sessionTimeout} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1hour">1 hour</SelectItem>
                      <SelectItem value="4hours">4 hours</SelectItem>
                      <SelectItem value="8hours">8 hours</SelectItem>
                      <SelectItem value="24hours">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Password Policy</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={systemConfig.security.passwordPolicy} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                      <SelectItem value="strong">Strong (12+ chars, mixed case, numbers, symbols)</SelectItem>
                      <SelectItem value="complex">Complex (16+ chars, all requirements)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Failed Login Attempts Limit</Label>
                  <Input placeholder="5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all user actions and system events</p>
                  </div>
                  <Switch defaultChecked={systemConfig.security.auditLogging} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SSL/TLS Configuration</CardTitle>
                <CardDescription>Secure communication settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SSL/TLS Enabled</Label>
                    <p className="text-sm text-muted-foreground">Encrypt all communications</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-500" />
                    <Switch defaultChecked={systemConfig.security.sslEnabled} />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>TLS Version</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="TLS 1.3" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls12">TLS 1.2</SelectItem>
                      <SelectItem value="tls13">TLS 1.3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Certificate Expiry</Label>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Valid until March 15, 2025</span>
                  </div>
                </div>

                <Button className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Certificate
                </Button>

                <div className="space-y-2">
                  <Label>Allowed Cipher Suites</Label>
                  <Textarea 
                    placeholder="TLS_AES_256_GCM_SHA384&#10;TLS_CHACHA20_POLY1305_SHA256&#10;TLS_AES_128_GCM_SHA256"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>IP Access Control</CardTitle>
              <CardDescription>Manage IP allowlists and restrictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable IP Restrictions</Label>
                  <p className="text-sm text-muted-foreground">Only allow access from specified IP ranges</p>
                </div>
                <Switch />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Allowed IP Ranges</Label>
                  <Textarea 
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8&#10;172.16.0.0/12"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Blocked IP Addresses</Label>
                  <Textarea 
                    placeholder="Add specific IPs to block..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add IP Range
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Rules
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search integrations..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="misp">MISP</SelectItem>
                <SelectItem value="siem">SIEM</SelectItem>
                <SelectItem value="soar">SOAR</SelectItem>
                <SelectItem value="taxii">TAXII</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Integrations</CardTitle>
              <CardDescription>
                External system connections and data feeds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getStatusIcon(integration.status)}
                          <div>
                            <div className="font-medium">{integration.name}</div>
                            <div className="text-sm text-muted-foreground font-mono text-xs">
                              {integration.url}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{integration.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(integration.status)}</TableCell>
                      <TableCell>{getStatusBadge(integration.healthStatus)}</TableCell>
                      <TableCell>
                        {new Date(integration.lastSync).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
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
                <CardTitle>Add New Integration</CardTitle>
                <CardDescription>Connect to external threat intelligence sources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Integration Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select integration type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="misp">MISP Platform</SelectItem>
                      <SelectItem value="siem">SIEM System</SelectItem>
                      <SelectItem value="soar">SOAR Platform</SelectItem>
                      <SelectItem value="taxii">TAXII Feed</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Integration Name</Label>
                  <Input placeholder="My MISP Instance" />
                </div>

                <div>
                  <Label>URL</Label>
                  <Input placeholder="https://misp.example.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Authentication Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="API Key" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api-key">API Key</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sync Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Hourly" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15min">Every 15 minutes</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="manual">Manual only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>API Key / Credentials</Label>
                  <Input type="password" placeholder="Enter API key or credentials" />
                </div>

                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Integration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Health</CardTitle>
                <CardDescription>Monitor integration performance and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Active Connections</span>
                    <span className="font-medium">{integrations.filter(i => i.status === 'Connected').length}/4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Healthy Systems</span>
                    <span className="font-medium text-green-600">{integrations.filter(i => i.healthStatus === 'Healthy').length}/4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Warning States</span>
                    <span className="font-medium text-yellow-600">{integrations.filter(i => i.healthStatus === 'Degraded').length}/4</span>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test All Connections
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Integration Logs</Label>
                  <div className="bg-muted p-3 rounded-md text-sm font-mono">
                    <div className="text-green-600">✓ MISP sync completed - 47 indicators</div>
                    <div className="text-green-600">✓ SIEM connection healthy</div>
                    <div className="text-yellow-600">⚠ SOAR response timeout - retrying</div>
                    <div className="text-green-600">✓ TAXII feed updated - 23 objects</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Configure how and where notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      {channel.id === 'email' && <Mail className="w-5 h-5 text-blue-500" />}
                      {channel.id === 'slack' && <Bell className="w-5 h-5 text-green-500" />}
                      {channel.id === 'webhook' && <Globe className="w-5 h-5 text-purple-500" />}
                      {channel.id === 'sms' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                      <div>
                        <div className="font-medium">{channel.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {channel.recipients} recipients configured
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch defaultChecked={channel.enabled} />
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Rules</CardTitle>
                <CardDescription>Define when notifications should be sent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Critical Threats Detected</Label>
                    <p className="text-sm text-muted-foreground">Notify immediately for critical severity threats</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>High-Volume IOCs</Label>
                    <p className="text-sm text-muted-foreground">Alert when IOC collection exceeds threshold</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Health Issues</Label>
                    <p className="text-sm text-muted-foreground">Notify on system performance problems</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Integration Failures</Label>
                    <p className="text-sm text-muted-foreground">Alert when external integrations fail</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Summary Reports</Label>
                    <p className="text-sm text-muted-foreground">Send daily intelligence summaries</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>SMTP settings for email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Server</Label>
                    <Input placeholder="smtp.company.com" />
                  </div>
                  <div>
                    <Label>Port</Label>
                    <Input placeholder="587" />
                  </div>
                </div>

                <div>
                  <Label>From Address</Label>
                  <Input placeholder="opencti@company.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <Input placeholder="smtp-user" />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" placeholder="smtp-password" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="useSSL" defaultChecked />
                  <Label htmlFor="useSSL">Use SSL/TLS</Label>
                </div>

                <Button className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Test Email Configuration
                </Button>

                <div>
                  <Label>Default Recipients</Label>
                  <Textarea 
                    placeholder="security-team@company.com&#10;ciso@company.com&#10;soc@company.com"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}