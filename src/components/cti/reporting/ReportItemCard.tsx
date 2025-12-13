import React from 'react';
import { FileText, Lock, Unlock, CheckCircle, Clock } from 'lucide-react';
import { ReportItem, LockStatus } from '@/store/reporting.store';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReportItemCardProps {
    item: ReportItem;
    lockStatus?: LockStatus;
    isSelected: boolean;
    onToggleSelect: () => void;
    onLock: () => void;
    onUnlock: () => void;
}

export const ReportItemCard: React.FC<ReportItemCardProps> = ({
    item,
    lockStatus,
    isSelected,
    onToggleSelect,
    onLock,
    onUnlock
}) => {
    const isLocked = lockStatus?.locked;
    const isLockedByMe = isLocked && lockStatus?.locked_by === 'Me'; // Simplification POC

    return (
        <div className={cn(
            "relative p-4 rounded-xl border transition-all duration-200 cursor-pointer group",
            isSelected ? "bg-blue-500/10 border-blue-500/50" : "bg-slate-900/50 border-white/5 hover:border-white/10",
            isLocked && !isLockedByMe ? "opacity-75 bg-slate-900/30" : ""
        )}>
            {/* Selection Checkbox (Zone click pour sélectionner) */}
            <div className="absolute inset-0 z-0" onClick={onToggleSelect} />

            <div className="relative z-10 flex items-start justify-between gap-3">

                {/* Icon & Status */}
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        item.completed ? "bg-green-500/10 text-green-400" : "bg-slate-800 text-slate-400"
                    )}>
                        {item.completed ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-white line-clamp-1" title={item.title}>
                            {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span>{formatDistanceToNow(new Date(item.updated_at), { addSuffix: true, locale: fr })}</span>
                            {item.author && <span>• par {item.author}</span>}
                        </div>
                    </div>
                </div>

                {/* Lock Controls */}
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    {isLocked ? (
                        isLockedByMe ? (
                            <button
                                onClick={onUnlock}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Déverrouiller (Vous éditez)"
                            >
                                <Unlock className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">
                                <Lock className="w-3 h-3 text-red-500" />
                                <span className="text-xs text-slate-400 max-w-[80px] truncate">
                                    {lockStatus?.locked_by || 'Utilisateur'}
                                </span>
                            </div>
                        )
                    ) : (
                        <button
                            onClick={onLock}
                            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                            title="Verrouiller pour éditer"
                        >
                            <Lock className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full border border-slate-900 shadow-lg" />
            )}
        </div>
    );
};
