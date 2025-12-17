import React, { useEffect, useState } from 'react';
import { useReportingStore, ReportItemAttribute } from '@/store/reporting.store';
import { DynamicAttributeEditor } from './editor/DynamicAttributeEditor';
import { EvidenceBrowser } from './evidence/EvidenceBrowser';
import { ProductPublisherDialog } from './publisher/ProductPublisherDialog';
import {
    Layout,
    FileText,
    Plus,
    Share2,
    Database,
    Lock,
    CheckCircle2,
    Square,
    CheckSquare,
    Eye,
    PenTool
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

// Helper pour éviter les crashs sur dates invalides
const safeFormatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (e) {
        return '';
    }
};

export const CollaborationWorkspace = () => {
    const {
        items,
        fetchItems,
        activeItemId,
        setActiveItem,
        createItem,
        updateItemAttribute,
        lockItem,
        checkLockStatus,
        locks,
        isEvidenceDrawerOpen,
        toggleEvidenceDrawer,
        linkStoryToItem,
        draftProduct,
        toggleProductSelection,
        assembleProduct
    } = useReportingStore();

    const [newItemTitle, setNewItemTitle] = useState('');
    const [showProductBuilder, setShowProductBuilder] = useState(false);
    const [reportTitle, setReportTitle] = useState('');
    const [showPublisher, setShowPublisher] = useState(false);
    const [newProductId, setNewProductId] = useState<string | null>(null);
    const [createdProductTitle, setCreatedProductTitle] = useState('');

    // UI Mode State
    const [viewMode, setViewMode] = useState<'edit' | 'read'>('edit');

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const activeItem = items.find(i => i.id === activeItemId);
    const activeLock = activeItemId ? locks[activeItemId] : null;

    // Auto-switch to read mode if locked by someone else
    useEffect(() => {
        if (activeLock?.locked && activeLock.locked_by !== 'Me') {
            setViewMode('read');
        } else {
            // Optional: Auto-switch to edit if unlocked? Maybe keep user preference.
            // setViewMode('edit');
        }
    }, [activeLock]);

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle.trim()) return;
        await createItem(newItemTitle);
        setNewItemTitle('');
    };

    const handleEditorSave = async (attribute: ReportItemAttribute, value: string) => {
        if (activeItemId) {
            await updateItemAttribute(activeItemId, attribute.id, value);
        }
    };

    return (
        <div className="flex h-screen bg-[#0B1120] text-slate-100 overflow-hidden">

            {/* --- LEFT COLUMN: OUTLINER --- */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-slate-900/50">
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Layout className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Studio</h1>
                            <p className="text-xs text-slate-400">Production CTI</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateItem} className="relative">
                        <input
                            type="text"
                            placeholder="Nouvel item..."
                            value={newItemTitle}
                            onChange={(e) => setNewItemTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <button type="submit" className="absolute right-2 top-1.5 p-0.5 hover:bg-slate-800 rounded text-slate-400">
                            <Plus className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {items.map((item, index) => {
                        const isLocked = locks[item.id]?.locked;
                        const isLockedByMe = locks[item.id]?.locked_by === 'Me';

                        return (
                            <div
                                key={item.id || index}
                                onClick={async () => {
                                    try {
                                        setActiveItem(item.id);
                                        await checkLockStatus(item.id);
                                    } catch (e) {
                                        console.error("Error selecting item", e);
                                    }
                                }}
                                className={cn(
                                    "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border border-transparent",
                                    activeItemId === item.id
                                        ? "bg-blue-500/10 border-blue-500/30 text-blue-100"
                                        : "hover:bg-white/5 text-slate-400"
                                )}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleProductSelection(item.id);
                                        }}
                                        className="mr-3 cursor-pointer p-1 hover:bg-white/5 rounded transition-colors"
                                    >
                                        {draftProduct.includes(item.id) ? (
                                            <CheckSquare className="w-4 h-4 text-blue-500" />
                                        ) : (
                                            <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-500" />
                                        )}
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="text-sm font-medium truncate">{item.title}</span>
                                        <span className="text-[10px] opacity-60">
                                            {safeFormatDate(item.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {isLocked && (
                                    <div className="relative" title={isLockedByMe ? "Verrouillé par vous" : ("Verrouillé par " + (locks[item.id]?.locked_by || "?"))}>
                                        <Lock className={cn("w-3 h-3", isLockedByMe ? "text-green-400" : "text-red-400")} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Product Assembly Quick Action */}
                <div className="p-4 border-t border-white/10 bg-slate-950/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-400">{draftProduct.length} items sélectionnés</span>
                    </div>
                    <button
                        onClick={() => setShowProductBuilder(true)}
                        disabled={draftProduct.length === 0}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Assembler le Rapport
                    </button>
                </div>
            </div>

            {/* --- CENTER COLUMN: STAGE (EDITOR) --- */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0B1120]">
                {activeItem ? (
                    <>
                        {/* Toolbar Header */}
                        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-slate-900/30">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold truncate max-w-md">{activeItem.title}</h2>
                                {activeLock?.locked ? (
                                    activeLock.locked_by === 'Me' ? (
                                        <Badge variant="success" icon={Lock}>Édition autorisée</Badge>
                                    ) : (
                                        <Badge variant="danger" icon={Lock}>Lecture seule (Verrouillé par {activeLock.locked_by})</Badge>
                                    )
                                ) : (
                                    <button
                                        onClick={() => lockItem(activeItem.id)}
                                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                    >
                                        <Lock className="w-3 h-3" /> Prendre la main
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Toggle View/Edit */}
                                <div className="flex bg-slate-950 rounded-lg p-1 border border-white/10">
                                    <button
                                        onClick={() => setViewMode('read')}
                                        className={cn("p-1.5 rounded-md transition-colors", viewMode === 'read' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-400")}
                                        title="Mode Lecture"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('edit')}
                                        disabled={activeLock?.locked && activeLock?.locked_by !== 'Me'}
                                        className={cn("p-1.5 rounded-md transition-colors", viewMode === 'edit' ? "bg-blue-600/20 text-blue-400" : "text-slate-500 hover:text-slate-400", (activeLock?.locked && activeLock?.locked_by !== 'Me') && "opacity-50 cursor-not-allowed")}
                                        title="Mode Édition"
                                    >
                                        <PenTool className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="w-px h-6 bg-white/10" />

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleEvidenceDrawer(!isEvidenceDrawerOpen)}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors flex items-center gap-2 text-sm",
                                            isEvidenceDrawerOpen ? "bg-purple-500/20 text-purple-300" : "hover:bg-white/5 text-slate-400"
                                        )}
                                    >
                                        <Database className="w-4 h-4" />
                                        Preuves
                                    </button>
                                    <div className="w-px h-6 bg-white/10 mx-2" />
                                    <button
                                        onClick={() => {
                                            if (!draftProduct.includes(activeItem.id)) {
                                                toggleProductSelection(activeItem.id);
                                            }
                                            setShowProductBuilder(true);
                                        }}
                                        className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                                        title="Publier / Partager cet item"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                            {/* Linked Stories Section */}
                            {activeItem.stories && activeItem.stories.length > 0 && (
                                <div className="mb-8 p-4 bg-slate-900/50 border border-purple-500/20 rounded-xl"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const storyId = e.dataTransfer.getData('text/plain');
                                        if (storyId) linkStoryToItem(activeItem.id, storyId);
                                    }}
                                >
                                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Database className="w-3 h-3" /> Sources & Preuves Liées
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {activeItem.stories.map(story => (
                                            <div key={story.id} className="bg-slate-950 p-3 rounded border border-white/5 flex items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate text-slate-200">{story.title}</div>
                                                    <div className="text-xs text-slate-500 truncate">{story.news_items?.length || 0} items techniques</div>
                                                </div>
                                                <FileText className="w-4 h-4 text-slate-600" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Drop Zone for new stories if empty */}
                            {(!activeItem.stories || activeItem.stories.length === 0) && viewMode === 'edit' && (
                                <div
                                    className="mb-8 border-2 border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const storyId = e.dataTransfer.getData('text/plain');
                                        if (storyId) linkStoryToItem(activeItem.id, storyId);
                                    }}
                                >
                                    <p className="text-sm">Glissez des preuves ici depuis le panneau latéral</p>
                                </div>
                            )}

                            {/* Attributes Editor */}
                            <div className="space-y-6">
                                {activeItem.attributes?.map((attr, index) => (
                                    <DynamicAttributeEditor
                                        key={attr.id || index}
                                        attribute={attr}
                                        onSave={(val) => handleEditorSave(attr, val)}
                                        isLocked={activeLock?.locked && activeLock?.locked_by !== 'Me'}
                                        mode={viewMode}
                                    />
                                ))}

                                {/* Fallback if no attributes (Demo purpose) */}
                                {(!activeItem.attributes || activeItem.attributes.length === 0) && (
                                    <div className="text-center py-10">
                                        <p className="text-slate-500 italic">Aucun attribut dynamique défini pour ce type d'item.</p>
                                        {/* DEMO ONLY: Show a fake editor to demonstrate capability */}
                                        <div className="mt-8 text-left">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-medium text-slate-400">Demo: Analyse Technique (Mode Démonstration)</label>
                                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Simulé</span>
                                            </div>
                                            <DynamicAttributeEditor
                                                attribute={{ id: 99, key: 'demo', name: 'Demo', type: 'RICH_TEXT', value: '<p>Ecrivez votre analyse ici (Démo)...</p>' }}
                                                onSave={(val) => { toast.success("Analyse sauvegardée (Locale uniquement)") }}
                                                mode={viewMode}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-lg font-medium">Sélectionnez un item pour commencer l'édition</p>
                    </div>
                )}
            </div>

            {/* --- RIGHT COLUMN: EVIDENCE BROWSER --- */}
            <EvidenceBrowser />

            {/* --- MODAL: PRODUCT BUILDER --- */}
            {showProductBuilder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold">Assembler le Rapport</h2>
                            <p className="text-slate-400 text-sm">Crée un PDF final contenant les items sélectionnés.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Titre du rapport</label>
                                <input
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 outline-none focus:border-blue-500"
                                    placeholder="ex: Rapport d'incident APT-29..."
                                    value={reportTitle}
                                    onChange={e => setReportTitle(e.target.value)}
                                />
                            </div>
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 max-h-48 overflow-y-auto">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sommaire</h4>
                                <ul className="space-y-2">
                                    {items.filter(i => draftProduct.includes(i.id)).map((item, idx) => (
                                        <li key={item.id} className="text-sm flex items-center gap-2">
                                            <span className="text-slate-600 font-mono text-xs">{idx + 1}.</span>
                                            {item.title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-950 flex justify-end gap-2">
                            <button
                                onClick={() => setShowProductBuilder(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={async () => {
                                    if (!reportTitle) return toast.error("Titre requis");
                                    const newId = await assembleProduct(reportTitle);
                                    if (newId) {
                                        setNewProductId(newId);
                                        setCreatedProductTitle(reportTitle);
                                        setShowProductBuilder(false);
                                        setShowPublisher(true);
                                        setReportTitle('');
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Générer & Publier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: PUBLISHER --- */}
            {showPublisher && newProductId && (
                <ProductPublisherDialog
                    productId={newProductId}
                    productTitle={createdProductTitle}
                    onClose={() => {
                        setShowPublisher(false);
                        setNewProductId(null);
                        setCreatedProductTitle('');
                    }}
                />
            )}
        </div>
    );
}

const Badge = ({ variant = "default", children, icon: Icon }: any) => {
    const variants: any = {
        default: "bg-slate-800 text-slate-300",
        success: "bg-green-500/10 text-green-400 border-green-500/20",
        danger: "bg-red-500/10 text-red-400 border-red-500/20",
        warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    return (
        <span className={cn("text-xs px-2.5 py-0.5 rounded-full border border-transparent flex items-center gap-1.5 font-medium", variants[variant])}>
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    );
};

export default CollaborationWorkspace;
