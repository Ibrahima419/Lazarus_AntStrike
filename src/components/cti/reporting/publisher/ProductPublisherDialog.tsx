import React, { useState } from 'react';
import { useReportingStore } from '@/store/reporting.store';
import { Mail, Share2, Printer, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProductPublisherDialogProps {
    productId?: string;
    productTitle?: string;
    onClose: () => void;
    preSelectedItems?: string[]; // If we are publishing items directly creating a product on the fly
}

export const ProductPublisherDialog: React.FC<ProductPublisherDialogProps> = ({ productId, productTitle, onClose, preSelectedItems }) => {
    const { publishProduct, assembleProduct } = useReportingStore();
    const [selectedPublisher, setSelectedPublisher] = useState<'email' | 'misp' | 'print'>('email');
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const targetProductId = productId;

            if (selectedPublisher === 'email' && targetProductId) {
                // Client-side Email opening
                const subject = encodeURIComponent(`[CTI Report] ${productTitle || 'Nouveau rapport de menace'}`);
                // Génération d'un lien d'accès (Simulé pour le dev local)
                const reportUrl = `${window.location.origin}/app/reports/${targetProductId}`;

                const bodyContent = `Bonjour,

Un nouveau rapport d'intelligence a été généré et est disponible pour consultation.

📄 TITRE : ${productTitle || 'Rapport sans titre'}
🔗 ACCÈS : ${reportUrl}
🆔 REF : ${targetProductId}

Ce rapport contient l'analyse consolidée des menaces récentes.

Cordialement,
L'équipe CTI AntStrike`;

                const body = encodeURIComponent(bodyContent);
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
                toast.success("Client mail ouvert !");
                onClose();
                return;
            }

            // If no product ID, we assume we need to create one on the fly (Quick Publish)
            if (!targetProductId && preSelectedItems && preSelectedItems.length > 0) {
                // Let's assume for this step we need a real product.
                toast.error("Veuillez d'abord assembler un rapport.");
                setIsPublishing(false);
                return;
            }

            if (targetProductId) {
                // Publisher ID '1' is usually Email in our mock/Taranis default
                // This path will be taken for MISP or other future publishers, not email anymore.
                await publishProduct(targetProductId, '1');
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsPublishing(false);
        }
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
                        <p className="text-slate-400 text-sm mt-1">Choisissez un canal de diffusion.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={() => setSelectedPublisher('email')}
                            className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${selectedPublisher === 'email' ? 'bg-blue-500/10 border-blue-500 text-blue-100' : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'}`}
                        >
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-sm">Par Email</div>
                                <div className="text-xs opacity-70">Envoyer aux abonnés CTI</div>
                            </div>
                            {selectedPublisher === 'email' && <CheckCircle2 className="w-5 h-5 text-blue-500 ml-auto" />}
                        </button>

                        <button
                            onClick={() => setSelectedPublisher('misp')}
                            className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${selectedPublisher === 'misp' ? 'bg-purple-500/10 border-purple-500 text-purple-100' : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'}`}
                        >
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-sm">Vers MISP (JSON)</div>
                                <div className="text-xs opacity-70">Synchroniser les attributs</div>
                            </div>
                            {selectedPublisher === 'misp' && <CheckCircle2 className="w-5 h-5 text-purple-500 ml-auto" />}
                        </button>

                        <button
                            disabled
                            className="p-4 rounded-xl border border-white/5 bg-slate-950 text-slate-600 flex items-center gap-4 opacity-50 cursor-not-allowed"
                        >
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-500">
                                <Printer className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-sm">Export PDF</div>
                                <div className="text-xs opacity-70">Bientôt disponible</div>
                            </div>
                        </button>
                    </div>

                    {!productId && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2 text-amber-200 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Attention: Vous devez d'abord assembler un rapport avant de pouvoir le publier.</p>
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
                        disabled={isPublishing || !productId}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPublishing ? 'Envoi...' : 'Publier maintenant'}
                    </button>
                </div>
            </div>
        </div>
    );
};
