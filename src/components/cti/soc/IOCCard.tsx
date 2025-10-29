import React, { useState } from 'react';
import {
  Shield,
  AlertCircle,
  CheckCircle2,
  Globe,
  FileCode,
  Mail,
  Link as LinkIcon,
  Hash,
  Bug,
  RefreshCw,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useEnrichIOC } from '../../../hooks/use-ioc';
import { toast } from 'sonner';

interface IOCCardProps {
  ioc: any;
  onEnrich?: (enrichedData: any) => void;
}

export function IOCCard({ ioc, onEnrich }: IOCCardProps) {
  const enrichIOC = useEnrichIOC();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const iocTypeIcons = {
    IP: <Globe className="w-5 h-5" />,
    DOMAIN: <LinkIcon className="w-5 h-5" />,
    URL: <ExternalLink className="w-5 h-5" />,
    FILE_HASH: <Hash className="w-5 h-5" />,
    EMAIL: <Mail className="w-5 h-5" />,
    CVE: <Bug className="w-5 h-5" />,
  };

  const iocTypeColors = {
    IP: 'from-blue-500 to-cyan-500',
    DOMAIN: 'from-purple-500 to-pink-500',
    URL: 'from-green-500 to-emerald-500',
    FILE_HASH: 'from-orange-500 to-red-500',
    EMAIL: 'from-yellow-500 to-orange-500',
    CVE: 'from-red-500 to-rose-500',
  };

  const threatScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 50) return 'text-orange-500';
    if (score >= 20) return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleEnrich = async () => {
    const result = await enrichIOC.mutateAsync({
      iocValue: ioc.iocValue,
      iocType: ioc.iocType,
    });

    if (onEnrich) {
      onEnrich(result.data);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ioc.iocValue);
    setCopied(true);
    toast.success('✅ IOC copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const enrichmentData = ioc.enrichmentData || {};
  const hasEnrichment = Object.keys(enrichmentData).length > 2; // Plus que timestamp et type

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${iocTypeColors[ioc.iocType as keyof typeof iocTypeColors]} bg-opacity-10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${iocTypeColors[ioc.iocType as keyof typeof iocTypeColors]}`}>
              {iocTypeIcons[ioc.iocType as keyof typeof iocTypeIcons]}
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">{ioc.iocType}</div>
              <div className="font-mono text-gray-200 font-semibold break-all">{ioc.iocValue}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title="Copier"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
            <button
              onClick={handleEnrich}
              disabled={enrichIOC.isPending}
              className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/50 rounded-lg transition-all disabled:opacity-50"
              title="Enrichir"
            >
              <RefreshCw className={`w-4 h-4 ${enrichIOC.isPending ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Enrichment Data */}
      {hasEnrichment && (
        <div className="p-4 space-y-3">
          {/* Threat Score */}
          {enrichmentData.ipData?.threatScore !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Threat Score</span>
              <span className={`font-bold text-lg ${threatScoreColor(enrichmentData.ipData.threatScore)}`}>
                {enrichmentData.ipData.threatScore}/100
              </span>
            </div>
          )}

          {/* Reputation */}
          {enrichmentData.ipData?.reputation && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Réputation</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                enrichmentData.ipData.reputation === 'malicious' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : enrichmentData.ipData.reputation === 'suspicious'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50'
              }`}>
                {enrichmentData.ipData.reputation.toUpperCase()}
              </span>
            </div>
          )}

          {/* Geolocation pour IP */}
          {enrichmentData.ipData?.country && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Pays</span>
              <span className="text-gray-200 font-semibold">{enrichmentData.ipData.country}</span>
            </div>
          )}

          {/* ISP pour IP */}
          {enrichmentData.ipData?.isp && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">ISP</span>
              <span className="text-gray-200 font-semibold">{enrichmentData.ipData.isp}</span>
            </div>
          )}

          {/* Malware Detection pour Fichiers */}
          {enrichmentData.fileData?.malicious !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Malicious</span>
              {enrichmentData.fileData.malicious ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
          )}

          {/* Detections pour Fichiers */}
          {enrichmentData.fileData?.detections !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Détections</span>
              <span className="text-gray-200 font-semibold">
                {enrichmentData.fileData.detections}/{enrichmentData.fileData.totalEngines}
              </span>
            </div>
          )}

          {/* CVE Score */}
          {enrichmentData.cveData?.cvssScore !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">CVSS Score</span>
              <span className={`font-bold text-lg ${threatScoreColor(enrichmentData.cveData.cvssScore * 10)}`}>
                {enrichmentData.cveData.cvssScore}
              </span>
            </div>
          )}

          {/* CVE Severity */}
          {enrichmentData.cveData?.severity && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Sévérité</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                enrichmentData.cveData.severity === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : enrichmentData.cveData.severity === 'HIGH'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                  : enrichmentData.cveData.severity === 'MEDIUM'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
              }`}>
                {enrichmentData.cveData.severity}
              </span>
            </div>
          )}

          {/* Last Seen */}
          {enrichmentData.ipData?.lastSeen && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Last Seen</span>
              <span className="text-gray-200 text-sm">
                {new Date(enrichmentData.ipData.lastSeen).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}

          {/* VPN/Proxy Detection */}
          {(enrichmentData.ipData?.isVPN || enrichmentData.ipData?.isProxy || enrichmentData.ipData?.isTor) && (
            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-orange-400 text-sm">
                <Shield className="w-4 h-4" />
                <span className="font-semibold">
                  {enrichmentData.ipData.isVPN && 'VPN Détecté'}
                  {enrichmentData.ipData.isProxy && 'Proxy Détecté'}
                  {enrichmentData.ipData.isTor && 'TOR Détecté'}
                </span>
              </div>
            </div>
          )}

          {/* Enrichment Timestamp */}
          <div className="pt-3 border-t border-cyan-500/20 text-xs text-gray-500">
            Enrichi le: {new Date(ioc.lastEnriched).toLocaleString('fr-FR')}
          </div>

          {/* Toggle Details */}
          {expanded && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <pre className="text-xs text-gray-400 overflow-x-auto">
                {JSON.stringify(enrichmentData, null, 2)}
              </pre>
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {expanded ? '▲ Masquer détails' : '▼ Voir détails complets'}
          </button>
        </div>
      )}

      {/* No Enrichment */}
      {!hasEnrichment && (
        <div className="p-4 text-center text-gray-500">
          <FileCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune donnée d'enrichissement</p>
          <p className="text-xs mt-1">Cliquez sur le bouton d'enrichissement</p>
        </div>
      )}
    </div>
  );
}


