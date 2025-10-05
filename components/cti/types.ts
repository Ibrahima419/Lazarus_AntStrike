/**
 * Types pour les modules CTI
 */

export interface TaranisOSINTSource {
  id: string;
  name: string;
  type: string;
  url?: string;
  enabled: boolean;
  status: string;
  description?: string;
  collectedCount: number;
  lastCollected: string;
  groupId?: string;
}

export interface TaranisOSINTSourceGroup {
  id: string;
  name: string;
  description?: string;
}

export interface TaranisNewsItem {
  id: string;
  title: string;
  content: string;
  confidence?: number;
  riskLevel?: string;
  tags?: string[];
  osintSourceId: string;
  collectedDate: string;
  publishedDate?: string;
}

export interface TaranisStory {
  id: string;
  title: string;
  content: string;
  status: string;
  tags: string[];
  newsItems?: TaranisNewsItem[];
}

export interface TaranisBot {
  id: string;
  name: string;
  type: string;
  status: string;
  processedCount: number;
  successRate: number;
  lastRun: string;
  description?: string;
}

export interface TaranisReport {
  id: string;
  title: string;
  content: string;
  status: string;
  tags: string[];
  threatLevel?: string;
}

export interface TaranisStats {
  totalBots: number;
  activeBots: number;
  totalSources: number;
  activeSources: number;
  totalItems: number;
  totalReports: number;
}
