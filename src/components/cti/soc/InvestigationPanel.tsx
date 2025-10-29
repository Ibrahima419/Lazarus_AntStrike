import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  Eye,
  Target
} from 'lucide-react';
import { useCase, useAddInvestigationNote, useCloseCase } from '../../../hooks/use-cases';

interface InvestigationPanelProps {
  caseId: string;
  onClose?: () => void;
}

export function InvestigationPanel({ caseId, onClose }: InvestigationPanelProps) {
  const { data: caseData, isLoading } = useCase(caseId);
  const addNote = useAddInvestigationNote();
  const closeCase = useCloseCase();

  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'OBSERVATION' | 'FINDING' | 'ACTION' | 'CONCLUSION'>('OBSERVATION');
  const [closureNotes, setClosureNotes] = useState('');
  const [showClosureDialog, setShowClosureDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!caseData?.data) {
    return <div className="text-red-500">Case non trouvé</div>;
  }

  const caseInfo = caseData.data;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    await addNote.mutateAsync({
      caseId,
      data: {
        content: newNote,
        noteType,
      },
    });

    setNewNote('');
  };

  const handleCloseCase = async () => {
    if (!closureNotes.trim()) return;

    await closeCase.mutateAsync({
      caseId,
      closureNotes,
    });

    setShowClosureDialog(false);
    onClose?.();
  };

  const noteTypeIcons = {
    OBSERVATION: <Eye className="w-4 h-4" />,
    FINDING: <Target className="w-4 h-4" />,
    ACTION: <CheckCircle2 className="w-4 h-4" />,
    CONCLUSION: <FileText className="w-4 h-4" />,
  };

  const noteTypeColors = {
    OBSERVATION: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    FINDING: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    ACTION: 'bg-green-500/10 border-green-500/30 text-green-400',
    CONCLUSION: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  };

  const severityColors = {
    CRITICAL: 'text-red-500',
    HIGH: 'text-orange-500',
    MEDIUM: 'text-yellow-500',
    LOW: 'text-blue-500',
  };

  const statusColors = {
    OPEN: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    CLOSED: 'bg-green-500/20 text-green-400 border-green-500/50',
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              {caseInfo.title}
            </h2>
            <p className="text-gray-400 text-sm">{caseInfo.description}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[caseInfo.status as keyof typeof statusColors]}`}>
            {caseInfo.status}
          </span>
          <span className={`font-semibold ${severityColors[caseInfo.severity as keyof typeof severityColors]}`}>
            {caseInfo.severity}
          </span>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <User className="w-4 h-4" />
            <span>{caseInfo.assignee?.username || 'Non assigné'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{new Date(caseInfo.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>

      {/* Investigation Timeline */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" />
          Timeline d'Investigation
        </h3>

        {caseInfo.investigationNotes?.map((note: any, index: number) => (
          <div
            key={note.id}
            className={`p-4 rounded-lg border ${noteTypeColors[note.noteType as keyof typeof noteTypeColors]}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {noteTypeIcons[note.noteType as keyof typeof noteTypeIcons]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{note.noteType}</span>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{note.user?.username}</span>
                    <span>{new Date(note.timestamp).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{note.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Note Section */}
      {caseInfo.status !== 'CLOSED' && (
        <div className="p-6 border-t border-cyan-500/20 bg-gray-900/80">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h4 className="font-semibold text-cyan-400">Ajouter une Note</h4>
          </div>

          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as any)}
            className="w-full px-3 py-2 mb-3 bg-gray-800 border border-cyan-500/30 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="OBSERVATION">🔍 Observation</option>
            <option value="FINDING">🎯 Finding</option>
            <option value="ACTION">✅ Action</option>
            <option value="CONCLUSION">📝 Conclusion</option>
          </select>

          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Décrivez votre observation, finding, ou action..."
            className="w-full px-4 py-3 bg-gray-800 border border-cyan-500/30 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
            rows={3}
          />

          <div className="flex gap-3 mt-3">
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || addNote.isPending}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addNote.isPending ? 'Ajout...' : 'Ajouter Note'}
            </button>

            {caseInfo.status !== 'CLOSED' && (
              <button
                onClick={() => setShowClosureDialog(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 inline mr-2" />
                Clôturer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Closure Dialog */}
      {showClosureDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Clôturer le Case
            </h3>

            <textarea
              value={closureNotes}
              onChange={(e) => setClosureNotes(e.target.value)}
              placeholder="Notes de clôture (résolution, actions prises, etc.)..."
              className="w-full px-4 py-3 bg-gray-800 border border-cyan-500/30 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none mb-4"
              rows={5}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowClosureDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCloseCase}
                disabled={!closureNotes.trim() || closeCase.isPending}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {closeCase.isPending ? 'Clôture...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


