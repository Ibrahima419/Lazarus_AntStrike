/**
 * 🕸️ Network Graph View - D3.js Hierarchical Graph
 * Visualisation des corrélations entre sources et clusters
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';

interface SourceNode {
  id: string;
  name: string;
  type: string;
  alertCount: number;
  trustScore: number;
  status: 'active' | 'inactive' | 'error';
}

interface SourceCluster {
  id: string;
  name: string;
  type: string;
  sources: SourceNode[];
  alertCount: number;
}

interface NetworkGraphViewProps {
  sources: SourceNode[];
  clusters: SourceCluster[];
  onSourceSelect: (source: SourceNode | null) => void;
  selectedSource: SourceNode | null;
}

export function NetworkGraphView({ sources, clusters, onSourceSelect }: NetworkGraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || sources.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create hierarchy data
    const hierarchyData = {
      name: 'Root',
      children: clusters.map(cluster => ({
        name: cluster.name,
        type: cluster.type,
        alertCount: cluster.alertCount,
        children: cluster.sources.map(source => ({
          name: source.name,
          type: source.type,
          alertCount: source.alertCount,
          trustScore: source.trustScore,
          status: source.status,
          sourceData: source
        }))
      }))
    };

    const root = d3.hierarchy(hierarchyData);
    
    const treeLayout = d3.tree()
      .size([height - 100, width - 200])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

    treeLayout(root);

    const g = svg.append('g')
      .attr('transform', `translate(100, 50)`);

    // Draw links
    g.selectAll('.link')
      .data(root.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any)
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.4);

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    nodes.append('circle')
      .attr('r', (d: any) => d.depth === 0 ? 12 : (d.depth === 1 ? 10 : 8))
      .attr('fill', (d: any) => {
        if (d.depth === 0) return '#3b82f6';
        if (d.depth === 1) {
          const colors: Record<string, string> = {
            'threat-intel': '#ef4444',
            'social': '#06b6d4',
            'dark-web': '#8b5cf6',
            'news': '#f59e0b',
            'technical': '#10b981'
          };
          return colors[d.data.type] || '#3b82f6';
        }
        return d.data.status === 'active' ? '#10b981' : '#64748b';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d: any) => {
        if (d.data.sourceData) {
          onSourceSelect(d.data.sourceData);
        }
      });

    nodes.append('text')
      .attr('dy', '0.31em')
      .attr('x', (d: any) => (d.depth === 0 ? 0 : (d.depth === 1 ? -15 : 12)))
      .attr('text-anchor', (d: any) => (d.depth === 0 ? 'middle' : (d.depth === 1 ? 'end' : 'start')))
      .text((d: any) => d.data.name.length > 20 ? d.data.name.substring(0, 20) + '...' : d.data.name)
      .attr('font-size', (d: any) => d.depth === 0 ? '14px' : (d.depth === 1 ? '12px' : '11px'))
      .attr('font-weight', (d: any) => d.depth <= 1 ? 'bold' : 'normal')
      .attr('fill', '#f8fafc');

  }, [sources, clusters]);

  return (
    <Card>
      <CardContent className="p-0">
        <svg ref={svgRef} className="w-full h-[700px] bg-slate-950 rounded-lg" />
      </CardContent>
    </Card>
  );
}

