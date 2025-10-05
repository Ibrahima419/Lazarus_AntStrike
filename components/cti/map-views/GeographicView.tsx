/**
 * 🌍 Geographic View - Leaflet + Mapbox
 * Carte géographique mondiale des sources OSINT avec clustering spatial
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { MapPin, Layers } from 'lucide-react';

interface SourceNode {
  id: string;
  name: string;
  type: string;
  alertCount: number;
  trustScore: number;
  status: 'active' | 'inactive' | 'error';
  coordinates?: [number, number];
  color?: string;
}

interface SourceCluster {
  id: string;
  name: string;
  type: string;
  sources: SourceNode[];
}

interface GeographicViewProps {
  sources: SourceNode[];
  clusters: SourceCluster[];
  onSourceSelect: (source: SourceNode | null) => void;
  selectedSource: SourceNode | null;
}

export function GeographicView({ 
  sources, 
  clusters, 
  onSourceSelect, 
  selectedSource 
}: GeographicViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');
  const [hoveredSource, setHoveredSource] = useState<SourceNode | null>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    // Lazy load Leaflet
    import('leaflet').then(L => {
      import('leaflet/dist/leaflet.css');

      // Clear existing
      if (mapInstance) {
        mapInstance.remove();
      }

      // Create map
      const map = L.map(mapRef.current!, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false
      });

      // Add Mapbox tile layer
      const tileUrl = mapStyle === 'dark' 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
      }).addTo(map);

      // Custom zoom control
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add markers pour chaque source
      const markers: any[] = [];
      const markerClusterGroup = new Map<string, any[]>();

      sources.forEach(source => {
        if (!source.coordinates) return;

        // Create custom icon based on source
        const icon = createCustomIcon(source, L);

        const marker = L.marker(source.coordinates, { icon })
          .addTo(map);

        // Pulsing effect for active sources
        if (source.status === 'active') {
          marker.bindTooltip(source.name, {
            permanent: false,
            direction: 'top',
            className: 'custom-tooltip'
          });
        }

        // Click handler
        marker.on('click', () => {
          onSourceSelect(source);
          
          // Fly to marker
          map.flyTo(source.coordinates!, 6, {
            duration: 1
          });
        });

        // Hover handlers
        marker.on('mouseover', () => {
          setHoveredSource(source);
        });

        marker.on('mouseout', () => {
          setHoveredSource(null);
        });

        markers.push(marker);
      });

      // Add cluster circles (heatmap-like)
      clusters.forEach(cluster => {
        const clusterSources = sources.filter(s => 
          cluster.sources.some(cs => cs.id === s.id) && s.coordinates
        );

        if (clusterSources.length === 0) return;

        // Calculate cluster center
        const centerLat = clusterSources.reduce((sum, s) => sum + s.coordinates![0], 0) / clusterSources.length;
        const centerLng = clusterSources.reduce((sum, s) => sum + s.coordinates![1], 0) / clusterSources.length;

        // Add circle
        const circle = L.circle([centerLat, centerLng], {
          color: getClusterColor(cluster.type),
          fillColor: getClusterColor(cluster.type),
          fillOpacity: 0.1,
          opacity: 0.3,
          radius: Math.max(100000, cluster.sources.length * 50000),
          weight: 2
        }).addTo(map);

        circle.bindPopup(`
          <div style="font-family: sans-serif; padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${cluster.name}</div>
            <div style="font-size: 12px; color: #64748b;">
              ${cluster.sources.length} sources<br/>
              ${cluster.alertCount} total alerts<br/>
              Confidence: ${cluster.confidence}%
            </div>
          </div>
        `);
      });

      // Add heatmap layer pour alert intensity
      if (sources.length > 0) {
        addHeatmapLayer(map, sources, L);
      }

      setMapInstance(map);

      // Cleanup
      return () => {
        map.remove();
      };
    });
  }, [sources, clusters, mapStyle]);

  const createCustomIcon = (source: SourceNode, L: any) => {
    const size = 20 + Math.sqrt(source.alertCount) * 3;
    const color = source.color || '#3b82f6';
    const pulseClass = source.status === 'active' ? 'pulse-marker' : '';

    const iconHtml = `
      <div class="custom-marker ${pulseClass}" style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
      ">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <!-- Glow effect -->
          <defs>
            <filter id="glow-${source.id}">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="grad-${source.id}">
              <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
            </radialGradient>
          </defs>
          
          <!-- Main circle -->
          <circle 
            cx="${size/2}" 
            cy="${size/2}" 
            r="${size/2 - 2}" 
            fill="url(#grad-${source.id})"
            stroke="${color}"
            stroke-width="2"
            filter="url(#glow-${source.id})"
          />
          
          ${source.alertCount > 0 ? `
            <!-- Alert badge -->
            <circle 
              cx="${size * 0.75}" 
              cy="${size * 0.25}" 
              r="8" 
              fill="#ef4444"
              stroke="#fff"
              stroke-width="2"
            />
            <text 
              x="${size * 0.75}" 
              y="${size * 0.25}" 
              text-anchor="middle"
              dy="0.3em"
              fill="#fff"
              font-size="10"
              font-weight="bold"
            >${source.alertCount > 9 ? '9+' : source.alertCount}</text>
          ` : ''}
        </svg>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-leaflet-icon',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  const addHeatmapLayer = (map: any, sources: SourceNode[], L: any) => {
    // Cette fonction ajouterait une vraie heatmap avec leaflet-heat
    // Pour simplicité, on skip ici mais le pattern est:
    // import 'leaflet.heat';
    // const heatData = sources.map(s => [s.coordinates[0], s.coordinates[1], s.alertCount]);
    // L.heatLayer(heatData).addTo(map);
  };

  const getClusterColor = (type: string): string => {
    const colors: Record<string, string> = {
      'threat-intel': '#ef4444',
      'social': '#06b6d4',
      'dark-web': '#8b5cf6',
      'news': '#f59e0b',
      'technical': '#10b981'
    };
    return colors[type] || '#3b82f6';
  };

  const handleStyleToggle = () => {
    setMapStyle(mapStyle === 'dark' ? 'satellite' : 'dark');
  };

  return (
    <Card className="relative">
      <CardContent className="p-0">
        {/* Controls overlay */}
        <div className="absolute top-4 right-4 z-[1000] flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleStyleToggle}>
            <Layers className="w-4 h-4 mr-2" />
            {mapStyle === 'dark' ? 'Satellite' : 'Dark'}
          </Button>
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground mb-2">SOURCES BY REGION</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">North America</span>
              <Badge variant="outline">
                {sources.filter(s => s.coordinates && s.coordinates[0] > 15 && s.coordinates[0] < 72 && s.coordinates[1] > -170 && s.coordinates[1] < -50).length}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Europe</span>
              <Badge variant="outline">
                {sources.filter(s => s.coordinates && s.coordinates[0] > 35 && s.coordinates[0] < 71 && s.coordinates[1] > -10 && s.coordinates[1] < 40).length}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Asia</span>
              <Badge variant="outline">
                {sources.filter(s => s.coordinates && s.coordinates[0] > -10 && s.coordinates[0] < 55 && s.coordinates[1] > 40 && s.coordinates[1] < 150).length}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Others</span>
              <Badge variant="outline">
                {sources.filter(s => !s.coordinates || 
                  !(s.coordinates[0] > 15 && s.coordinates[0] < 72 && s.coordinates[1] > -170 && s.coordinates[1] < -50) &&
                  !(s.coordinates[0] > 35 && s.coordinates[0] < 71 && s.coordinates[1] > -10 && s.coordinates[1] < 40) &&
                  !(s.coordinates[0] > -10 && s.coordinates[0] < 55 && s.coordinates[1] > 40 && s.coordinates[1] < 150)
                ).length}
              </Badge>
            </div>
          </div>
        </div>

        {/* Hovered source info */}
        {hoveredSource && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 space-y-2 min-w-[280px]">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {hoveredSource.name}
              </h4>
              <Badge variant={hoveredSource.status === 'active' ? 'default' : 'secondary'}>
                {hoveredSource.status}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{hoveredSource.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alerts (24h):</span>
                <Badge variant="destructive">{hoveredSource.alertCount}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trust Score:</span>
                <Badge variant="outline">{hoveredSource.trustScore}/100</Badge>
              </div>
              {hoveredSource.coordinates && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-xs font-mono">
                    {hoveredSource.coordinates[0].toFixed(2)}°, {hoveredSource.coordinates[1].toFixed(2)}°
                  </span>
                </div>
              )}
            </div>
            <Button size="sm" className="w-full mt-2" onClick={() => onSourceSelect(hoveredSource)}>
              View Details
            </Button>
          </div>
        )}

        {/* Map container */}
        <div ref={mapRef} className="w-full h-[700px] rounded-lg" />

        {/* Custom CSS for markers */}
        <style jsx global>{`
          .custom-leaflet-icon {
            background: none !important;
            border: none !important;
          }

          .pulse-marker {
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }

          .custom-tooltip {
            background: rgba(15, 23, 42, 0.95) !important;
            border: 1px solid #334155 !important;
            color: #f8fafc !important;
            font-size: 12px !important;
            padding: 4px 8px !important;
            border-radius: 4px !important;
          }

          .leaflet-popup-content-wrapper {
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid #334155;
            border-radius: 8px;
          }

          .leaflet-popup-tip {
            background: rgba(15, 23, 42, 0.95);
          }
        `}</style>
      </CardContent>
    </Card>
  );
}

