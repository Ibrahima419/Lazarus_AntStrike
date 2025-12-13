import React, { useEffect } from 'react';
import { useReportingStore, Story } from '@/store/reporting.store';
import { Search, FileText, Database, X, GripVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';


export const EvidenceBrowser: React.FC = () => {
    const { stories, fetchStories, isEvidenceDrawerOpen, toggleEvidenceDrawer, linkStoryToItem, activeItemId } = useReportingStore();

    useEffect(() => {
        if (isEvidenceDrawerOpen) {
            fetchStories();
        }
    }, [isEvidenceDrawerOpen]);

    if (!isEvidenceDrawerOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    Preuves & Stories
                </h3>
                <button onClick={() => toggleEvidenceDrawer(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Rechercher des preuves..."
                        className="w-full bg-slate-800 border-none rounded-lg pl-9 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                {stories.map(story => (
                    <div
                        key={story.id}
                        className="group p-3 bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-lg transition-all cursor-move"
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', story.id);
                        }}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-100 cursor-grab" />
                                {story.created ? formatDistanceToNow(new Date(story.created), { addSuffix: true, locale: fr }) : ''}
                            </span>
                            {story.news_items?.length > 0 && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full border bg-slate-900 border-purple-500/30 text-purple-400">
                                    {story.news_items.length} items
                                </span>
                            )}
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2">{story.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{story.description}</p>

                        {/* Quick Action: Add to active item */}
                        {activeItemId && (
                            <button
                                onClick={() => linkStoryToItem(activeItemId, story.id)}
                                className="mt-3 w-full py-1.5 text-xs bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white rounded border border-purple-500/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                                Lier à l'item actif
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
