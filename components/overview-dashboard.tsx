import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, Shield, TrendingUp, TrendingDown, Globe, Database, Activity, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const threatTrendData = [
  { date: '2024-01-15', threats: 45, incidents: 12 },
  { date: '2024-01-16', threats: 52, incidents: 8 },
  { date: '2024-01-17', threats: 38, incidents: 15 },
  { date: '2024-01-18', threats: 61, incidents: 18 },
  { date: '2024-01-19', threats: 74, incidents: 22 },
  { date: '2024-01-20', threats: 68, incidents: 19 },
  { date: '2024-01-21', threats: 82, incidents: 25 },
];

const attackVectorData = [
  { name: 'Phishing', value: 35, color: '#ef4444' },
  { name: 'Malware', value: 28, color: '#f97316' },
  { name: 'Ransomware', value: 18, color: '#eab308' },
  { name: 'Data Breach', value: 12, color: '#22c55e' },
  { name: 'DDoS', value: 7, color: '#3b82f6' },
];

const geoThreatData = [
  { country: 'Russia', threats: 145 },
  { country: 'China', threats: 128 },
  { country: 'North Korea', threats: 89 },
  { country: 'Iran', threats: 72 },
  { country: 'Unknown', threats: 156 },
];

const recentThreats = [
  {
    id: 1,
    name: 'APT29 Cozy Bear Campaign',
    severity: 'Critical',
    type: 'Advanced Persistent Threat',
    lastSeen: '2 hours ago',
    confidence: 'High'
  },
  {
    id: 2,
    name: 'Emotet Banking Trojan',
    severity: 'High',
    type: 'Malware',
    lastSeen: '4 hours ago',
    confidence: 'Medium'
  },
  {
    id: 3,
    name: 'Cobalt Strike Beacon',
    severity: 'High',
    type: 'Post-Exploitation Tool',
    lastSeen: '6 hours ago',
    confidence: 'High'
  },
  {
    id: 4,
    name: 'Phishing Campaign - Office365',
    severity: 'Medium',
    type: 'Phishing',
    lastSeen: '8 hours ago',
    confidence: 'Medium'
  },
];

export function OverviewDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Threat Intelligence Overview</h1>
          <p className="text-muted-foreground">Real-time cybersecurity threat landscape analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="w-3 h-3" />
            Live Data
          </Badge>
          <Button variant="outline" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            Last Updated: 2 min ago
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-destructive" />
              +12% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
              -5% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IOCs Processed</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2K</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-blue-500" />
              +8% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries Affected</CardTitle>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +3 new countries
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Threat Trends (7 Days)</CardTitle>
            <CardDescription>Daily threat detection and incident response metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={threatTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} name="Threats" />
                <Line type="monotone" dataKey="incidents" stroke="#f97316" strokeWidth={2} name="Incidents" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attack Vectors Distribution</CardTitle>
            <CardDescription>Primary attack methods observed this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attackVectorData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {attackVectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Geographic Threat Sources</CardTitle>
            <CardDescription>Top threat-originating countries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={geoThreatData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="country" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="threats" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent High-Priority Threats</CardTitle>
            <CardDescription>Latest detected threats requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentThreats.map((threat) => (
                <div key={threat.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{threat.name}</h4>
                      <Badge 
                        variant={threat.severity === 'Critical' ? 'destructive' : threat.severity === 'High' ? 'default' : 'secondary'}
                      >
                        {threat.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{threat.type}</span>
                      <span>•</span>
                      <span>Confidence: {threat.confidence}</span>
                      <span>•</span>
                      <span>{threat.lastSeen}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Investigate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}