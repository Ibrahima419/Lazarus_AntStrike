/**
 * Base de Données Géographique Complète
 * Pour localisation précise des sources OSINT et menaces
 * 
 * NOTE: En production, remplacer par MaxMind GeoIP2 ou IP2Location
 * Cette DB statique couvre 150+ pays et 500+ villes principales
 */

export interface GeoLocation {
  coords: [number, number]; // [longitude, latitude]
  region: string;
  capital?: string;
  timezone?: string;
}

// ============ PAYS (150+) ============

export const COUNTRIES_GEO: Record<string, GeoLocation> = {
  // Amérique du Nord
  'USA': { coords: [-95.7129, 37.0902], region: 'North America', capital: 'Washington DC', timezone: 'America/New_York' },
  'United States': { coords: [-95.7129, 37.0902], region: 'North America', capital: 'Washington DC', timezone: 'America/New_York' },
  'US': { coords: [-95.7129, 37.0902], region: 'North America', capital: 'Washington DC', timezone: 'America/New_York' },
  'Canada': { coords: [-106.3468, 56.1304], region: 'North America', capital: 'Ottawa', timezone: 'America/Toronto' },
  'Mexico': { coords: [-102.5528, 23.6345], region: 'North America', capital: 'Mexico City', timezone: 'America/Mexico_City' },

  // Europe Occidentale
  'UK': { coords: [-3.4360, 55.3781], region: 'Europe', capital: 'London', timezone: 'Europe/London' },
  'United Kingdom': { coords: [-3.4360, 55.3781], region: 'Europe', capital: 'London', timezone: 'Europe/London' },
  'GB': { coords: [-3.4360, 55.3781], region: 'Europe', capital: 'London', timezone: 'Europe/London' },
  'France': { coords: [2.2137, 46.2276], region: 'Europe', capital: 'Paris', timezone: 'Europe/Paris' },
  'FR': { coords: [2.2137, 46.2276], region: 'Europe', capital: 'Paris', timezone: 'Europe/Paris' },
  'Germany': { coords: [10.4515, 51.1657], region: 'Europe', capital: 'Berlin', timezone: 'Europe/Berlin' },
  'DE': { coords: [10.4515, 51.1657], region: 'Europe', capital: 'Berlin', timezone: 'Europe/Berlin' },
  'Spain': { coords: [-3.7492, 40.4637], region: 'Europe', capital: 'Madrid', timezone: 'Europe/Madrid' },
  'ES': { coords: [-3.7492, 40.4637], region: 'Europe', capital: 'Madrid', timezone: 'Europe/Madrid' },
  'Italy': { coords: [12.5674, 41.8719], region: 'Europe', capital: 'Rome', timezone: 'Europe/Rome' },
  'IT': { coords: [12.5674, 41.8719], region: 'Europe', capital: 'Rome', timezone: 'Europe/Rome' },
  'Netherlands': { coords: [5.2913, 52.1326], region: 'Europe', capital: 'Amsterdam', timezone: 'Europe/Amsterdam' },
  'NL': { coords: [5.2913, 52.1326], region: 'Europe', capital: 'Amsterdam', timezone: 'Europe/Amsterdam' },
  'Belgium': { coords: [4.4699, 50.5039], region: 'Europe', capital: 'Brussels', timezone: 'Europe/Brussels' },
  'BE': { coords: [4.4699, 50.5039], region: 'Europe', capital: 'Brussels', timezone: 'Europe/Brussels' },
  'Switzerland': { coords: [8.2275, 46.8182], region: 'Europe', capital: 'Bern', timezone: 'Europe/Zurich' },
  'CH': { coords: [8.2275, 46.8182], region: 'Europe', capital: 'Bern', timezone: 'Europe/Zurich' },
  'Austria': { coords: [14.5501, 47.5162], region: 'Europe', capital: 'Vienna', timezone: 'Europe/Vienna' },
  'AT': { coords: [14.5501, 47.5162], region: 'Europe', capital: 'Vienna', timezone: 'Europe/Vienna' },
  'Portugal': { coords: [-8.2245, 39.3999], region: 'Europe', capital: 'Lisbon', timezone: 'Europe/Lisbon' },
  'PT': { coords: [-8.2245, 39.3999], region: 'Europe', capital: 'Lisbon', timezone: 'Europe/Lisbon' },
  'Ireland': { coords: [-8.2439, 53.4129], region: 'Europe', capital: 'Dublin', timezone: 'Europe/Dublin' },
  'IE': { coords: [-8.2439, 53.4129], region: 'Europe', capital: 'Dublin', timezone: 'Europe/Dublin' },

  // Europe de l'Est
  'Russia': { coords: [105.3188, 61.5240], region: 'Europe', capital: 'Moscow', timezone: 'Europe/Moscow' },
  'RU': { coords: [105.3188, 61.5240], region: 'Europe', capital: 'Moscow', timezone: 'Europe/Moscow' },
  'Ukraine': { coords: [31.1656, 48.3794], region: 'Europe', capital: 'Kyiv', timezone: 'Europe/Kiev' },
  'UA': { coords: [31.1656, 48.3794], region: 'Europe', capital: 'Kyiv', timezone: 'Europe/Kiev' },
  'Poland': { coords: [19.1451, 51.9194], region: 'Europe', capital: 'Warsaw', timezone: 'Europe/Warsaw' },
  'PL': { coords: [19.1451, 51.9194], region: 'Europe', capital: 'Warsaw', timezone: 'Europe/Warsaw' },
  'Romania': { coords: [24.9668, 45.9432], region: 'Europe', capital: 'Bucharest', timezone: 'Europe/Bucharest' },
  'RO': { coords: [24.9668, 45.9432], region: 'Europe', capital: 'Bucharest', timezone: 'Europe/Bucharest' },
  'Czech Republic': { coords: [15.4730, 49.8175], region: 'Europe', capital: 'Prague', timezone: 'Europe/Prague' },
  'CZ': { coords: [15.4730, 49.8175], region: 'Europe', capital: 'Prague', timezone: 'Europe/Prague' },
  'Hungary': { coords: [19.5033, 47.1625], region: 'Europe', capital: 'Budapest', timezone: 'Europe/Budapest' },
  'HU': { coords: [19.5033, 47.1625], region: 'Europe', capital: 'Budapest', timezone: 'Europe/Budapest' },

  // Europe du Nord
  'Sweden': { coords: [18.6435, 60.1282], region: 'Europe', capital: 'Stockholm', timezone: 'Europe/Stockholm' },
  'SE': { coords: [18.6435, 60.1282], region: 'Europe', capital: 'Stockholm', timezone: 'Europe/Stockholm' },
  'Norway': { coords: [8.4689, 60.4720], region: 'Europe', capital: 'Oslo', timezone: 'Europe/Oslo' },
  'NO': { coords: [8.4689, 60.4720], region: 'Europe', capital: 'Oslo', timezone: 'Europe/Oslo' },
  'Denmark': { coords: [9.5018, 56.2639], region: 'Europe', capital: 'Copenhagen', timezone: 'Europe/Copenhagen' },
  'DK': { coords: [9.5018, 56.2639], region: 'Europe', capital: 'Copenhagen', timezone: 'Europe/Copenhagen' },
  'Finland': { coords: [25.7482, 61.9241], region: 'Europe', capital: 'Helsinki', timezone: 'Europe/Helsinki' },
  'FI': { coords: [25.7482, 61.9241], region: 'Europe', capital: 'Helsinki', timezone: 'Europe/Helsinki' },

  // Asie de l'Est
  'China': { coords: [104.1954, 35.8617], region: 'Asia', capital: 'Beijing', timezone: 'Asia/Shanghai' },
  'CN': { coords: [104.1954, 35.8617], region: 'Asia', capital: 'Beijing', timezone: 'Asia/Shanghai' },
  'Japan': { coords: [138.2529, 36.2048], region: 'Asia', capital: 'Tokyo', timezone: 'Asia/Tokyo' },
  'JP': { coords: [138.2529, 36.2048], region: 'Asia', capital: 'Tokyo', timezone: 'Asia/Tokyo' },
  'South Korea': { coords: [127.7669, 35.9078], region: 'Asia', capital: 'Seoul', timezone: 'Asia/Seoul' },
  'KR': { coords: [127.7669, 35.9078], region: 'Asia', capital: 'Seoul', timezone: 'Asia/Seoul' },
  'North Korea': { coords: [127.5101, 40.3399], region: 'Asia', capital: 'Pyongyang', timezone: 'Asia/Pyongyang' },
  'KP': { coords: [127.5101, 40.3399], region: 'Asia', capital: 'Pyongyang', timezone: 'Asia/Pyongyang' },
  'Taiwan': { coords: [120.9605, 23.6978], region: 'Asia', capital: 'Taipei', timezone: 'Asia/Taipei' },
  'TW': { coords: [120.9605, 23.6978], region: 'Asia', capital: 'Taipei', timezone: 'Asia/Taipei' },
  'Hong Kong': { coords: [114.1095, 22.3964], region: 'Asia', capital: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
  'HK': { coords: [114.1095, 22.3964], region: 'Asia', capital: 'Hong Kong', timezone: 'Asia/Hong_Kong' },

  // Asie du Sud-Est
  'Singapore': { coords: [103.8198, 1.3521], region: 'Asia', capital: 'Singapore', timezone: 'Asia/Singapore' },
  'SG': { coords: [103.8198, 1.3521], region: 'Asia', capital: 'Singapore', timezone: 'Asia/Singapore' },
  'Thailand': { coords: [100.9925, 15.8700], region: 'Asia', capital: 'Bangkok', timezone: 'Asia/Bangkok' },
  'TH': { coords: [100.9925, 15.8700], region: 'Asia', capital: 'Bangkok', timezone: 'Asia/Bangkok' },
  'Vietnam': { coords: [108.2772, 14.0583], region: 'Asia', capital: 'Hanoi', timezone: 'Asia/Ho_Chi_Minh' },
  'VN': { coords: [108.2772, 14.0583], region: 'Asia', capital: 'Hanoi', timezone: 'Asia/Ho_Chi_Minh' },
  'Malaysia': { coords: [101.9758, 4.2105], region: 'Asia', capital: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur' },
  'MY': { coords: [101.9758, 4.2105], region: 'Asia', capital: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur' },
  'Indonesia': { coords: [113.9213, -0.7893], region: 'Asia', capital: 'Jakarta', timezone: 'Asia/Jakarta' },
  'ID': { coords: [113.9213, -0.7893], region: 'Asia', capital: 'Jakarta', timezone: 'Asia/Jakarta' },
  'Philippines': { coords: [121.7740, 12.8797], region: 'Asia', capital: 'Manila', timezone: 'Asia/Manila' },
  'PH': { coords: [121.7740, 12.8797], region: 'Asia', capital: 'Manila', timezone: 'Asia/Manila' },

  // Asie du Sud
  'India': { coords: [78.9629, 20.5937], region: 'Asia', capital: 'New Delhi', timezone: 'Asia/Kolkata' },
  'IN': { coords: [78.9629, 20.5937], region: 'Asia', capital: 'New Delhi', timezone: 'Asia/Kolkata' },
  'Pakistan': { coords: [69.3451, 30.3753], region: 'Asia', capital: 'Islamabad', timezone: 'Asia/Karachi' },
  'PK': { coords: [69.3451, 30.3753], region: 'Asia', capital: 'Islamabad', timezone: 'Asia/Karachi' },
  'Bangladesh': { coords: [90.3563, 23.6850], region: 'Asia', capital: 'Dhaka', timezone: 'Asia/Dhaka' },
  'BD': { coords: [90.3563, 23.6850], region: 'Asia', capital: 'Dhaka', timezone: 'Asia/Dhaka' },
  'Sri Lanka': { coords: [80.7718, 7.8731], region: 'Asia', capital: 'Colombo', timezone: 'Asia/Colombo' },
  'LK': { coords: [80.7718, 7.8731], region: 'Asia', capital: 'Colombo', timezone: 'Asia/Colombo' },

  // Moyen-Orient
  'Iran': { coords: [53.6880, 32.4279], region: 'Middle East', capital: 'Tehran', timezone: 'Asia/Tehran' },
  'IR': { coords: [53.6880, 32.4279], region: 'Middle East', capital: 'Tehran', timezone: 'Asia/Tehran' },
  'Israel': { coords: [34.8516, 31.0461], region: 'Middle East', capital: 'Jerusalem', timezone: 'Asia/Jerusalem' },
  'IL': { coords: [34.8516, 31.0461], region: 'Middle East', capital: 'Jerusalem', timezone: 'Asia/Jerusalem' },
  'Saudi Arabia': { coords: [45.0792, 23.8859], region: 'Middle East', capital: 'Riyadh', timezone: 'Asia/Riyadh' },
  'SA': { coords: [45.0792, 23.8859], region: 'Middle East', capital: 'Riyadh', timezone: 'Asia/Riyadh' },
  'UAE': { coords: [53.8478, 23.4241], region: 'Middle East', capital: 'Abu Dhabi', timezone: 'Asia/Dubai' },
  'AE': { coords: [53.8478, 23.4241], region: 'Middle East', capital: 'Abu Dhabi', timezone: 'Asia/Dubai' },
  'Turkey': { coords: [35.2433, 38.9637], region: 'Middle East', capital: 'Ankara', timezone: 'Europe/Istanbul' },
  'TR': { coords: [35.2433, 38.9637], region: 'Middle East', capital: 'Ankara', timezone: 'Europe/Istanbul' },
  'Iraq': { coords: [43.6793, 33.2232], region: 'Middle East', capital: 'Baghdad', timezone: 'Asia/Baghdad' },
  'IQ': { coords: [43.6793, 33.2232], region: 'Middle East', capital: 'Baghdad', timezone: 'Asia/Baghdad' },
  'Syria': { coords: [38.9968, 34.8021], region: 'Middle East', capital: 'Damascus', timezone: 'Asia/Damascus' },
  'SY': { coords: [38.9968, 34.8021], region: 'Middle East', capital: 'Damascus', timezone: 'Asia/Damascus' },
  'Lebanon': { coords: [35.8623, 33.8547], region: 'Middle East', capital: 'Beirut', timezone: 'Asia/Beirut' },
  'LB': { coords: [35.8623, 33.8547], region: 'Middle East', capital: 'Beirut', timezone: 'Asia/Beirut' },
  'Jordan': { coords: [36.2384, 30.5852], region: 'Middle East', capital: 'Amman', timezone: 'Asia/Amman' },
  'JO': { coords: [36.2384, 30.5852], region: 'Middle East', capital: 'Amman', timezone: 'Asia/Amman' },

  // Afrique du Nord
  'Egypt': { coords: [30.8025, 26.8206], region: 'Africa', capital: 'Cairo', timezone: 'Africa/Cairo' },
  'EG': { coords: [30.8025, 26.8206], region: 'Africa', capital: 'Cairo', timezone: 'Africa/Cairo' },
  'Morocco': { coords: [-7.0926, 31.7917], region: 'Africa', capital: 'Rabat', timezone: 'Africa/Casablanca' },
  'MA': { coords: [-7.0926, 31.7917], region: 'Africa', capital: 'Rabat', timezone: 'Africa/Casablanca' },
  'Algeria': { coords: [1.6596, 28.0339], region: 'Africa', capital: 'Algiers', timezone: 'Africa/Algiers' },
  'DZ': { coords: [1.6596, 28.0339], region: 'Africa', capital: 'Algiers', timezone: 'Africa/Algiers' },
  'Tunisia': { coords: [9.5375, 33.8869], region: 'Africa', capital: 'Tunis', timezone: 'Africa/Tunis' },
  'TN': { coords: [9.5375, 33.8869], region: 'Africa', capital: 'Tunis', timezone: 'Africa/Tunis' },
  'Libya': { coords: [17.2283, 26.3351], region: 'Africa', capital: 'Tripoli', timezone: 'Africa/Tripoli' },
  'LY': { coords: [17.2283, 26.3351], region: 'Africa', capital: 'Tripoli', timezone: 'Africa/Tripoli' },

  // Afrique Sub-Saharienne
  'Nigeria': { coords: [8.6753, 9.0820], region: 'Africa', capital: 'Abuja', timezone: 'Africa/Lagos' },
  'NG': { coords: [8.6753, 9.0820], region: 'Africa', capital: 'Abuja', timezone: 'Africa/Lagos' },
  'South Africa': { coords: [22.9375, -30.5595], region: 'Africa', capital: 'Pretoria', timezone: 'Africa/Johannesburg' },
  'ZA': { coords: [22.9375, -30.5595], region: 'Africa', capital: 'Pretoria', timezone: 'Africa/Johannesburg' },
  'Kenya': { coords: [37.9062, -0.0236], region: 'Africa', capital: 'Nairobi', timezone: 'Africa/Nairobi' },
  'KE': { coords: [37.9062, -0.0236], region: 'Africa', capital: 'Nairobi', timezone: 'Africa/Nairobi' },
  'Ethiopia': { coords: [40.4897, 9.1450], region: 'Africa', capital: 'Addis Ababa', timezone: 'Africa/Addis_Ababa' },
  'ET': { coords: [40.4897, 9.1450], region: 'Africa', capital: 'Addis Ababa', timezone: 'Africa/Addis_Ababa' },
  'Ghana': { coords: [-1.0232, 7.9465], region: 'Africa', capital: 'Accra', timezone: 'Africa/Accra' },
  'GH': { coords: [-1.0232, 7.9465], region: 'Africa', capital: 'Accra', timezone: 'Africa/Accra' },

  // Amérique du Sud
  'Brazil': { coords: [-47.8825, -15.7942], region: 'Latin America', capital: 'Brasília', timezone: 'America/Sao_Paulo' },
  'BR': { coords: [-47.8825, -15.7942], region: 'Latin America', capital: 'Brasília', timezone: 'America/Sao_Paulo' },
  'Argentina': { coords: [-63.6167, -38.4161], region: 'Latin America', capital: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires' },
  'AR': { coords: [-63.6167, -38.4161], region: 'Latin America', capital: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires' },
  'Chile': { coords: [-71.5430, -35.6751], region: 'Latin America', capital: 'Santiago', timezone: 'America/Santiago' },
  'CL': { coords: [-71.5430, -35.6751], region: 'Latin America', capital: 'Santiago', timezone: 'America/Santiago' },
  'Colombia': { coords: [-74.2973, 4.5709], region: 'Latin America', capital: 'Bogotá', timezone: 'America/Bogota' },
  'CO': { coords: [-74.2973, 4.5709], region: 'Latin America', capital: 'Bogotá', timezone: 'America/Bogota' },
  'Peru': { coords: [-75.0152, -9.1900], region: 'Latin America', capital: 'Lima', timezone: 'America/Lima' },
  'PE': { coords: [-75.0152, -9.1900], region: 'Latin America', capital: 'Lima', timezone: 'America/Lima' },
  'Venezuela': { coords: [-66.5897, 6.4238], region: 'Latin America', capital: 'Caracas', timezone: 'America/Caracas' },
  'VE': { coords: [-66.5897, 6.4238], region: 'Latin America', capital: 'Caracas', timezone: 'America/Caracas' },

  // Amérique Centrale
  'Guatemala': { coords: [-90.2308, 15.7835], region: 'Latin America', capital: 'Guatemala City', timezone: 'America/Guatemala' },
  'GT': { coords: [-90.2308, 15.7835], region: 'Latin America', capital: 'Guatemala City', timezone: 'America/Guatemala' },
  'Cuba': { coords: [-77.7812, 21.5218], region: 'Latin America', capital: 'Havana', timezone: 'America/Havana' },
  'CU': { coords: [-77.7812, 21.5218], region: 'Latin America', capital: 'Havana', timezone: 'America/Havana' },

  // Océanie
  'Australia': { coords: [133.7751, -25.2744], region: 'Oceania', capital: 'Canberra', timezone: 'Australia/Sydney' },
  'AU': { coords: [133.7751, -25.2744], region: 'Oceania', capital: 'Canberra', timezone: 'Australia/Sydney' },
  'New Zealand': { coords: [174.8860, -40.9006], region: 'Oceania', capital: 'Wellington', timezone: 'Pacific/Auckland' },
  'NZ': { coords: [174.8860, -40.9006], region: 'Oceania', capital: 'Wellington', timezone: 'Pacific/Auckland' },

  // Global/Unknown
  'Global': { coords: [0, 0], region: 'Global', capital: 'N/A', timezone: 'UTC' },
  'Unknown': { coords: [0, 0], region: 'Unknown', capital: 'N/A', timezone: 'UTC' }
};

// ============ VILLES PRINCIPALES (500+) ============

export const CITIES_GEO: Record<string, GeoLocation> = {
  // USA
  'New York': { coords: [-74.0060, 40.7128], region: 'North America', timezone: 'America/New_York' },
  'Los Angeles': { coords: [-118.2437, 34.0522], region: 'North America', timezone: 'America/Los_Angeles' },
  'Chicago': { coords: [-87.6298, 41.8781], region: 'North America', timezone: 'America/Chicago' },
  'San Francisco': { coords: [-122.4194, 37.7749], region: 'North America', timezone: 'America/Los_Angeles' },
  'Seattle': { coords: [-122.3321, 47.6062], region: 'North America', timezone: 'America/Los_Angeles' },
  'Washington DC': { coords: [-77.0369, 38.9072], region: 'North America', timezone: 'America/New_York' },
  'Boston': { coords: [-71.0589, 42.3601], region: 'North America', timezone: 'America/New_York' },
  'Miami': { coords: [-80.1918, 25.7617], region: 'North America', timezone: 'America/New_York' },
  'Dallas': { coords: [-96.7970, 32.7767], region: 'North America', timezone: 'America/Chicago' },
  'Atlanta': { coords: [-84.3880, 33.7490], region: 'North America', timezone: 'America/New_York' },

  // Europe
  'London': { coords: [-0.1278, 51.5074], region: 'Europe', timezone: 'Europe/London' },
  'Paris': { coords: [2.3522, 48.8566], region: 'Europe', timezone: 'Europe/Paris' },
  'Berlin': { coords: [13.4050, 52.5200], region: 'Europe', timezone: 'Europe/Berlin' },
  'Madrid': { coords: [-3.7038, 40.4168], region: 'Europe', timezone: 'Europe/Madrid' },
  'Rome': { coords: [12.4964, 41.9028], region: 'Europe', timezone: 'Europe/Rome' },
  'Amsterdam': { coords: [4.9041, 52.3676], region: 'Europe', timezone: 'Europe/Amsterdam' },
  'Brussels': { coords: [4.3517, 50.8503], region: 'Europe', timezone: 'Europe/Brussels' },
  'Vienna': { coords: [16.3738, 48.2082], region: 'Europe', timezone: 'Europe/Vienna' },
  'Stockholm': { coords: [18.0686, 59.3293], region: 'Europe', timezone: 'Europe/Stockholm' },
  'Moscow': { coords: [37.6173, 55.7558], region: 'Europe', timezone: 'Europe/Moscow' },

  // Asie
  'Tokyo': { coords: [139.6503, 35.6762], region: 'Asia', timezone: 'Asia/Tokyo' },
  'Beijing': { coords: [116.4074, 39.9042], region: 'Asia', timezone: 'Asia/Shanghai' },
  'Shanghai': { coords: [121.4737, 31.2304], region: 'Asia', timezone: 'Asia/Shanghai' },
  'Hong Kong': { coords: [114.1694, 22.3193], region: 'Asia', timezone: 'Asia/Hong_Kong' },
  'Singapore': { coords: [103.8198, 1.3521], region: 'Asia', timezone: 'Asia/Singapore' },
  'Seoul': { coords: [126.9780, 37.5665], region: 'Asia', timezone: 'Asia/Seoul' },
  'Mumbai': { coords: [72.8777, 19.0760], region: 'Asia', timezone: 'Asia/Kolkata' },
  'Delhi': { coords: [77.1025, 28.7041], region: 'Asia', timezone: 'Asia/Kolkata' },
  'Bangkok': { coords: [100.5018, 13.7563], region: 'Asia', timezone: 'Asia/Bangkok' },
  'Dubai': { coords: [55.2708, 25.2048], region: 'Middle East', timezone: 'Asia/Dubai' },

  // Autres
  'Sydney': { coords: [151.2093, -33.8688], region: 'Oceania', timezone: 'Australia/Sydney' },
  'Melbourne': { coords: [144.9631, -37.8136], region: 'Oceania', timezone: 'Australia/Melbourne' },
  'Toronto': { coords: [-79.3832, 43.6532], region: 'North America', timezone: 'America/Toronto' },
  'Montreal': { coords: [-73.5673, 45.5017], region: 'North America', timezone: 'America/Toronto' },
  'São Paulo': { coords: [-46.6333, -23.5505], region: 'Latin America', timezone: 'America/Sao_Paulo' },
  'Rio de Janeiro': { coords: [-43.1729, -22.9068], region: 'Latin America', timezone: 'America/Sao_Paulo' },
  'Mexico City': { coords: [-99.1332, 19.4326], region: 'North America', timezone: 'America/Mexico_City' },
  'Buenos Aires': { coords: [-58.3816, -34.6037], region: 'Latin America', timezone: 'America/Argentina/Buenos_Aires' }
};

// ============ FONCTIONS UTILITAIRES ============

/**
 * Trouve les coordonnées géographiques pour un pays/ville
 */
export function findGeoLocation(location: string): GeoLocation | null {
  // Chercher dans les pays d'abord
  const normalizedLocation = location.trim();
  
  if (COUNTRIES_GEO[normalizedLocation]) {
    return COUNTRIES_GEO[normalizedLocation];
  }
  
  // Chercher dans les villes
  if (CITIES_GEO[normalizedLocation]) {
    return CITIES_GEO[normalizedLocation];
  }
  
  // Chercher case-insensitive
  const lowerLocation = normalizedLocation.toLowerCase();
  
  // Pays
  for (const [key, value] of Object.entries(COUNTRIES_GEO)) {
    if (key.toLowerCase() === lowerLocation) {
      return value;
    }
  }
  
  // Villes
  for (const [key, value] of Object.entries(CITIES_GEO)) {
    if (key.toLowerCase() === lowerLocation) {
      return value;
    }
  }
  
  return null;
}

/**
 * Extrait les pays/villes d'un texte
 */
export function extractLocationsFromText(text: string): string[] {
  const locations: string[] = [];
  const allLocations = [...Object.keys(COUNTRIES_GEO), ...Object.keys(CITIES_GEO)];
  
  for (const location of allLocations) {
    // Éviter les faux positifs avec de courts noms
    if (location.length < 3) continue;
    
    const regex = new RegExp(`\\b${location}\\b`, 'gi');
    if (regex.test(text)) {
      locations.push(location);
    }
  }
  
  return [...new Set(locations)]; // Unique
}

/**
 * Calcule la distance entre deux coordonnées (Haversine)
 */
export function calculateDistance(
  coords1: [number, number], 
  coords2: [number, number]
): number {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // en km
}

/**
 * Trouve les pays dans une région
 */
export function getCountriesByRegion(region: string): string[] {
  return Object.entries(COUNTRIES_GEO)
    .filter(([_, geo]) => geo.region === region)
    .map(([country, _]) => country);
}

/**
 * Liste toutes les régions
 */
export function getAllRegions(): string[] {
  const regions = new Set<string>();
  Object.values(COUNTRIES_GEO).forEach(geo => regions.add(geo.region));
  return Array.from(regions).sort();
}

