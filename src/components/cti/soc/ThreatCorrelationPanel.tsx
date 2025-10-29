import React, { useState } from 'react';
import { 
  Network,
  GitBranch,
  TrendingUp,
  AlertCircle,
  Tag,
  Hash,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import {  useThreatCorrelations,
  useThreatCampaigns,
  useCorrelationStats,
  useCorrelateThreat
} from '../../../hooks/use-correlation';

interface ThreatCorrelationPanelProps {
  selectedThreatId?: string;
}

export function ThreatCorrelationPanel({ selectedThreatId }: ThreatCorrelationPanelProps) {
  const { data: correlationsData } = useThreatCorrelations(selectedThreatId || null);
  const { data: campaignsData } = useThreatCampaigns(3);
  const { data: statsData } = useCorrelationStats();
  const correlateThreat = useCorrelateThreat();

  const [analyzing, setAnalyzing] = useState(false);

  const correlations = correlationsData?.data || [];
  const campaigns = campaignsData?.data || [];
  const stats = statsData?.data || {};

  const handleAnalyze = async () => {
    if (!selectedThreatId) return;

    setAnalyzing(true);
    await correlateThreat.mutateAsync({
      threatId: selectedThreatId,
      rule: {
        minConfidence: 0.7,
        maxTimeWindow: 72,
        similarTitles: true,
      },
    });
    setAnalyzing(false);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getConfidenceBg = (score: number) => {
    if (score >= 0.8) return 'bg-green-500/20 border-green-500/50';
    if (score >= 0.6) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-orange-500/20 border-orange-500/50';
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Network className="w-8 h-8 text-cyan-400" />
            <span className="text-3xl font-bold text-cyan-400">{stats.totalCorrelations || 0}</span>
          </div>
          <p className="text-sm text-gray-400">Corrélations Totales</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold text-green-400">{stats.highConfidence || 0}</span>
          </div>
          <p className="text-sm text-gray-400">Haute Confiance</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <GitBranch className="w-8 h-8 text-purple-400" />
            <span className="text-3xl font-bold text-purple-400">{stats.campaignCount || 0}</span>
          </div>
          <p className="text-sm text-gray-400">Campagnes Détectées</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            <span className="text-3xl font-bold text-orange-400">
              {stats.avgConfidence ? Math.round(stats.avgConfidence * 100) : 0}%
            </span>
          </div>
          <p className="text-sm text-gray-400">Confiance Moyenne</p>
        </div>
      </div>

      {/* Analyze Button */}
      {selectedThreatId && (
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || correlateThreat.isPending}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing || correlateThreat.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyse en cours...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Analyser les Corrélations
              </>
            )}
          </button>
        </div>
      )}

      {/* Threat Campaigns */}
      {campaigns.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-purple-400" />
            Campagnes de Menaces Détectées
          </h3>

          <div className="space-y-4">
            {campaigns.map((campaign: any, index: number) => (
              <div
                key={campaign.id}
                className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-purple-400">
                    Campagne #{index + 1}
                  </h4>
                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm font-semibold text-purple-400">
                    {campaign.size} menaces
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {campaign.threatIds.slice(0, 4).map((threatId: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 bg-gray-900/50 rounded border border-purple-500/20 text-center"
                    >
                      <span className="text-gray-400 text-xs">Threat</span>
                      <p className="text-purple-300 font-mono text-xs truncate">{threatId}</p>
                    </div>
                  ))}
                  {campaign.size > 4 && (
                    <div className="flex items-center justify-center text-gray-500 text-xs">
                      +{campaign.size - 4} autres
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlations List */}
      {selectedThreatId && correlations.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            Menaces Corrélées ({correlations.length})
          </h3>

          <div className="space-y-3">
            {correlations.map((correlation: any) => (
              <div
                key={correlation.id}
                className={`p-4 rounded-lg border ${getConfidenceBg(correlation.confidenceScore)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-gray-300 text-sm">
                        {correlation.relatedThreatId}
                      </span>
                      <span className={`font-bold text-lg ${getConfidenceColor(correlation.confidenceScore)}`}>
                        {Math.round(correlation.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  <AlertCircle className={`w-5 h-5 ${getConfidenceColor(correlation.confidenceScore)}`} />
                </div>

                {/* Common Indicators */}
                {correlation.commonIndicators && (
                  <div className="space-y-2 text-sm">
                    {correlation.commonIndicators.tags?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-gray-400">Tags communs:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {correlation.commonIndicators.tags.map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-xs text-cyan-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {correlation.commonIndicators.iocs?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-gray-400">IOCs communs:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {correlation.commonIndicators.iocs.map((ioc: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-xs text-orange-400 font-mono"
                              >
                                {ioc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {correlation.commonIndicators.timeDiff !== undefined && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>
                          Écart temporel: {Math.round(correlation.commonIndicators.timeDiff / 1000 / 60 / 60)}h
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data States */}
      {!selectedThreatId && correlations.length === 0 && (
        <div className="text-center py-12 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg">
          <Network className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg mb-2">Aucune menace sélectionnée</p>
          <p className="text-gray-500 text-sm">Sélectionnez une menace pour voir ses corrélations</p>
        </div>
      )}

      {selectedThreatId && correlations.length === 0 && !analyzing && (
        <div className="text-center py-12 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg mb-2">Aucune corrélation trouvée</p>
          <p className="text-gray-500 text-sm">Cliquez sur "Analyser" pour lancer une analyse</p>
        </div>
      )}
    </div>
  );
}


