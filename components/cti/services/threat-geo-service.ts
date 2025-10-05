/**
 * Service de Géolocalisation des Menaces
 * Combine les données Taranis avec la base géographique
 */

import { getTaranisService } from '../../../src/services/taranis/taranis-unified-service';
import { findGeoLocation, extractLocationsFromText, COUNTRIES_GEO, CITIES_GEO } from '../utils/geolocations-db';
import type { TaranisNewsItem } from '../types';

export interface ThreatLocation {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  threat_count: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  threat_type: string;
  last_detected: string;
  campaigns: string[];
  iocs: number;
  status: 'active' | 'mitigated' | 'investigating';
  target_sectors: string[];
  threats: ThreatDetail[];
}

export interface ThreatDetail {
  id: string;
  title: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  source: string;
  timestamp: Date;
  description: string;
  content?: string;
  tags?: string[];
}

/**
 * Extrait les campagnes d'attaque depuis le contenu
 */
function extractCampaigns(content: string): string[] {
  const campaigns: string[] = [];
  
  // Patterns de campagnes connues
  const campaignPatterns = [
    /APT\d+/gi,
    /Lazarus Group/gi,
    /Fancy Bear/gi,
    /Cozy Bear/gi,
    /Kimsuky/gi,
    /Sandworm/gi,
    /Turla/gi,
    /Equation Group/gi,
    /Dark Caracal/gi,
    /OceanLotus/gi,
    /Mustang Panda/gi,
    /Operation [A-Z]\w+/gi,
    /LockBit/gi,
    /BlackCat/gi,
    /ALPHV/gi,
    /Conti/gi,
    /REvil/gi,
    /Emotet/gi,
    /Cobalt Strike/gi
  ];
  
  for (const pattern of campaignPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      campaigns.push(...matches);
    }
  }
  
  return [...new Set(campaigns)]; // Unique
}

/**
 * Extrait les secteurs ciblés depuis le contenu
 */
function extractTargetSectors(content: string): string[] {
  const sectors: string[] = [];
  const contentLower = content.toLowerCase();
  
  const sectorKeywords: Record<string, string[]> = {
    'Government': ['government', 'federal', 'ministry', 'embassy', 'military', 'defense'],
    'Healthcare': ['healthcare', 'hospital', 'medical', 'health', 'pharma'],
    'Finance': ['bank', 'financial', 'finance', 'payment', 'insurance', 'trading'],
    'Energy': ['energy', 'power', 'electric', 'oil', 'gas', 'nuclear'],
    'Technology': ['tech', 'software', 'hardware', 'semiconductor', 'cloud'],
    'Education': ['university', 'school', 'education', 'academic', 'research'],
    'Manufacturing': ['manufacturing', 'industrial', 'factory', 'production'],
    'Retail': ['retail', 'ecommerce', 'shopping', 'commerce'],
    'Telecommunications': ['telecom', 'communication', 'network', 'isp'],
    'Transportation': ['transport', 'aviation', 'airline', 'shipping', 'logistics'],
    'Media': ['media', 'news', 'journalist', 'press', 'broadcasting'],
    'Cryptocurrency': ['crypto', 'bitcoin', 'blockchain', 'exchange'],
    'Critical Infrastructure': ['infrastructure', 'critical', 'scada', 'ics']
  };
  
  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      sectors.push(sector);
    }
  }
  
  return sectors.length > 0 ? sectors : ['Unknown'];
}

/**
 * Détermine le type de menace depuis les tags et le contenu
 */
function determineThreatType(tags: string[] = [], content: string = ''): string {
  const contentLower = content.toLowerCase();
  
  // Vérifier les tags d'abord
  const tagLower = tags.map(t => t.toLowerCase()).join(' ');
  
  if (tagLower.includes('ransomware') || contentLower.includes('ransomware')) return 'Ransomware';
  if (tagLower.includes('apt') || contentLower.includes('advanced persistent')) return 'APT Campaign';
  if (tagLower.includes('phishing') || contentLower.includes('phishing')) return 'Phishing Campaign';
  if (tagLower.includes('malware') || contentLower.includes('malware')) return 'Malware Distribution';
  if (tagLower.includes('ddos') || contentLower.includes('ddos')) return 'DDoS Attack';
  if (tagLower.includes('data breach') || contentLower.includes('data breach')) return 'Data Breach';
  if (tagLower.includes('espionage') || contentLower.includes('espionage')) return 'Cyber Espionage';
  if (tagLower.includes('supply chain') || contentLower.includes('supply chain')) return 'Supply Chain Attack';
  if (contentLower.includes('cryptocurrency') || contentLower.includes('crypto theft')) return 'Cryptocurrency Theft';
  if (contentLower.includes('credential') || contentLower.includes('password')) return 'Credential Theft';
  
  return 'Cyber Threat';
}

/**
 * Normalise le niveau de risque
 */
function normalizeSeverity(riskLevel?: string): 'critical' | 'high' | 'medium' | 'low' {
  if (!riskLevel) return 'medium';
  
  const level = riskLevel.toLowerCase();
  if (level === 'critical') return 'critical';
  if (level === 'high') return 'high';
  if (level === 'low') return 'low';
  return 'medium';
}

/**
 * Traite les trending clusters IA de Taranis
 */
function processTrendingClusters(clusters: any[]): ThreatLocation[] {
  const threatLocations: ThreatLocation[] = [];
  
  for (const cluster of clusters) {
    // Extraire les pays du cluster
    const countries = cluster.countries || extractLocationsFromText(cluster.keywords?.join(' ') || '');
    
    for (const country of countries) {
      const geoData = findGeoLocation(country);
      if (!geoData) continue;
      
      // Déterminer la sévérité du cluster
      let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium';
      if (cluster.severity) {
        severity = normalizeSeverity(cluster.severity);
      } else if (cluster.news_items_count > 50) {
        severity = 'critical';
      } else if (cluster.news_items_count > 20) {
        severity = 'high';
      }
      
      // Créer la threat location depuis le cluster
      threatLocations.push({
        id: `cluster-${cluster.id}-${country}`,
        lat: geoData.coords[1],
        lng: geoData.coords[0],
        city: geoData.capital || country,
        country: country,
        threat_count: cluster.news_items_count || 1,
        severity,
        threat_type: cluster.keywords?.[0] || 'Cyber Threat',
        last_detected: new Date().toISOString(),
        campaigns: cluster.keywords?.slice(0, 5) || [],
        iocs: cluster.total_iocs || 0,
        status: cluster.trend === 'rising' ? 'active' : cluster.trend === 'falling' ? 'mitigated' : 'investigating',
        target_sectors: cluster.target_sectors || [],
        threats: [] // Sera rempli si besoin
      });
    }
  }
  
  return threatLocations.sort((a, b) => b.threat_count - a.threat_count);
}

/**
 * Charge les menaces géolocalisées depuis Taranis (avec clustering IA)
 */
export async function loadGeolocatedThreats(limit: number = 200): Promise<ThreatLocation[]> {
  const service = getTaranisService();
  
  try {
    // OPTIMISÉ: Essayer d'abord les trending clusters IA
    const trendingClusters = await service.getTrendingClusters();
    
    if (trendingClusters && trendingClusters.length > 0) {
      console.log(`✅ Utilisation clustering IA Taranis (${trendingClusters.length} clusters)`);
      return processTrendingClusters(trendingClusters);
    }
    
    // Fallback: méthode traditionnelle
    console.log('⚠️ Trending clusters non disponible, fallback méthode traditionnelle');
    const newsItems: TaranisNewsItem[] = await service.getNewsItems(limit);
    
    // Créer un mapping pays/ville -> menaces
    const locationMap = new Map<string, ThreatDetail[]>();
    
    for (const item of newsItems) {
      const content = `${item.title} ${item.content || ''}`;
      
      // Extraire les locations (pays et villes)
      const locations = extractLocationsFromText(content);
      
      // Si aucune location trouvée, essayer d'extraire manuellement
      const manualLocations: string[] = [];
      if (locations.length === 0) {
        // Chercher des patterns communs
        const countryPatterns = Object.keys(COUNTRIES_GEO);
        for (const country of countryPatterns) {
          if (country.length > 2 && content.includes(country)) {
            manualLocations.push(country);
          }
        }
      }
      
      const targetLocations = locations.length > 0 ? locations : 
                              manualLocations.length > 0 ? manualLocations : 
                              ['Global'];
      
      // Créer l'objet threat
      const threat: ThreatDetail = {
        id: item.id,
        title: item.title,
        type: determineThreatType(item.tags, content),
        severity: normalizeSeverity(item.riskLevel),
        confidence: item.confidence || 0.7,
        source: item.osintSourceId || 'Taranis AI',
        timestamp: new Date(item.collectedDate || item.publishedDate || Date.now()),
        description: item.content?.substring(0, 250) || 'No description available',
        content: item.content,
        tags: item.tags
      };
      
      // Ajouter la menace à chaque location
      for (const location of targetLocations) {
        if (!locationMap.has(location)) {
          locationMap.set(location, []);
        }
        locationMap.get(location)!.push(threat);
      }
    }
    
    // Convertir le mapping en ThreatLocations
    const threatLocations: ThreatLocation[] = [];
    
    for (const [locationName, threats] of locationMap.entries()) {
      // Chercher les coordonnées
      const geoData = findGeoLocation(locationName);
      
      if (!geoData && locationName !== 'Global') {
        continue; // Skip si pas de coordonnées
      }
      
      // Calculer la sévérité maximale
      const severities = threats.map(t => t.severity);
      let maxSeverity: 'critical' | 'high' | 'medium' | 'low' = 'low';
      if (severities.includes('critical')) maxSeverity = 'critical';
      else if (severities.includes('high')) maxSeverity = 'high';
      else if (severities.includes('medium')) maxSeverity = 'medium';
      
      // Déterminer le statut basé sur les timestamps
      const recentThreats = threats.filter(t => {
        const hoursSince = (Date.now() - t.timestamp.getTime()) / (1000 * 60 * 60);
        return hoursSince < 48; // Dernières 48h
      });
      const status: 'active' | 'mitigated' | 'investigating' = 
        recentThreats.length > threats.length * 0.5 ? 'active' :
        recentThreats.length > 0 ? 'investigating' : 'mitigated';
      
      // Extraire les campagnes de tous les threats
      const allContent = threats.map(t => t.content || t.title).join(' ');
      const campaigns = extractCampaigns(allContent);
      
      // Extraire les secteurs ciblés
      const targetSectors = extractTargetSectors(allContent);
      
      // Déterminer le type de menace principal
      const typeCount = new Map<string, number>();
      threats.forEach(t => {
        typeCount.set(t.type, (typeCount.get(t.type) || 0) + 1);
      });
      const mainType = Array.from(typeCount.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
      
      // Compter les IOCs (approximatif depuis les tags)
      const iocsCount = threats.reduce((sum, t) => sum + (t.tags?.length || 0), 0);
      
      // Déterminer si c'est une ville ou un pays
      const isCity = CITIES_GEO[locationName] !== undefined;
      const cityName = isCity ? locationName : (geoData?.capital || locationName);
      const countryName = isCity ? 'Unknown' : locationName;
      
      threatLocations.push({
        id: locationName.toLowerCase().replace(/\s+/g, '-'),
        lat: geoData?.coords[1] || 0,
        lng: geoData?.coords[0] || 0,
        city: cityName,
        country: countryName,
        threat_count: threats.length,
        severity: maxSeverity,
        threat_type: mainType,
        last_detected: threats[0]?.timestamp.toISOString() || new Date().toISOString(),
        campaigns: campaigns.slice(0, 5), // Max 5 campagnes
        iocs: iocsCount,
        status,
        target_sectors: targetSectors.slice(0, 5), // Max 5 secteurs
        threats: threats.slice(0, 10) // Max 10 threats par location
      });
    }
    
    // Trier par nombre de menaces (décroissant)
    threatLocations.sort((a, b) => b.threat_count - a.threat_count);
    
    return threatLocations;
    
  } catch (error) {
    console.error('Erreur chargement menaces géolocalisées:', error);
    throw error;
  }
}

/**
 * Charge les statistiques de menaces par région
 */
export async function getThreatStatsByRegion(): Promise<Record<string, number>> {
  const threats = await loadGeolocatedThreats();
  const regionStats: Record<string, number> = {};
  
  for (const threat of threats) {
    const geoData = findGeoLocation(threat.country);
    const region = geoData?.region || 'Unknown';
    
    regionStats[region] = (regionStats[region] || 0) + threat.threat_count;
  }
  
  return regionStats;
}

/**
 * Charge les menaces critiques géolocalisées
 */
export async function getCriticalThreats(): Promise<ThreatLocation[]> {
  const allThreats = await loadGeolocatedThreats();
  return allThreats.filter(t => t.severity === 'critical' || t.severity === 'high');
}

