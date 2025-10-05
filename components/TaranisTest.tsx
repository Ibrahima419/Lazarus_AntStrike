import React, { useCallback, useEffect, useState } from "react";
import { useTaranisConnection } from "../src/services/taranis/taranis-hooks";

type EndpointResult = {
  path: string;
  status: number | null;
  ok: boolean | null;
  body: string | null;
  error: string | null;
};

export function TaranisTest() {
  const { isConnected, isAuthenticated, checkConnection, login, logout } = useTaranisConnection();
  const [rawAlive, setRawAlive] = useState<string>('');
  const [rawError, setRawError] = useState<string>('');
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  const [results, setResults] = useState<EndpointResult[]>([]);
  const [checking, setChecking] = useState(false);
  const [sseStatus, setSseStatus] = useState<string>('idle');

  const API_BASE = (import.meta.env.VITE_TARANIS_API_URL as string) ?? '/api'
  const base = String(API_BASE).replace(/\/$/, ''); // remove trailing slash

  // 🔧 CORRECTION 1: Fonction pour obtenir le token actuel
  const getCurrentToken = () => {
    return localStorage.getItem('taranis_token') || currentToken;
  };

  // 🔧 CORRECTION 2: Fonction pour créer les headers d'authentification
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    const token = getCurrentToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Endpoints Taranis AI complets organisés par catégorie
  const taranisEndpoints = {
    // 🔐 AUTHENTIFICATION
    auth: [
      { name: 'auth-login', url: '/auth/login', method: 'POST', description: 'Connexion utilisateur' },
      { name: 'auth-refresh', url: '/auth/refresh', method: 'GET', description: 'Rafraîchir le token' },
      { name: 'auth-logout', url: '/auth/logout', method: 'DELETE', description: 'Déconnexion' },
      { name: 'auth-method', url: '/auth/method', method: 'GET', description: 'Méthode d\'authentification' }
    ],
    
    // 🏥 SANTÉ
    health: [
      { name: 'isalive', url: '/isalive', method: 'GET', description: 'Vérification de santé' },
      { name: 'root', url: '/', method: 'GET', description: 'Vérification de santé (root)' }
    ],
    
    // 📊 TABLEAU DE BORD
    dashboard: [
      { name: 'dashboard', url: '/dashboard', method: 'GET', description: 'Données du tableau de bord' },
      { name: 'trending-clusters', url: '/dashboard/trending-clusters', method: 'GET', description: 'Clusters tendances' },
      { name: 'story-clusters', url: '/dashboard/story-clusters', method: 'GET', description: 'Clusters d\'histoires' },
      { name: 'build-info', url: '/dashboard/build-info', method: 'GET', description: 'Informations de build' }
    ],
    
    // 📰 ACTUALITÉS & HISTOIRES
    assess: [
      { name: 'stories', url: '/assess/stories', method: 'GET', description: 'Liste des histoires' },
      { name: 'news-items', url: '/assess/news-items', method: 'GET', description: 'Liste des actualités' },
      { name: 'tags', url: '/assess/tags', method: 'GET', description: 'Liste des tags' },
      { name: 'taglist', url: '/assess/taglist', method: 'GET', description: 'Liste des tags (format liste)' },
      { name: 'osint-sources', url: '/assess/osint-sources-list', method: 'GET', description: 'Sources OSINT' },
      { name: 'osint-groups', url: '/assess/osint-source-group-list', method: 'GET', description: 'Groupes de sources' }
    ],
    
    // 📋 RAPPORTS
    analyze: [
      { name: 'report-types', url: '/analyze/report-types', method: 'GET', description: 'Types de rapports' },
      { name: 'report-items', url: '/analyze/report-items', method: 'GET', description: 'Liste des rapports' }
    ],
    
    // 👤 UTILISATEURS
    users: [
      { name: 'users-info', url: '/users/', method: 'GET', description: 'Informations utilisateur' },
      { name: 'users-profile', url: '/users/profile', method: 'GET', description: 'Profil utilisateur' },
      { name: 'sse-connected', url: '/users/sse-connected', method: 'POST', description: 'Connexion SSE' }
    ],
    
    // ⚙️ CONFIGURATION
    config: [
      { name: 'acls', url: '/config/acls', method: 'GET', description: 'Listes de contrôle d\'accès' },
      { name: 'attributes', url: '/config/attributes', method: 'GET', description: 'Attributs' },
      { name: 'bots', url: '/config/bots', method: 'GET', description: 'Bots' },
      { name: 'organizations', url: '/config/organizations', method: 'GET', description: 'Organisations' },
      { name: 'osint-sources', url: '/config/osint-sources', method: 'GET', description: 'Sources OSINT' },
      { name: 'product-types', url: '/config/product-types', method: 'GET', description: 'Types de produits' },
      { name: 'publishers', url: '/config/publishers', method: 'GET', description: 'Éditeurs' },
      { name: 'templates', url: '/config/templates', method: 'GET', description: 'Modèles' },
      { name: 'parameters', url: '/config/parameters', method: 'GET', description: 'Paramètres' },
      { name: 'permissions', url: '/config/permissions', method: 'GET', description: 'Permissions' }
    ],
    
    // 🔧 WORKER (nécessitent une API KEY "supersecret", pas un token JWT)
    worker: [
      { name: 'worker-tags', url: '/worker/tags', method: 'GET', description: 'Tags worker (API KEY)' },
      { name: 'worker-stories', url: '/worker/stories', method: 'GET', description: 'Histoires worker (API KEY)' }
    ],
    
    // 🔗 CONNECTEURS
    connectors: [
      { name: 'conflicts-stories', url: '/connectors/conflicts/stories', method: 'GET', description: 'Conflits d\'histoires' },
      { name: 'conflicts-news', url: '/connectors/conflicts/news-items', method: 'GET', description: 'Conflits d\'actualités' }
    ],
    
    // 📤 PUBLICATION
    publish: [
      { name: 'products', url: '/publish/products', method: 'GET', description: 'Liste des produits' },
      { name: 'product-types', url: '/publish/product-types', method: 'GET', description: 'Types de produits' }
    ]
  };

  const buildUrl = (path: string) => `${base}${path.startsWith('/') ? path : '/' + path}`;

  // 🔧 CORRECTION 3: Fonction de connexion améliorée
  const handleTestLogin = async (): Promise<string | null> => {
    try {
      const url = buildUrl('/auth/login');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username: 'admin', password: 'admin' })
      });
      
      const text = await res.text();
      
      // Mettre à jour les résultats
      const result: EndpointResult = {
        path: 'auth/login',
        status: res.status,
        ok: res.ok,
        body: text,
        error: null
      };
      
      setResults(prev => {
        const others = prev.filter(r => !r.path.includes('auth/login'));
        return [...others, result];
      });
      
      // Si succès, extraire et stocker le token
      if (res.ok && text) {
        try {
          const json = JSON.parse(text);
          const token = json?.access_token || json?.token;
          if (token) {
            localStorage.setItem('taranis_token', token);
            setCurrentToken(token);
            console.log('✅ Token obtenu et stocké:', token.substring(0, 50) + '...');
            return token;
          }
        } catch (e) {
          console.error('Erreur parsing JSON login:', e instanceof Error ? e.message : String(e));
        }
      }
    } catch (e: unknown) {
      console.error('Erreur login:', e instanceof Error ? e.message : String(e));
      setResults(prev => [...prev, {
        path: 'auth/login',
        status: null,
        ok: null,
        body: null,
        error: String((e as any)?.message || e)
      }]);
    }
    return null;
  };

  // 🔧 CORRECTION 4: Fonction pour tester un endpoint avec authentification
  const testEndpointWithAuth = async (category: string, endpoint: { path: string; method?: string; url?: string; name?: string }): Promise<EndpointResult> => {
    try {
      const url = buildUrl(endpoint.url || endpoint.path);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // 🔑 GESTION DIFFÉRENCIÉE DES AUTHENTIFICATIONS
      if ((endpoint.url || endpoint.path).startsWith('/worker/')) {
        // Les endpoints worker nécessitent une API KEY
        headers['Authorization'] = 'Bearer supersecret'; // API KEY par défaut de Taranis
        console.log(`🔑 Utilisation de l'API KEY pour ${endpoint.name || endpoint.path}`);
      } else {
        // Les autres endpoints nécessitent un token JWT
        const token = getCurrentToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log(`🎫 Utilisation du token JWT pour ${endpoint.name || endpoint.path}`);
        }
      }
      
      // Corps de la requête pour POST
      let body = undefined;
      if (endpoint.method === 'POST' && (endpoint.name === 'auth-login' || endpoint.path === '/auth/login')) {
        body = JSON.stringify({ username: 'admin', password: 'admin' });
      }
      
      const res = await fetch(url, {
        method: endpoint.method,
        headers,
        credentials: 'include',
        body
      });
      
      const text = await res.text().catch(() => null);
      
      // Si c'est un login réussi, stocker le token
      if ((endpoint.name === 'auth-login' || endpoint.path === '/auth/login') && res.ok && text) {
        try {
          const json = JSON.parse(text);
          const token = json?.access_token || json?.token;
          if (token) {
            localStorage.setItem('taranis_token', token);
            setCurrentToken(token);
            console.log('✅ Token JWT obtenu et stocké:', token.substring(0, 50) + '...');
          }
        } catch {}
      }
      
      return {
        path: `${category}/${endpoint.name || endpoint.path}`,
        status: res.status,
        ok: res.ok,
        body: text,
        error: null
      };
    } catch (e: unknown) {
      return {
        path: `${category}/${endpoint.name || endpoint.path}`,
        status: null,
        ok: null,
        body: null,
        error: String((e as any)?.message || e)
      };
    }
  };

  // 🔧 CORRECTION 5: Séquence de test sécurisée
  const testEssentialEndpointsFixed = async () => {
    setChecking(true);
    setResults([]);
    
    const out: EndpointResult[] = [];
    
    // 1. Test de santé (pas d'auth requise)
    console.log('🏥 Test de santé...');
    const healthResult = await testEndpointWithAuth('health', { path: '/isalive', method: 'GET', name: 'isalive', url: '/isalive' });
    out.push(healthResult);
    setResults([...out]);
    
    // 2. Login et obtention du token
    console.log('🔐 Test de connexion...');
    const token = await handleTestLogin();
    
    if (token) {
      console.log('✅ Token obtenu, test des endpoints protégés...');
      
      // 3. Test des endpoints protégés AVEC le token
      const protectedEndpoints = [
        { category: 'dashboard', name: 'dashboard', url: '/dashboard', method: 'GET' },
        { category: 'assess', name: 'news-items', url: '/assess/news-items', method: 'GET' },
        { category: 'assess', name: 'stories', url: '/assess/stories', method: 'GET' },
        { category: 'analyze', name: 'report-items', url: '/analyze/report-items', method: 'GET' },
        { category: 'users', name: 'users-profile', url: '/users/profile', method: 'GET' }
      ];
      
      for (const endpoint of protectedEndpoints) {
        console.log(`🔍 Test de ${endpoint.category}/${endpoint.name}...`);
        const mappedEndpoint = {
          path: endpoint.url || '',
          method: endpoint.method,
          url: endpoint.url,
          name: endpoint.name
        };
        const result = await testEndpointWithAuth(endpoint.category, mappedEndpoint);
        out.push(result);
        setResults([...out]);
        
        // Petite pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 4. Test de refresh du token (optionnel)
      console.log('🔄 Test de refresh token...');
      const refreshResult = await testEndpointWithAuth('auth', { path: '/auth/refresh', method: 'GET', name: 'auth-refresh', url: '/auth/refresh' });
      out.push(refreshResult);
      setResults([...out]);
      
    } else {
      console.error('❌ Impossible d\'obtenir le token, arrêt des tests');
    }
    
    setChecking(false);
  };

  // 🔧 CORRECTION 6: Test d'une catégorie avec gestion du token
  const testCategoryEndpoints = async (category: string) => {
    setChecking(true);
    setResults([]);
    
    const endpoints = taranisEndpoints[category as keyof typeof taranisEndpoints] || [];
    const out: EndpointResult[] = [];
    
    // Si pas de token et que la catégorie n'est pas 'auth' ou 'health', faire un login d'abord
    const needsAuth = !['auth', 'health'].includes(category);
    if (needsAuth && !getCurrentToken()) {
      console.log('🔐 Aucun token trouvé, connexion automatique...');
      await handleTestLogin();
    }
    
    for (const endpoint of endpoints) {
      console.log(`🔍 Test de ${category}/${endpoint.name}...`);
      const mappedEndpoint = {
        path: endpoint.url || '',
        method: endpoint.method,
        url: endpoint.url,
        name: endpoint.name
      };
      const result = await testEndpointWithAuth(category, mappedEndpoint);
      out.push(result);
      setResults([...out]);
      
      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setChecking(false);
  };

  // 🔧 CORRECTION 7: Test complet avec gestion du token
  const testAllTaranisEndpoints = async () => {
    setChecking(true);
    setResults([]);
    
    // 1. D'abord se connecter
    console.log('🔐 Connexion initiale...');
    const token = await handleTestLogin();
    
    if (!token) {
      console.error('❌ Impossible de se connecter');
      setChecking(false);
      return;
    }
    
    const allEndpoints: Array<{category: string, endpoint: { path: string; method?: string; url?: string; name?: string }}> = [];
    
    // Collecter tous les endpoints (sauf auth pour éviter les déconnexions)
    Object.entries(taranisEndpoints).forEach(([category, endpoints]) => {
      endpoints.forEach(endpoint => {
        // Éviter les endpoints qui peuvent casser la session
        if (endpoint.name !== 'auth-logout') {
          const mappedEndpoint = {
            path: endpoint.url || '',
            method: endpoint.method,
            url: endpoint.url,
            name: endpoint.name
          };
          allEndpoints.push({ category, endpoint: mappedEndpoint });
        }
      });
    });
    
    const out: EndpointResult[] = [];
    
    for (const { category, endpoint } of allEndpoints) {
      console.log(`🔍 Test de ${category}/${endpoint.name}...`);
      const result = await testEndpointWithAuth(category, endpoint);
      out.push(result);
      setResults([...out]);
      
      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    setChecking(false);
  };

  // 🔧 CORRECTION 8: Fonction de logout sécurisée
  const handleTestLogout = async () => {
    const result = await testEndpointWithAuth('auth', { path: '/auth/logout', method: 'DELETE', name: 'auth-logout', url: '/auth/logout' });
    
    // Nettoyer le token local
    localStorage.removeItem('taranis_token');
    setCurrentToken(null);
    
    setResults(prev => {
      const others = prev.filter(r => !r.path.includes('auth/logout'));
      return [...others, result];
    });
  };

  const testRawAlive = async () => {
    setRawAlive('');
    setRawError('');
    try {
      const url = buildUrl('/isalive');
      const res = await fetch(url, { credentials: 'include' });
      const txt = await res.text();
      setRawAlive(`status=${res.status} body=${txt}`);
    } catch (e: unknown) {
      setRawError(String((e as any)?.message || e));
    }
  };

  const testSSE = () => {
    setSseStatus('connecting');
    try {
      const sseUrl = buildUrl('/sse');
      const evt = new EventSource(sseUrl, { withCredentials: true });
      evt.onopen = () => setSseStatus('open');
      evt.onmessage = (e) => {
        setSseStatus(`message: ${e.data.substring(0, 200)}`);
      };
      evt.onerror = () => {
        setSseStatus('error/closed');
        evt.close();
      };
      // auto-close after 10s for test
      setTimeout(() => {
        evt.close();
        setSseStatus('closed');
      }, 10000);
    } catch (e: unknown) {
      setSseStatus(`error: ${String((e as any)?.message || e)}`);
    }
  };

  // Fonctions de test spécifiques améliorées
  const testSpecificEndpoint = async (name: string, url: string, method: string = 'GET') => {
    try {
      const fullUrl = buildUrl(url);
      const headers = getAuthHeaders();
      
      const res = await fetch(fullUrl, { 
        method,
        headers,
        credentials: 'include'
      });
      
      const text = await res.text().catch(() => null);
      
      const result: EndpointResult = {
        path: name,
        status: res.status,
        ok: res.ok,
        body: text,
        error: null
      };
      
      setResults(prev => {
        const others = prev.filter(r => r.path !== name);
        return [...others, result];
      });
      
      return result;
    } catch (e: unknown) {
      const result: EndpointResult = {
        path: name,
        status: null,
        ok: null,
        body: null,
        error: String((e as any)?.message || e)
      };
      
      setResults(prev => {
        const others = prev.filter(r => r.path !== name);
        return [...others, result];
      });
      
      return result;
    }
  };

  // 🔧 CORRECTION 9: Vérifier le token au démarrage
  useEffect(() => {
    const token = localStorage.getItem('taranis_token');
    if (token) {
      setCurrentToken(token);
      console.log('Token trouvé dans localStorage:', token.substring(0, 50) + '...');
    }
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <h1 className="text-xl font-bold">🧪 Test d'intégration Taranis AI (CORRIGÉ)</h1>

        <div className="p-4 border rounded">
          <div className="flex items-center justify-between">
            <div>
              <div><strong>API base:</strong> {base}</div>
              <div><strong>Health state:</strong> {isConnected === null ? 'checking...' : isConnected ? 'alive' : 'dead'}</div>
              <div><strong>Token:</strong> {getCurrentToken() ? '✅ Présent' : '❌ Absent'}</div>
            </div>
            <div className="space-x-2">
              <button onClick={checkConnection} className="px-3 py-1 bg-blue-500 text-white rounded">Vérifier Health</button>
              <button onClick={testRawAlive} className="px-3 py-1 bg-gray-700 text-white rounded">Raw /isalive</button>
            </div>
          </div>
          {rawAlive && <pre className="mt-2 p-2 bg-gray-100 text-sm">{rawAlive}</pre>}
          {rawError && <div className="mt-2 text-red-600">{rawError}</div>}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">🔧 Tests corrigés</h2>
          <div className="space-y-4">
            {/* Tests essentiels corrigés */}
            <div className="flex gap-2 mb-3 flex-wrap">
              <button onClick={testEssentialEndpointsFixed} disabled={checking} className="px-3 py-1 bg-green-600 text-white rounded">
                {checking ? 'Testing...' : '🚀 Tests essentiels (CORRIGÉS)'}
              </button>
              <button onClick={handleTestLogin} className="px-3 py-1 bg-indigo-600 text-white rounded" disabled={checking}>
                🔐 Login uniquement
              </button>
              <button onClick={handleTestLogout} className="px-3 py-1 bg-red-600 text-white rounded" disabled={!getCurrentToken()}>
                🚪 Logout sécurisé
              </button>
              <button onClick={testSSE} className="px-3 py-1 bg-purple-600 text-white rounded">
                📡 Test SSE (10s)
              </button>
            </div>

            {/* Tests par catégorie */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Tests par catégorie (avec gestion du token) :</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(taranisEndpoints).map(([category, endpoints]) => (
                  <button
                    key={category}
                    onClick={() => testCategoryEndpoints(category)}
                    disabled={checking}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                    title={`${endpoints.length} endpoints`}
                  >
                    {category} ({endpoints.length})
                  </button>
                ))}
              </div>
            </div>

            {/* Test complet sécurisé */}
            <div className="border-t pt-3">
              <button 
                onClick={testAllTaranisEndpoints} 
                disabled={checking} 
                className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                title="Teste tous les endpoints avec gestion sécurisée du token"
              >
                {checking ? 'Testing...' : '🛡️ Test COMPLET sécurisé'}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                ✅ Connexion automatique + {Object.values(taranisEndpoints).flat().length} endpoints (sans logout automatique)
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-auto">
            {results.map((r, i) => (
              <div key={`${r.path}-${i}`} className="p-2 border rounded">
                <div className="flex justify-between">
                  <div><strong>{r.path}</strong></div>
                  <div>
                    {r.error ? <span className="text-red-600">ERR</span> : r.ok ? <span className="text-green-600">OK {r.status}</span> : <span className="text-yellow-600">? {String(r.status)}</span>}
                  </div>
                </div>
                {r.body && <pre className="text-xs mt-1 max-h-28 overflow-auto bg-gray-50 p-2">{r.body.substring(0, 1000)}</pre>}
                {r.error && <div className="text-xs text-red-600 mt-1">{r.error}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">SSE status</h2>
          <div className="text-sm">{sseStatus}</div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Auth state</h2>
          <div className="text-sm">isAuthenticated: {String(isAuthenticated)}</div>
          <div className="text-sm">localStorage token: {getCurrentToken() ? 'présent' : 'absent'}</div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Tests spécifiques sécurisés</h2>
          <div className="flex gap-2 mb-3 flex-wrap">
            <button 
              onClick={() => testSpecificEndpoint('fetchNewsItems', '/assess/news-items')} 
              className="px-3 py-1 bg-cyan-600 text-white rounded"
            >
              📰 News Items
            </button>
            <button 
              onClick={() => testSpecificEndpoint('fetchReportItems', '/analyze/report-items')} 
              className="px-3 py-1 bg-cyan-600 text-white rounded"
            >
              📋 Report Items
            </button>
            <button 
              onClick={() => testSpecificEndpoint('fetchStories', '/assess/stories')}
              className="px-3 py-1 bg-purple-500 text-white rounded"
            >
              📖 Stories
            </button>
            <button 
              onClick={() => testSpecificEndpoint('fetchDashboard', '/dashboard')}
              className="px-3 py-1 bg-orange-500 text-white rounded"
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => testSpecificEndpoint('fetchProfile', '/users/profile')}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              👤 Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}