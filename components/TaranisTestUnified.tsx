/**
 * 🧪 Composant de test complet pour Taranis Unified Service
 * Teste TOUS les endpoints implémentés via le service unifié
 */

import React, { useState, useEffect } from "react";
import { getTaranisService } from "../src/services/taranis/taranis-unified-service";

type TestResult = {
  category: string;
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
  duration?: number;
};

export function TaranisTestUnified() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  const service = getTaranisService();

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    setIsAuthenticated(service.isAuthenticated());
  }, []);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const toggleExpand = (key: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // ============ TESTS PAR CATÉGORIE ============

  const testAuthentication = async () => {
    const tests = [
      {
        name: 'Test Connection',
        fn: () => service.testConnection()
      },
      {
        name: 'Login',
        fn: () => service.login('admin', 'admin')
      },
      {
        name: 'Get Auth Method',
        fn: () => service.getAuthMethod()
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Auth',
          endpoint: test.name,
          status: 'success',
          message: 'OK',
          data: result,
          duration: Date.now() - start
        });
        if (test.name === 'Login') {
          setIsAuthenticated(true);
        }
      } catch (error: any) {
        addResult({
          category: 'Auth',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  const testDashboard = async () => {
    const tests = [
      {
        name: 'Get Dashboard',
        fn: () => service.getDashboard()
      },
      {
        name: 'Get Trending Clusters',
        fn: () => service.getTrendingClusters(7)
      },
      {
        name: 'Get Story Clusters',
        fn: () => service.getStoryClusters(7, 12)
      },
      {
        name: 'Get Build Info',
        fn: () => service.getBuildInfo()
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Dashboard',
          endpoint: test.name,
          status: 'success',
          message: 'OK',
          data: result,
          duration: Date.now() - start
        });
      } catch (error: any) {
        addResult({
          category: 'Dashboard',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  const testAssess = async () => {
    const tests = [
      {
        name: 'Get Stories',
        fn: () => service.getStories()
      },
      {
        name: 'Get News Items',
        fn: () => service.getNewsItems()
      },
      {
        name: 'Get OSINT Sources',
        fn: () => service.getOSINTSources()
      },
      {
        name: 'Get OSINT Source Groups',
        fn: () => service.getOSINTSourceGroups()
      },
      {
        name: 'Get Tags',
        fn: () => service.getTags({ limit: 10 })
      },
      {
        name: 'Get Tag List',
        fn: () => service.getTagList({ limit: 10 })
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Assess',
          endpoint: test.name,
          status: 'success',
          message: `OK - ${Array.isArray(result) ? result.length : 'N/A'} items`,
          data: result,
          duration: Date.now() - start
        });
      } catch (error: any) {
        addResult({
          category: 'Assess',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  const testAnalyze = async () => {
    const tests = [
      {
        name: 'Get Report Items',
        fn: () => service.getReportItems()
      },
      {
        name: 'Get Report Types',
        fn: () => service.getReportTypes()
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Analyze',
          endpoint: test.name,
          status: 'success',
          message: 'OK',
          data: result,
          duration: Date.now() - start
        });
      } catch (error: any) {
        addResult({
          category: 'Analyze',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  const testPublish = async () => {
    const tests = [
      {
        name: 'List Products',
        fn: () => service.listProducts()
      },
      {
        name: 'Get Product Types',
        fn: () => service.getProductTypes()
      },
      {
        name: 'Get Publish Products',
        fn: () => service.getPublishProducts()
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Publish',
          endpoint: test.name,
          status: 'success',
          message: 'OK',
          data: result,
          duration: Date.now() - start
        });
      } catch (error: any) {
        addResult({
          category: 'Publish',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  const testConfigUsers = async () => {
    const tests = [
      {
        name: 'Get Users',
        fn: () => service.getUsers()
      },
      {
        name: 'Get Roles',
        fn: () => service.getRoles()
      },
      {
        name: 'Get Permissions',
        fn: () => service.getPermissions()
      },
      {
        name: 'Get Organizations',
        fn: () => service.getOrganizations()
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Config Users',
          endpoint: test.name,
          status: 'success',
          message: `OK - ${result.items?.length || 0} items`,
          data: result,
          duration: Date.now() - start
        });
      } catch (error: any) {
        addResult({
          category: 'Config Users',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  const testConfigOther = async () => {
    const tests = [
      {
        name: 'Get Attributes',
        fn: () => service.getAttributes()
      },
      {
        name: 'Get Report Item Types',
        fn: () => service.getReportItemTypes()
      },
      {
        name: 'Get Config Product Types',
        fn: () => service.getConfigProductTypes()
      },
      {
        name: 'Get Connectors',
        fn: () => service.getConnectors()
      },
      {
        name: 'Get Publishers',
        fn: () => service.getPublishers()
      },
      {
        name: 'Get Config Presenters',
        fn: () => service.getConfigPresenters()
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Config Other',
          endpoint: test.name,
          status: 'success',
          message: `OK - ${result.items?.length || result.total_count || 0} items`,
          data: result,
          duration: Date.now() - start
        });
      } catch (error: any) {
        addResult({
          category: 'Config Other',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  const testConfigWorkers = async () => {
    const tests = [
      {
        name: 'Get Workers',
        fn: () => service.getWorkers()
      },
      {
        name: 'Get Worker Types',
        fn: () => service.getWorkerTypes()
      },
      {
        name: 'Get Schedule',
        fn: () => service.getSchedule()
      },
      {
        name: 'Get Queue Status',
        fn: () => service.getQueueStatus()
      },
      {
        name: 'Get Task Results',
        fn: () => service.getTaskResults()
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Config Workers',
          endpoint: test.name,
          status: 'success',
          message: 'OK',
          data: result,
          duration: Date.now() - start
        });
      } catch (error: any) {
        addResult({
          category: 'Config Workers',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  const testAssets = async () => {
    const tests = [
      {
        name: 'Get Asset Groups',
        fn: () => service.getAssetGroups()
      },
      {
        name: 'Get Assets',
        fn: () => service.getAssets()
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Assets',
          endpoint: test.name,
          status: 'success',
          message: `OK - ${result.items?.length || Array.isArray(result) ? result.length : 0} items`,
          data: result,
          duration: Date.now() - start
        });
      } catch (error: any) {
        addResult({
          category: 'Assets',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  const testAdmin = async () => {
    const tests = [
      {
        name: 'Get System Settings',
        fn: () => service.getSystemSettings()
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Admin',
          endpoint: test.name,
          status: 'success',
          message: 'OK',
          data: result,
          duration: Date.now() - start
        });
      } catch (error: any) {
        addResult({
          category: 'Admin',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  const testBots = async () => {
    const tests = [
      {
        name: 'Get Bots',
        fn: () => service.getBots()
      },
      {
        name: 'Get Bots List (API)',
        fn: () => service.getBotsList()
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Bots',
          endpoint: test.name,
          status: 'success',
          message: `OK - ${Array.isArray(result) ? result.length : 'N/A'} items`,
          data: result,
          duration: Date.now() - start
        });
      } catch (error: any) {
        addResult({
          category: 'Bots',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  const testConflicts = async () => {
    const tests = [
      {
        name: 'Get Story Conflicts',
        fn: () => service.getStoryConflicts()
      },
      {
        name: 'Get News Item Conflicts',
        fn: () => service.getNewsItemConflicts()
      }
    ];

    for (const test of tests) {
      const start = Date.now();
      try {
        const result = await test.fn();
        addResult({
          category: 'Conflicts',
          endpoint: test.name,
          status: 'success',
          message: `OK - ${result.conflicts?.length || 0} conflicts`,
          data: result,
          duration: Date.now() - start
        });
      } catch (error: any) {
        addResult({
          category: 'Conflicts',
          endpoint: test.name,
          status: 'error',
          message: error.message || String(error),
          duration: Date.now() - start
        });
      }
    }
  };

  // ============ TEST COMPLET ============

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    setProgress({ current: 0, total: 11 });

    const testSuites = [
      { name: 'Authentication', fn: testAuthentication },
      { name: 'Dashboard', fn: testDashboard },
      { name: 'Assess', fn: testAssess },
      { name: 'Analyze', fn: testAnalyze },
      { name: 'Publish', fn: testPublish },
      { name: 'Config Users', fn: testConfigUsers },
      { name: 'Config Other', fn: testConfigOther },
      { name: 'Config Workers', fn: testConfigWorkers },
      { name: 'Assets', fn: testAssets },
      { name: 'Bots', fn: testBots },
      { name: 'Conflicts', fn: testConflicts },
      { name: 'Admin', fn: testAdmin }
    ];

    for (let i = 0; i < testSuites.length; i++) {
      try {
        await testSuites[i].fn();
      } catch (error) {
        console.error(`Suite ${testSuites[i].name} failed:`, error);
      }
      setProgress({ current: i + 1, total: testSuites.length });
      await new Promise(resolve => setTimeout(resolve, 200)); // Pause entre les suites
    }

    setTesting(false);
  };

  // ============ STATS ============

  const stats = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    error: results.filter(r => r.status === 'error').length,
    avgDuration: results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length)
      : 0
  };

  // Grouper les résultats par catégorie
  const resultsByCategory = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            🧪 Test Taranis Unified Service
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Teste tous les endpoints via <code className="bg-gray-100 px-2 py-1 rounded">taranis-unified-service.ts</code>
          </p>
        </div>

        {/* Status & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm font-semibold text-blue-900 mb-2">État de l'authentification</div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{isAuthenticated ? 'Authentifié' : 'Non authentifié'}</span>
            </div>
            {!isAuthenticated && (
              <button
                onClick={async () => {
                  try {
                    await service.login('admin', 'admin');
                    setIsAuthenticated(true);
                  } catch (error: any) {
                    alert('Erreur de connexion : ' + error.message);
                  }
                }}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                🔐 Se connecter
              </button>
            )}
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm font-semibold text-green-900 mb-2">Actions de test</div>
            <button
              onClick={runAllTests}
              disabled={testing || !isAuthenticated}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
            >
              {testing ? `⏳ Tests en cours... (${progress.current}/${progress.total})` : '🚀 Lancer tous les tests'}
            </button>
            {!isAuthenticated && (
              <p className="text-xs text-red-600 mt-2">⚠️ Authentification requise</p>
            )}
          </div>
        </div>

        {/* Tests individuels */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Tests par catégorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <button onClick={testAuthentication} disabled={testing} className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 text-sm">
              🔐 Auth
            </button>
            <button onClick={testDashboard} disabled={testing || !isAuthenticated} className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm">
              📊 Dashboard
            </button>
            <button onClick={testAssess} disabled={testing || !isAuthenticated} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm">
              📰 Assess
            </button>
            <button onClick={testAnalyze} disabled={testing || !isAuthenticated} className="px-3 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 text-sm">
              📋 Analyze
            </button>
            <button onClick={testPublish} disabled={testing || !isAuthenticated} className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 text-sm">
              📤 Publish
            </button>
            <button onClick={testConfigUsers} disabled={testing || !isAuthenticated} className="px-3 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50 text-sm">
              👥 Users
            </button>
            <button onClick={testConfigOther} disabled={testing || !isAuthenticated} className="px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50 text-sm">
              ⚙️ Config
            </button>
            <button onClick={testConfigWorkers} disabled={testing || !isAuthenticated} className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50 text-sm">
              🔧 Workers
            </button>
            <button onClick={testAssets} disabled={testing || !isAuthenticated} className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm">
              💼 Assets
            </button>
            <button onClick={testBots} disabled={testing || !isAuthenticated} className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 text-sm">
              🤖 Bots
            </button>
            <button onClick={testConflicts} disabled={testing || !isAuthenticated} className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm">
              ⚠️ Conflicts
            </button>
            <button onClick={testAdmin} disabled={testing || !isAuthenticated} className="px-3 py-2 bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50 text-sm">
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {results.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total tests</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">{stats.success}</div>
              <div className="text-xs text-gray-600">Succès</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-700">{stats.error}</div>
              <div className="text-xs text-gray-600">Erreurs</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.avgDuration}ms</div>
              <div className="text-xs text-gray-600">Durée moy.</div>
            </div>
          </div>
        )}

        {/* Résultats groupés par catégorie */}
        {Object.keys(resultsByCategory).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">📋 Résultats des tests</h2>
            {Object.entries(resultsByCategory).map(([category, categoryResults]) => {
              const categoryStats = {
                success: categoryResults.filter(r => r.status === 'success').length,
                error: categoryResults.filter(r => r.status === 'error').length
              };
              
              return (
                <div key={category} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {category}
                      <span className="ml-2 text-sm text-gray-600">
                        ({categoryResults.length} tests)
                      </span>
                    </h3>
                    <div className="flex gap-2 text-sm">
                      <span className="text-green-600">✓ {categoryStats.success}</span>
                      <span className="text-red-600">✗ {categoryStats.error}</span>
                    </div>
                  </div>
                  <div className="divide-y">
                    {categoryResults.map((result, idx) => {
                      const key = `${result.category}-${result.endpoint}-${idx}`;
                      const isExpanded = expandedResults.has(key);
                      
                      return (
                        <div key={key} className="p-3 hover:bg-gray-50">
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleExpand(key)}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-2 h-2 rounded-full ${
                                result.status === 'success' ? 'bg-green-500' :
                                result.status === 'error' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`}></div>
                              <span className="font-medium text-sm">{result.endpoint}</span>
                              <span className="text-xs text-gray-500">{result.duration}ms</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                result.status === 'success' ? 'bg-green-100 text-green-700' :
                                result.status === 'error' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {result.message}
                              </span>
                              <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                            </div>
                          </div>
                          
                          {isExpanded && result.data && (
                            <pre className="mt-2 p-2 bg-gray-900 text-green-400 text-xs rounded overflow-auto max-h-60">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Message si aucun résultat */}
        {results.length === 0 && !testing && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🎯</div>
            <p>Cliquez sur "Lancer tous les tests" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}

