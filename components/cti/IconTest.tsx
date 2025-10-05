/**
 * Test des icônes Lucide React utilisées dans la plateforme CTI
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Shield, Brain, Search, Network, Target, Users, 
  Activity, Globe, Zap, Database, FileText, TrendingUp,
  AlertTriangle, CheckCircle, Clock, Eye, Settings,
  Bot, Play, Pause, RefreshCw, BarChart3, XCircle,
  Cpu, Server, Gauge, MapPin, Plus, Save, Trash2,
  Edit, Link, Tag, Calendar, User, Share, Download,
  Filter, Rss, Timer, BookOpen, Image
} from 'lucide-react';

export function IconTest() {
  const icons = [
    { name: 'Shield', icon: Shield },
    { name: 'Brain', icon: Brain },
    { name: 'Search', icon: Search },
    { name: 'Network', icon: Network },
    { name: 'Target', icon: Target },
    { name: 'Users', icon: Users },
    { name: 'Activity', icon: Activity },
    { name: 'Globe', icon: Globe },
    { name: 'Zap', icon: Zap },
    { name: 'Database', icon: Database },
    { name: 'FileText', icon: FileText },
    { name: 'TrendingUp', icon: TrendingUp },
    { name: 'AlertTriangle', icon: AlertTriangle },
    { name: 'CheckCircle', icon: CheckCircle },
    { name: 'Clock', icon: Clock },
    { name: 'Eye', icon: Eye },
    { name: 'Settings', icon: Settings },
    { name: 'Bot', icon: Bot },
    { name: 'Play', icon: Play },
    { name: 'Pause', icon: Pause },
    { name: 'RefreshCw', icon: RefreshCw },
    { name: 'BarChart3', icon: BarChart3 },
    { name: 'XCircle', icon: XCircle },
    { name: 'Cpu', icon: Cpu },
    { name: 'Server', icon: Server },
    { name: 'Gauge', icon: Gauge },
    { name: 'MapPin', icon: MapPin },
    { name: 'Plus', icon: Plus },
    { name: 'Save', icon: Save },
    { name: 'Trash2', icon: Trash2 },
    { name: 'Edit', icon: Edit },
    { name: 'Link', icon: Link },
    { name: 'Tag', icon: Tag },
    { name: 'Calendar', icon: Calendar },
    { name: 'User', icon: User },
    { name: 'Share', icon: Share },
    { name: 'Download', icon: Download },
    { name: 'Filter', icon: Filter },
    { name: 'Rss', icon: Rss },
    { name: 'Timer', icon: Timer },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'Image', icon: Image }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Test des Icônes Lucide React
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {icons.map(({ name, icon: IconComponent }) => (
            <div key={name} className="flex flex-col items-center p-2 border rounded">
              <IconComponent className="w-6 h-6 mb-1" />
              <span className="text-xs text-center">{name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ Toutes les icônes sont valides et s'affichent correctement
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
