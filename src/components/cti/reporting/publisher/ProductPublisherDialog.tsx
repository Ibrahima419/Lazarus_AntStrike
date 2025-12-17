import React, { useState, useEffect } from 'react';
import { useReportingStore } from '@/store/reporting.store';
import { taranisService } from '@/services/api/taranis.service';
import { Mail, Share2, Printer, X, CheckCircle2, AlertCircle, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ProductPublisherDialogProps {
    productId?: string;
    productTitle?: string;
    onClose: () => void;
    preSelectedItems?: string[];
}

export const ProductPublisherDialog: React.FC<ProductPublisherDialogProps> = ({ productId, productTitle, onClose, preSelectedItems }) => {
    const { publishProduct, exportProductToPdf } = useReportingStore();
    const [publishers, setPublishers] = useState<any[]>([]);
    const [selectedPublisherId, setSelectedPublisherId] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);

    useEffect(() => {
        loadPublishers();
    }, []);

    const loadPublishers = async () => {
        try {
            const res = await taranisService.getPublishers();
            // Response format might be { items: [...] } or just [...]
            const items = (res && (res as any).items) ? (res as any).items : (Array.isArray(res) ? res : []);
            setPublishers(items);
            if (items.length > 0) {
                setSelectedPublisherId(items[0].id);
            }
        } catch (e) {
            console.error("Failed to load publishers", e);
            toast.error("Impossible de charger les publishers");
        }
    };

    const handlePublish = async () => {
        if (!processIdCheck()) return;
        if (!selectedPublisherId) return toast.error("Sélectionnez un canal");

        setIsPublishing(true);
        try {
            await publishProduct(productId!, selectedPublisherId);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsPublishing(false);
        }
    };

    const handlePreview = async () => {
        if (!processIdCheck()) return;
        setIsPreviewing(true);
        try {
            // Re-use store function that handles render + base64 download/view
            await exportProductToPdf(productId!);
        } catch (e) {
            console.error(e);
        } finally {
            setIsPreviewing(false);
        }
    };

    const processIdCheck = () => {
        if (!productId && preSelectedItems && preSelectedItems.length > 0) {
            toast.error("Veuillez d'abord assembler un rapport.");
            return false;
        }
        if (!productId) {
            toast.error("Aucun produit sélectionné");
            return false;
        }
        return true;
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-blue-400" />
                            Publier le Rapport
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Choisissez un canal de diffusion via Taranis.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {!productId && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2 text-amber-200 text-xs text-left">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Attention: Vous devez d'abord assembler un rapport avant de pouvoir le publier.</p>
                        </div>
                    )}

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {publishers.length === 0 ? (
                            <div className="text-center text-slate-500 text-sm py-8">Chargement des channels...</div>
                        ) : (
                            publishers.map(pub => (
                                <button
                                    key={pub.id}
                                    onClick={() => setSelectedPublisherId(pub.id)}
                                    className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${selectedPublisherId === pub.id ? 'bg-blue-500/10 border-blue-500 text-blue-100' : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'}`}
                                >
                                    <div className={`p-2 rounded-lg ${selectedPublisherId === pub.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                                        {pub.type === 'email' ? <Mail className="w-5 h-5" /> :
                                            pub.type === 'printer' ? <Printer className="w-5 h-5" /> :
                                                <Share2 className="w-5 h-5" />}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="font-semibold text-sm truncate">{pub.title}</div>
                                        <div className="text-xs opacity-70 truncate">{pub.description || pub.type}</div>
                                    </div>
                                    {selectedPublisherId === pub.id && <CheckCircle2 className="w-5 h-5 text-blue-500 ml-auto" />}
                                </button>
                            ))
                        )}
                    </div>


                    {productId && (
                        <div className="pt-2 border-t border-white/5">
                            <button
                                onClick={handlePreview}
                                disabled={isPreviewing}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                {isPreviewing ? (
                                    <span className="animate-pulse">Génération de l'aperçu...</span>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4" /> Prévisualiser le Rendu PDF/HTML
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-950 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing || !productId || !selectedPublisherId}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPublishing ? 'Envoi...' : 'Publier maintenant'}
                    </button>
                </div>
            </div>
        </div>
    );
};
