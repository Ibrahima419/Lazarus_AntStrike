import React, { useEffect, useState } from 'react';
import { useReportingStore, Story } from '@/store/reporting.store';
import { Search, FileText, Database, X, GripVertical, Inbox, Layers, CheckSquare, Trash, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


export const EvidenceBrowser: React.FC = () => {
    const {
        stories, newsItems,
        fetchStories, fetchNewsItems, groupNewsItems,
        isEvidenceDrawerOpen, toggleEvidenceDrawer, linkStoryToItem, activeItemId,
        addNewsItem, deleteNewsItem, deleteStory
    } = useReportingStore();

    const [selectedNewsItems, setSelectedNewsItems] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('stories');
    const [isCreating, setIsCreating] = useState(false);
    const [newItemData, setNewItemData] = useState({ title: '', content: '', source: '', link: '' });

    useEffect(() => {
        if (isEvidenceDrawerOpen) {
            fetchStories();
            fetchNewsItems();
        }
    }, [isEvidenceDrawerOpen]);

    const handleToggleSelectNewsItem = (id: string) => {
        if (selectedNewsItems.includes(id)) {
            setSelectedNewsItems(selectedNewsItems.filter(i => i !== id));
        } else {
            setSelectedNewsItems([...selectedNewsItems, id]);
        }
    };

    const handleGroup = async () => {
        if (selectedNewsItems.length === 0) return;
        await groupNewsItems(selectedNewsItems);
        setSelectedNewsItems([]);
        setActiveTab('stories'); // Switch to stories to see result
    };

    const handleCreateNewsItem = async () => {
        await addNewsItem(newItemData);
        setIsCreating(false);
        setNewItemData({ title: '', content: '', source: '', link: '' });
    };

    if (!isEvidenceDrawerOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    Assess & Evidence
                </h3>
                <div className="flex items-center gap-2">
                    {activeTab === 'news' && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Ajouter une info"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={() => toggleEvidenceDrawer(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="p-2 border-b border-white/5">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                        <TabsTrigger value="stories" className="text-xs">
                            <Layers className="w-3 h-3 mr-2" /> Stories
                        </TabsTrigger>
                        <TabsTrigger value="news" className="text-xs">
                            <Inbox className="w-3 h-3 mr-2" /> Flux News
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder={activeTab === 'stories' ? "Rechercher des stories..." : "Rechercher dans le flux..."}
                        className="w-full bg-slate-800 border-none rounded-lg pl-9 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">

                {/* STORIES VIEW */}
                {activeTab === 'stories' && stories.map(story => (
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
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteStory(story.id); }}
                                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Supprimer la story"
                            >
                                <Trash className="w-3 h-3" />
                            </button>
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

                {/* NEWS ITEMS VIEW */}
                {activeTab === 'news' && (
                    <div className="space-y-2">
                        {selectedNewsItems.length > 0 && (
                            <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur pb-2 border-b border-white/10 mb-2">
                                <button
                                    onClick={handleGroup}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded font-medium flex items-center justify-center gap-2"
                                >
                                    <Layers className="w-3 h-3" />
                                    Grouper {selectedNewsItems.length} items en Story
                                </button>
                            </div>
                        )}

                        {newsItems.map((item: any) => (
                            <div key={item.id} className={cn(
                                "p-3 rounded-lg border transition-all cursor-pointer",
                                selectedNewsItems.includes(item.id)
                                    ? "bg-blue-900/20 border-blue-500/50"
                                    : "bg-slate-800/30 hover:bg-slate-800 border-white/5"
                            )}
                                onClick={() => handleToggleSelectNewsItem(item.id)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">{item.source || 'OSINT'}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteNewsItem(item.id); }}
                                                className="text-slate-500 hover:text-red-400 p-1"
                                                title="Supprimer"
                                            >
                                                <Trash className="w-3 h-3" />
                                            </button>
                                        </div>
                                        {selectedNewsItems.includes(item.id) && <CheckSquare className="w-3 h-3 text-blue-500" />}
                                    </div>
                                </div>
                                <h4 className="text-sm text-white mb-1 line-clamp-2 leading-tight">{item.title}</h4>
                                <p className="text-xs text-slate-500 line-clamp-3 mb-2">{item.content}</p>
                                <div className="flex justify-between items-center text-[10px] text-slate-600">
                                    <span>{item.published ? formatDistanceToNow(new Date(item.published), { addSuffix: true, locale: fr }) : 'Récemment'}</span>
                                    {item.link && (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="hover:text-blue-400 flex items-center gap-1">
                                            Source <FileText className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CREATE NEWS ITEM MODAL OVERLAY */}
            {isCreating && (
                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex flex-col p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white text-sm">Nouvelle Info (News Item)</h3>
                        <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Titre</label>
                            <input
                                value={newItemData.title}
                                onChange={e => setNewItemData({ ...newItemData, title: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-purple-500 outline-none"
                                placeholder="Titre de l'information..."
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Source</label>
                            <input
                                value={newItemData.source}
                                onChange={e => setNewItemData({ ...newItemData, source: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-purple-500 outline-none"
                                placeholder="Source (ex: Twitter, Interne...)"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Lien (URL)</label>
                            <input
                                value={newItemData.link}
                                onChange={e => setNewItemData({ ...newItemData, link: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-purple-500 outline-none"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs text-slate-400 block mb-1">Contenu / Description</label>
                            <textarea
                                value={newItemData.content}
                                onChange={e => setNewItemData({ ...newItemData, content: e.target.value })}
                                className="w-full flex-1 bg-slate-800 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-purple-500 outline-none resize-none min-h-[100px]"
                                placeholder="Détails de l'information..."
                            />
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex justify-end gap-2">
                        <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Annuler</button>
                        <button
                            onClick={handleCreateNewsItem}
                            disabled={!newItemData.title || !newItemData.content}
                            className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Créer l'item
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
