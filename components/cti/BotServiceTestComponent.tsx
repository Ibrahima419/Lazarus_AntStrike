/**
 * Composant React pour tester l'intégration du BotService avec l'API Taranis
 */

import React, { useState } from 'react';
import { runBotServiceTests } from './services/bot-service-test';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

export const BotServiceTestComponent: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Intercepter les logs de console
  const originalLog = console.log;
  const originalError = console.error;

  const startTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setLogs([]);

    // Intercepter les logs
    const logMessages: string[] = [];
    
    console.log = (...args) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      logMessages.push(`[LOG] ${message}`);
      setLogs([...logMessages]);
      originalLog(...args);
    };

    console.error = (...args) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      logMessages.push(`[ERROR] ${message}`);
      setLogs([...logMessages]);
      originalError(...args);
    };

    try {
      await runBotServiceTests();
    } catch (error) {
      console.error('Erreur lors de l\'exécution des tests:', error);
    } finally {
      // Restaurer les logs originaux
      console.log = originalLog;
      console.error = originalError;
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Tests d'Intégration BotService
        </h1>
        <p className="text-gray-600">
          Ce composant teste l'intégration du BotService avec l'API Taranis.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={startTests}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Tests en cours...' : 'Démarrer les Tests'}
        </button>
      </div>

      {logs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Logs des Tests
          </h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {testResults.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Résultats des Tests
          </h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : result.status === 'running'
                    ? 'bg-blue-50 border-blue-400 text-blue-800'
                    : 'bg-gray-50 border-gray-400 text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.name}</span>
                  <span className="text-sm">
                    {result.status === 'success' && '✅'}
                    {result.status === 'error' && '❌'}
                    {result.status === 'running' && '⏳'}
                    {result.status === 'pending' && '⏸️'}
                  </span>
                </div>
                {result.message && (
                  <div className="text-sm mt-1 opacity-75">
                    {result.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">
          Tests Inclus
        </h3>
        <ul className="text-blue-700 space-y-1">
          <li>• Test de connexion à l'API Taranis</li>
          <li>• Récupération des bots configurés</li>
          <li>• Récupération des worker bots</li>
          <li>• Création et suppression d'un bot de test</li>
          <li>• Récupération des news items</li>
          <li>• Récupération des stories</li>
          <li>• Récupération des statistiques</li>
          <li>• Récupération des tags disponibles</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">
          ⚠️ Note Importante
        </h3>
        <p className="text-yellow-700 text-sm">
          Ces tests nécessitent une connexion active à l'API Taranis. 
          Assurez-vous que le serveur Taranis est démarré et accessible 
          avant de lancer les tests.
        </p>
      </div>
    </div>
  );
};

export default BotServiceTestComponent;
