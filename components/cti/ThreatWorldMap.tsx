/**
 * 🗺️ Threat World Map - Visualisation Mondiale Professionnelle
 * Carte interactive des menaces géopolitiques
 * Design ultra-moderne avec vraies données Taranis
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Globe, MapPin, AlertTriangle, TrendingUp, Zap, Shield,
  Activity, Target, Eye, Filter, Download, Share2
} from 'lucide-react';

interface ThreatLocation {
  name: string;
  country: string;
  lat: number;
  lng: number;
  threats: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  mentions: number;
  recentActivity: string;
}

interface ConnectionLine {
  from: ThreatLocation;
  to: ThreatLocation;
  strength: number;
}

export function ThreatWorldMap({ locations, onNotify }: { 
  locations: any[]; 
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}) {
  const [selectedLocation, setSelectedLocation] = useState<ThreatLocation | null>(null);
  const [viewMode, setViewMode] = useState<'threats' | 'heatmap' | 'connections'>('threats');
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Mapper les locations réelles vers des coordonnées géographiques
  const threatLocations: ThreatLocation[] = locations.map(loc => {
    const coords = getCountryCoordinates(loc.name);
    return {
      name: loc.name,
      country: loc.name,
      lat: coords.lat,
      lng: coords.lng,
      threats: Math.floor(loc.mentions / 2),
      severity: loc.mentions > 50 ? 'critical' : loc.mentions > 20 ? 'high' : loc.mentions > 10 ? 'medium' : 'low',
      mentions: loc.mentions,
      recentActivity: '2h ago'
    };
  }).filter(loc => loc.lat !== 0 && loc.lng !== 0);

  // Créer des connections entre top locations
  const connections: ConnectionLine[] = [];
  if (threatLocations.length >= 2) {
    for (let i = 0; i < Math.min(threatLocations.length - 1, 5); i++) {
      connections.push({
        from: threatLocations[i],
        to: threatLocations[i + 1],
        strength: (threatLocations[i].mentions + threatLocations[i + 1].mentions) / 2
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-100 flex items-center gap-3 mb-2">
            <Globe className="w-7 h-7 text-cyan-400 animate-pulse" />
            Threat World Map
          </h2>
          <p className="text-sm text-cyan-400/70">
            Visualisation géographique des menaces en temps réel • {threatLocations.length} zones actives
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'threats' ? 'default' : 'outline'}
            onClick={() => setViewMode('threats')}
            className={viewMode === 'threats' ? 'bg-cyan-500' : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20'}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Threats
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'heatmap' ? 'default' : 'outline'}
            onClick={() => setViewMode('heatmap')}
            className={viewMode === 'heatmap' ? 'bg-cyan-500' : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20'}
          >
            <Activity className="w-4 h-4 mr-2" />
            Heatmap
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'connections' ? 'default' : 'outline'}
            onClick={() => setViewMode('connections')}
            className={viewMode === 'connections' ? 'bg-cyan-500' : 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20'}
          >
            <Target className="w-4 h-4 mr-2" />
            Connections
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main Map */}
        <div className="col-span-2">
          <Card className="border-cyan-500/30 bg-slate-900/80 backdrop-blur overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-[700px] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
                {/* SVG World Map */}
                <svg
                  viewBox="0 0 1000 500"
                  className="w-full h-full"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.3))' }}
                >
                  <defs>
                    <linearGradient id="map-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(6, 182, 212, 0.1)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
                    </linearGradient>
                    <radialGradient id="threat-glow-critical">
                      <stop offset="0%" stopColor="rgba(239, 68, 68, 0.8)" />
                      <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                    </radialGradient>
                    <radialGradient id="threat-glow-high">
                      <stop offset="0%" stopColor="rgba(249, 115, 22, 0.6)" />
                      <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
                    </radialGradient>
                  </defs>

                  {/* Grid Background */}
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="0.5"/>
                  </pattern>
                  <rect width="1000" height="500" fill="url(#grid)" />

                  {/* Simplified World Map Paths */}
                  <g id="world-map" fill="url(#map-gradient)" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1">
                    {/* North America */}
                    <path d="M 150 100 L 200 90 L 250 95 L 280 110 L 270 150 L 240 180 L 210 170 L 180 140 Z" 
                          opacity={hoveredCountry === 'USA' || hoveredCountry === 'America' ? 0.5 : 0.2}
                          className="transition-opacity duration-300 hover:opacity-40 cursor-pointer"
                          onMouseEnter={() => setHoveredCountry('USA')}
                          onMouseLeave={() => setHoveredCountry(null)}
                    />
                    
                    {/* Europe */}
                    <path d="M 480 100 L 520 95 L 550 110 L 545 135 L 520 145 L 490 140 Z" 
                          opacity={hoveredCountry === 'Europe' || hoveredCountry === 'France' || hoveredCountry === 'Germany' ? 0.5 : 0.2}
                          className="transition-opacity duration-300 hover:opacity-40 cursor-pointer"
                          onMouseEnter={() => setHoveredCountry('Europe')}
                          onMouseLeave={() => setHoveredCountry(null)}
                    />
                    
                    {/* Russia */}
                    <path d="M 550 80 L 700 75 L 750 100 L 740 150 L 650 155 L 550 140 Z" 
                          opacity={hoveredCountry === 'Russia' ? 0.5 : 0.2}
                          className="transition-opacity duration-300 hover:opacity-40 cursor-pointer"
                          onMouseEnter={() => setHoveredCountry('Russia')}
                          onMouseLeave={() => setHoveredCountry(null)}
                    />
                    
                    {/* China/Asia */}
                    <path d="M 700 150 L 780 140 L 820 180 L 800 220 L 750 215 L 710 200 Z" 
                          opacity={hoveredCountry === 'China' || hoveredCountry === 'Asia' ? 0.5 : 0.2}
                          className="transition-opacity duration-300 hover:opacity-40 cursor-pointer"
                          onMouseEnter={() => setHoveredCountry('China')}
                          onMouseLeave={() => setHoveredCountry(null)}
                    />
                    
                    {/* Africa */}
                    <path d="M 480 220 L 550 210 L 580 260 L 560 320 L 510 340 L 470 300 Z" 
                          opacity={hoveredCountry === 'Africa' ? 0.5 : 0.2}
                          className="transition-opacity duration-300 hover:opacity-40 cursor-pointer"
                          onMouseEnter={() => setHoveredCountry('Africa')}
                          onMouseLeave={() => setHoveredCountry(null)}
                    />
                    
                    {/* South America */}
                    <path d="M 250 250 L 300 240 L 320 290 L 310 350 L 270 360 L 240 320 Z" 
                          opacity={hoveredCountry === 'South America' ? 0.5 : 0.2}
                          className="transition-opacity duration-300 hover:opacity-40 cursor-pointer"
                          onMouseEnter={() => setHoveredCountry('South America')}
                          onMouseLeave={() => setHoveredCountry(null)}
                    />
                    
                    {/* Australia */}
                    <path d="M 780 320 L 850 310 L 880 350 L 860 380 L 800 385 L 770 360 Z" 
                          opacity={hoveredCountry === 'Australia' ? 0.5 : 0.2}
                          className="transition-opacity duration-300 hover:opacity-40 cursor-pointer"
                          onMouseEnter={() => setHoveredCountry('Australia')}
                          onMouseLeave={() => setHoveredCountry(null)}
                    />
                  </g>

                  {/* Connection Lines (si mode connections) */}
                  {viewMode === 'connections' && connections.map((conn, idx) => {
                    const x1 = (conn.from.lng + 180) * (1000 / 360);
                    const y1 = (90 - conn.from.lat) * (500 / 180);
                    const x2 = (conn.to.lng + 180) * (1000 / 360);
                    const y2 = (90 - conn.to.lat) * (500 / 180);
                    
                    // Arc control point
                    const mx = (x1 + x2) / 2;
                    const my = (y1 + y2) / 2 - 50;

                    return (
                      <g key={idx}>
                        <path
                          d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                          fill="none"
                          stroke="rgba(6, 182, 212, 0.4)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-pulse"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="0"
                            to="10"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        </path>
                      </g>
                    );
                  })}

                  {/* Threat Markers */}
                  {threatLocations.map((location, idx) => {
                    const x = (location.lng + 180) * (1000 / 360);
                    const y = (90 - location.lat) * (500 / 180);
                    
                    const colors = {
                      critical: { fill: 'rgba(239, 68, 68, 0.8)', stroke: '#ef4444', glow: 'url(#threat-glow-critical)' },
                      high: { fill: 'rgba(249, 115, 22, 0.7)', stroke: '#f97316', glow: 'url(#threat-glow-high)' },
                      medium: { fill: 'rgba(234, 179, 8, 0.6)', stroke: '#eab308', glow: 'rgba(234, 179, 8, 0.3)' },
                      low: { fill: 'rgba(6, 182, 212, 0.5)', stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.2)' }
                    };

                    const color = colors[location.severity];
                    const radius = 8 + (location.mentions / 10);

                    return (
                      <g 
                        key={idx}
                        className="cursor-pointer transition-transform hover:scale-110"
                        onClick={() => setSelectedLocation(location)}
                        onMouseEnter={() => setHoveredCountry(location.country)}
                        onMouseLeave={() => setHoveredCountry(null)}
                      >
                        {/* Glow effect */}
                        {(viewMode === 'heatmap' || location.severity === 'critical') && (
                          <circle
                            cx={x}
                            cy={y}
                            r={radius * 3}
                            fill={color.glow}
                            opacity="0.6"
                            className="animate-pulse"
                          />
                        )}
                        
                        {/* Outer ring */}
                        <circle
                          cx={x}
                          cy={y}
                          r={radius + 4}
                          fill="none"
                          stroke={color.stroke}
                          strokeWidth="2"
                          opacity="0.5"
                        >
                          <animate
                            attributeName="r"
                            from={radius + 4}
                            to={radius + 12}
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            from="0.5"
                            to="0"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        
                        {/* Main marker */}
                        <circle
                          cx={x}
                          cy={y}
                          r={radius}
                          fill={color.fill}
                          stroke={color.stroke}
                          strokeWidth="2"
                          filter={`drop-shadow(0 0 ${radius}px ${color.stroke})`}
                        />
                        
                        {/* Inner dot */}
                        <circle
                          cx={x}
                          cy={y}
                          r={radius / 2}
                          fill="white"
                          opacity="0.9"
                          className="animate-pulse"
                        />

                        {/* Tooltip on hover */}
                        {selectedLocation?.name === location.name && (
                          <g transform={`translate(${x}, ${y - radius - 20})`}>
                            <rect
                              x="-60"
                              y="-30"
                              width="120"
                              height="28"
                              rx="4"
                              fill="rgba(15, 23, 42, 0.95)"
                              stroke="rgba(6, 182, 212, 0.5)"
                              strokeWidth="1"
                            />
                            <text
                              x="0"
                              y="-16"
                              textAnchor="middle"
                              fill="#06b6d4"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {location.name}
                            </text>
                            <text
                              x="0"
                              y="-6"
                              textAnchor="middle"
                              fill="#94a3b8"
                              fontSize="9"
                            >
                              {location.mentions} mentions
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 shadow-2xl">
                  <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-3">
                    Niveau de Menace
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                      <span className="text-xs text-cyan-100">Critical ({threatLocations.filter(l => l.severity === 'critical').length})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                      <span className="text-xs text-cyan-100">High ({threatLocations.filter(l => l.severity === 'high').length})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
                      <span className="text-xs text-cyan-100">Medium ({threatLocations.filter(l => l.severity === 'medium').length})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
                      <span className="text-xs text-cyan-100">Low ({threatLocations.filter(l => l.severity === 'low').length})</span>
                    </div>
                  </div>
                </div>

                {/* Stats Overlay */}
                <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 shadow-2xl min-w-[200px]">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-cyan-400/70 mb-1">Total Threats</div>
                      <div className="text-2xl font-bold text-cyan-100">
                        {threatLocations.reduce((sum, l) => sum + l.threats, 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-cyan-400/70 mb-1">Active Zones</div>
                      <div className="text-2xl font-bold text-cyan-100">{threatLocations.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-cyan-400/70 mb-1">Connections</div>
                      <div className="text-2xl font-bold text-cyan-100">{connections.length}</div>
                    </div>
                  </div>
                </div>

                {/* Current Mode Indicator */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-3 py-1">
                    <Activity className="w-3 h-3 mr-2 animate-pulse" />
                    Mode: {viewMode}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Location Details */}
        <div className="space-y-4">
          <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-cyan-100 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Top Threat Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {threatLocations
                  .sort((a, b) => b.mentions - a.mentions)
                  .slice(0, 10)
                  .map((location, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedLocation(location)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedLocation?.name === location.name
                          ? 'bg-cyan-500/20 border border-cyan-500/50'
                          : 'bg-slate-900/50 border border-cyan-500/20 hover:bg-slate-900/70 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            location.severity === 'critical' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                            location.severity === 'high' ? 'bg-orange-500 shadow-lg shadow-orange-500/50' :
                            location.severity === 'medium' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
                            'bg-cyan-500 shadow-lg shadow-cyan-500/50'
                          } animate-pulse`} />
                          <span className="text-sm font-medium text-cyan-100">{location.name}</span>
                        </div>
                        <Badge className="bg-cyan-500/20 text-cyan-300 text-xs border-cyan-500/30">
                          {location.mentions}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-400/70">{location.threats} threats</span>
                        <span className="text-cyan-400/70">{location.recentActivity}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {selectedLocation && (
            <Card className="border-cyan-500/50 bg-gradient-to-br from-cyan-950/50 to-blue-950/50 backdrop-blur shadow-lg shadow-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-100 text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-cyan-400/70 mb-1">Location</div>
                  <div className="text-lg font-bold text-cyan-100">{selectedLocation.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-cyan-400/70 mb-1">Threats</div>
                    <div className="text-xl font-bold text-red-400">{selectedLocation.threats}</div>
                  </div>
                  <div>
                    <div className="text-xs text-cyan-400/70 mb-1">Mentions</div>
                    <div className="text-xl font-bold text-cyan-400">{selectedLocation.mentions}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-cyan-400/70 mb-1">Severity</div>
                  <Badge className={
                    selectedLocation.severity === 'critical' ? 'bg-red-500 text-white' :
                    selectedLocation.severity === 'high' ? 'bg-orange-500 text-white' :
                    selectedLocation.severity === 'medium' ? 'bg-yellow-500 text-gray-900' :
                    'bg-cyan-500 text-white'
                  }>
                    {selectedLocation.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-cyan-400/70 mb-1">Recent Activity</div>
                  <div className="text-sm text-cyan-100">{selectedLocation.recentActivity}</div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  onClick={() => onNotify(`Investigation lancée pour ${selectedLocation.name}`, 'info')}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Investigate
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-cyan-500/30 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-cyan-100 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/50">
                <span className="text-xs text-cyan-300">Critical Zones</span>
                <span className="text-sm font-bold text-red-400">
                  {threatLocations.filter(l => l.severity === 'critical').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/50">
                <span className="text-xs text-cyan-300">High Risk Zones</span>
                <span className="text-sm font-bold text-orange-400">
                  {threatLocations.filter(l => l.severity === 'high').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/50">
                <span className="text-xs text-cyan-300">Total Mentions</span>
                <span className="text-sm font-bold text-cyan-400">
                  {threatLocations.reduce((sum, l) => sum + l.mentions, 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function to map country names to coordinates
function getCountryCoordinates(countryName: string): { lat: number; lng: number } {
  const coordinates: { [key: string]: { lat: number; lng: number } } = {
    // Major threat locations
    'Russia': { lat: 60, lng: 100 },
    'Russie': { lat: 60, lng: 100 },
    'China': { lat: 35, lng: 105 },
    'Chine': { lat: 35, lng: 105 },
    'USA': { lat: 38, lng: -97 },
    'United States': { lat: 38, lng: -97 },
    'America': { lat: 38, lng: -97 },
    'Iran': { lat: 32, lng: 53 },
    'North Korea': { lat: 40, lng: 127 },
    'Ukraine': { lat: 49, lng: 32 },
    'France': { lat: 47, lng: 2 },
    'Germany': { lat: 51, lng: 10 },
    'Allemagne': { lat: 51, lng: 10 },
    'Austria': { lat: 47.5, lng: 14.5 },
    'Autriche': { lat: 47.5, lng: 14.5 },
    'Europe': { lat: 50, lng: 10 },
    'UK': { lat: 54, lng: -2 },
    'Britain': { lat: 54, lng: -2 },
    'India': { lat: 20, lng: 77 },
    'Japan': { lat: 36, lng: 138 },
    'Japon': { lat: 36, lng: 138 },
    'South Korea': { lat: 37, lng: 128 },
    'Brazil': { lat: -10, lng: -55 },
    'Brésil': { lat: -10, lng: -55 },
    'Australia': { lat: -25, lng: 135 },
    'Australie': { lat: -25, lng: 135 },
    'Canada': { lat: 56, lng: -106 },
    'Mexico': { lat: 23, lng: -102 },
    'Mexique': { lat: 23, lng: -102 },
    'Spain': { lat: 40, lng: -4 },
    'Espagne': { lat: 40, lng: -4 },
    'Italy': { lat: 42, lng: 12 },
    'Italie': { lat: 42, lng: 12 },
    'Poland': { lat: 52, lng: 20 },
    'Pologne': { lat: 52, lng: 20 },
    'Turkey': { lat: 39, lng: 35 },
    'Turquie': { lat: 39, lng: 35 },
    'Israel': { lat: 31, lng: 35 },
    'Israël': { lat: 31, lng: 35 },
    'Saudi Arabia': { lat: 24, lng: 45 },
    'UAE': { lat: 24, lng: 54 },
    'Egypt': { lat: 26, lng: 30 },
    'Égypte': { lat: 26, lng: 30 },
    'South Africa': { lat: -29, lng: 24 },
    'Nigeria': { lat: 9, lng: 8 },
    'Kenya': { lat: 1, lng: 38 },
    'Asia': { lat: 30, lng: 100 },
    'Africa': { lat: 0, lng: 20 },
    'Afrique': { lat: 0, lng: 20 },
    'South America': { lat: -15, lng: -60 },
    'Amérique du Sud': { lat: -15, lng: -60 },
  };

  // Recherche exacte
  if (coordinates[countryName]) {
    return coordinates[countryName];
  }

  // Recherche partielle (case-insensitive)
  const lowerName = countryName.toLowerCase();
  for (const [key, value] of Object.entries(coordinates)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Par défaut, retourner 0,0 (sera filtré)
  return { lat: 0, lng: 0 };
}

