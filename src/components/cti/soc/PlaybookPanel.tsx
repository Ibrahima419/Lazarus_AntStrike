import React, { useState } from 'react';
import { 
  Play,
  Pause,
  Settings,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  usePlaybooks, 
  useTogglePlaybook, 
  useExecutePlaybook, 
  useDeletePlaybook 
} from '../../../hooks/use-playbooks';

interface PlaybookPanelProps {
  onCreatePlaybook?: () => void;
  onEditPlaybook?: (playbookId: string) => void;
}

export function PlaybookPanel({ onCreatePlaybook, onEditPlaybook }: PlaybookPanelProps) {
  const { data: playbooksData, isLoading } = usePlaybooks(false);
  const togglePlaybook = useTogglePlaybook();
  const executePlaybook = useExecutePlaybook();
  const deletePlaybook = useDeletePlaybook();

  const [executingId, setExecutingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const playbooks = playbooksData?.data || [];

  const handleToggle = async (playbookId: string, currentEnabled: boolean) => {
    await togglePlaybook.mutateAsync({
      playbookId,
      enabled: !currentEnabled,
    });
  };

  const handleExecute = async (playbookId: string) => {
    setExecutingId(playbookId);
    await executePlaybook.mutateAsync({ playbookId });
    setExecutingId(null);
  };

  const handleDelete = async (playbookId: string) => {
    await deletePlaybook.mutateAsync(playbookId);
    setConfirmDelete(null);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'CREATE_ALERT':
        return <AlertTriangle className="w-4 h-4" />;
      case 'CREATE_CASE':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'SEND_NOTIFICATION':
        return <Zap className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          🤖 Playbooks Automatisés
        </h2>
        <button
          onClick={onCreatePlaybook}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau Playbook
        </button>
      </div>

      {/* Playbooks Grid */}
      {playbooks.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg">
          <Zap className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg mb-2">Aucun playbook configuré</p>
          <p className="text-gray-500 text-sm">Créez votre premier playbook automatisé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {playbooks.map((playbook: any) => (
            <div
              key={playbook.id}
              className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all"
            >
              {/* Playbook Header */}
              <div className={`p-4 ${playbook.enabled ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10' : 'bg-gray-800/50'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-cyan-400">{playbook.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        playbook.enabled
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                      }`}>
                        {playbook.enabled ? '✓ Actif' : '○ Inactif'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{playbook.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(playbook.id, playbook.enabled)}
                      disabled={togglePlaybook.isPending}
                      className={`p-2 rounded-lg transition-all ${
                        playbook.enabled
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                      }`}
                      title={playbook.enabled ? 'Désactiver' : 'Activer'}
                    >
                      {playbook.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Execution Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{playbook.executionCount || 0} exécutions</span>
                  </div>
                  {playbook.lastExecuted && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        Dernière: {new Date(playbook.lastExecuted).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Playbook Actions */}
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Actions ({playbook.actions?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {playbook.actions?.slice(0, 3).map((action: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm p-2 bg-gray-800/50 rounded-lg"
                      >
                        {getActionIcon(action.type)}
                        <span className="text-gray-300">{action.type.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                    {(playbook.actions?.length || 0) > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{playbook.actions.length - 3} autres actions
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleExecute(playbook.id)}
                    disabled={executingId === playbook.id || executePlaybook.isPending}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {executingId === playbook.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Exécution...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Exécuter
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onEditPlaybook?.(playbook.id)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                    title="Éditer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setConfirmDelete(playbook.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {confirmDelete === playbook.id && (
                <div className="p-4 bg-red-500/10 border-t border-red-500/30">
                  <p className="text-sm text-red-400 mb-3">
                    Êtes-vous sûr de vouloir supprimer ce playbook ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleDelete(playbook.id)}
                      disabled={deletePlaybook.isPending}
                      className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletePlaybook.isPending ? 'Suppression...' : 'Confirmer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Templates Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-400 mb-4">📋 Templates Populaires</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 bg-gray-900/50 rounded-lg border border-purple-500/20">
            <h4 className="font-semibold text-purple-300 mb-2">🔴 Réponse Incident Critical</h4>
            <p className="text-xs text-gray-400">Auto-créer un case pour chaque alerte critique</p>
          </div>
          <div className="p-4 bg-gray-900/50 rounded-lg border border-purple-500/20">
            <h4 className="font-semibold text-purple-300 mb-2">🚫 Blocage IP Malveillant</h4>
            <p className="text-xs text-gray-400">Bloquer automatiquement les IPs à haut risque</p>
          </div>
          <div className="p-4 bg-gray-900/50 rounded-lg border border-purple-500/20">
            <h4 className="font-semibold text-purple-300 mb-2">📊 Rapport Quotidien</h4>
            <p className="text-xs text-gray-400">Générer et envoyer un rapport chaque matin</p>
          </div>
        </div>
      </div>
    </div>
  );
}


