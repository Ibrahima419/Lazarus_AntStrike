/**
 * 🌌 Galaxy View - Force Simulation avec D3.js
 * Visualisation type "univers" des sources OSINT avec clustering gravitationnel
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface SourceNode {
  id: string;
  name: string;
  type: string;
  enabled?: boolean;
  alertCount: number;
  trustScore: number;
  status: 'active' | 'inactive' | 'error';
  lastCollected?: Date;
  color?: string;
}

interface SourceCluster {
  id: string;
  name: string;
  type: string;
  sources: SourceNode[];
  alertCount?: number;
  confidence?: number;
  confidence: number;
}

interface GalaxyViewProps {
  sources: SourceNode[];
  clusters: SourceCluster[];
  onSourceSelect: (source: SourceNode | null) => void;
  selectedSource: SourceNode | null;
}

export function GalaxyView({ 
  sources, 
  clusters, 
  onSourceSelect, 
  selectedSource 
}: GalaxyViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSource, setHoveredSource] = useState<SourceNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || sources.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.clientWidth;
    const height = canvas.height = canvas.clientHeight;

    // Initialize source positions
    const nodes = sources.map((source, i) => ({
      ...source,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: getNodeRadius(source)
    }));

    // Simple physics simulation
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw cluster halos
      clusters.forEach(cluster => {
        const clusterNodes = nodes.filter(n => 
          cluster.sources.some(s => s.id === n.id)
        );

        if (clusterNodes.length === 0) return;

        const centerX = clusterNodes.reduce((sum, n) => sum + n.x, 0) / clusterNodes.length;
        const centerY = clusterNodes.reduce((sum, n) => sum + n.y, 0) / clusterNodes.length;

        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(100, cluster.sources.length * 20), 0, Math.PI * 2);
        ctx.strokeStyle = getClusterColor(cluster.type) + '33';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Simple center attraction
        const dx = width / 2 - node.x;
        const dy = height / 2 - node.y;
        node.vx += dx * 0.001;
        node.vy += dy * 0.001;

        // Repulsion from other nodes
        nodes.forEach((other, j) => {
          if (i === j) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const force = (100 - dist) / 100;
            node.vx += (dx / dist) * force * 0.5;
            node.vy += (dy / dist) * force * 0.5;
          }
        });

        // Apply velocity with damping
        node.vx *= 0.95;
        node.vy *= 0.95;
        node.x += node.vx;
        node.y += node.vy;

        // Bounds
        node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));

        // Draw node
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius);
        gradient.addColorStop(0, node.color || '#3b82f6');
        gradient.addColorStop(1, (node.color || '#3b82f6') + '44');

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Border
        ctx.strokeStyle = node.status === 'active' ? (node.color || '#3b82f6') : '#64748b';
        ctx.lineWidth = node.status === 'active' ? 3 : 1;
        ctx.stroke();

        // Alert badge
        if (node.alertCount > 0) {
          ctx.beginPath();
          ctx.arc(node.x + node.radius * 0.6, node.y - node.radius * 0.6, 12, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            node.alertCount > 99 ? '99+' : String(node.alertCount),
            node.x + node.radius * 0.6,
            node.y - node.radius * 0.6
          );
        }

        // Label
        ctx.fillStyle = '#f8fafc';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          node.name.length > 15 ? node.name.substring(0, 15) + '...' : node.name,
          node.x,
          node.y + node.radius + 15
        );
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });

      const hovered = nodes.find(node => {
        const dx = x - node.x;
        const dy = y - node.y;
        return Math.sqrt(dx * dx + dy * dy) <= node.radius;
      });

      setHoveredSource(hovered || null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clicked = nodes.find(node => {
        const dx = x - node.x;
        const dy = y - node.y;
        return Math.sqrt(dx * dx + dy * dy) <= node.radius;
      });

      if (clicked) {
        onSourceSelect(clicked);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [sources, clusters]);

  const getNodeRadius = (node: SourceNode): number => {
    const baseRadius = 20;
    const alertFactor = Math.sqrt(node.alertCount) * 2;
    const trustFactor = (node.trustScore / 100) * 10;
    return Math.min(baseRadius + alertFactor + trustFactor, 50);
  };

  const getTrustColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
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

  return (
    <Card className="relative">
      <CardContent className="p-0">
        {/* Controls overlay */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button size="sm" variant="secondary">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground mb-2">LEGEND</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Trust Score 80+</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Trust Score 60-79</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Trust Score 40-59</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Trust Score below 40</span>
          </div>
          <div className="h-px bg-border my-2"></div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full border-2 border-primary animate-pulse"></div>
            <span>Active Source</span>
          </div>
        </div>

        {/* Hovered source tooltip */}
        {hoveredSource && (
          <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 space-y-2 min-w-[250px]">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{hoveredSource.name}</h4>
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
                <span className="text-muted-foreground">Alerts:</span>
                <span className="font-medium">{hoveredSource.alertCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trust Score:</span>
                <span className="font-medium" style={{ color: getTrustColor(hoveredSource.trustScore) }}>
                  {hoveredSource.trustScore}/100
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-[700px] bg-slate-950 rounded-lg cursor-pointer"
        />
      </CardContent>
    </Card>
  );
}
