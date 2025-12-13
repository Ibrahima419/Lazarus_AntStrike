import { create } from 'zustand';
import { taranisService } from '../services/api/taranis.service';
import { toast } from 'sonner';

// --- Types Taranis Complets ---

export interface NewsItem {
    id: string;
    title: string;
    content: string;
    source: string;
    link?: string;
    published?: string;
    binary_value?: string; // Base64 image/content
}

export interface Story {
    id: string;
    title: string;
    description: string;
    news_items: NewsItem[]; // Les preuves brutes
    created: string;
    author: string;
}

export interface ReportItemAttribute {
    id: number;
    value: string;
    type: 'STRING' | 'RICH_TEXT' | 'ENUM' | 'DATE' | 'STORY';
    key: string;
    name: string;
}

export interface ReportItem {
    id: string;
    title: string;
    report_item_type_id: number;
    completed: boolean;
    created_at: string;
    updated_at: string;
    author?: string;
    stories?: Story[]; // Stories liées
    attributes?: ReportItemAttribute[]; // Données dynamiques
}

export interface LockStatus {
    locked: boolean;
    locked_by?: string;
    locked_at?: string;
    user_id?: number | string;
}

export interface Product {
    id: string;
    title: string;
    description: string;
    items: string[];
    created: string;
}

interface ReportingState {
    items: ReportItem[];
    stories: Story[]; // Available stories (evidence)
    products: Product[];
    draftProduct: string[];

    // UI State
    locks: Record<string, LockStatus>;
    activeItemId: string | null;
    isEvidenceDrawerOpen: boolean;
    isLoading: boolean;

    // Actions Core
    fetchItems: () => Promise<void>;
    fetchStories: () => Promise<void>;

    // Item Actions
    createItem: (title: string, typeId?: number) => Promise<void>;
    updateItemAttribute: (itemId: string, attributeId: number, value: string) => Promise<void>;
    linkStoryToItem: (itemId: string, storyId: string) => Promise<void>;

    // Product Actions
    toggleProductSelection: (itemId: string) => void;
    assembleProduct: (title: string) => Promise<string | null>;
    publishProduct: (productId: string, publisherId: string) => Promise<void>;

    // UI Actions
    setActiveItem: (id: string | null) => void;
    toggleEvidenceDrawer: (isOpen: boolean) => void;
    lockItem: (itemId: string) => Promise<boolean>;
    unlockItem: (itemId: string) => Promise<void>;
    checkLockStatus: (itemId: string) => Promise<void>;
}

export const useReportingStore = create<ReportingState>((set, get) => ({
    items: [],
    stories: [],
    products: [],
    draftProduct: [],
    locks: {},
    activeItemId: null,
    isEvidenceDrawerOpen: false,
    isLoading: false,

    fetchItems: async () => {
        set({ isLoading: true });
        try {
            const response = await taranisService.getReportItems();
            // Support de différents formats API possibles (tableau direct ou objet { items: [...] })
            const feedData = response.data as any;
            const items = Array.isArray(feedData) ? feedData : (feedData?.items || []);
            set({ items: Array.isArray(items) ? items : [] });
        } catch (error) {
            console.error('Failed to fetch items', error);
            toast.error('Erreur chargement items');
        } finally {
            set({ isLoading: false });
        }
    },

    fetchStories: async () => {
        try {
            const response = await taranisService.getStories({ limit: 50, sort: 'created:desc' });
            const feedData = response.data as any;
            const stories = Array.isArray(feedData) ? feedData : (feedData?.items || []);
            set({ stories: Array.isArray(stories) ? stories : [] });
        } catch (error) {
            console.error('Failed to fetch stories', error);
        }
    },

    createItem: async (title: string, typeId = 1) => {
        try {
            await taranisService.createReportItem({ title, report_item_type_id: typeId });
            await get().fetchItems();
            toast.success('Item créé');
        } catch (error) {
            toast.error('Erreur création item');
        }
    },

    updateItemAttribute: async (itemId, attributeId, value) => {
        // Optimistic update if needed, but here we just call API
        try {
            // Note: Taranis API structure for attributes update might vary
            // Assuming endpoint accepts generic update for now or specific attrib endpoint
            await taranisService.updateReportItem(itemId, { attributes: [{ id: attributeId, value }] });

            // Refresh item to get clean state
            const { data: updatedItem } = await taranisService.getReportItem(itemId);
            set(state => ({
                items: state.items.map(i => i.id === itemId && updatedItem ? updatedItem : i)
            }));
        } catch (error) {
            toast.error("Erreur sauvegarde attribut");
        }
    },

    linkStoryToItem: async (itemId, storyId) => {
        try {
            await taranisService.addReportItemStories(itemId, [storyId]);
            toast.success("Preuve liée avec succès");
            // Refresh item to show new story
            const { data: updatedItem } = await taranisService.getReportItem(itemId);
            set(state => ({
                items: state.items.map(i => i.id === itemId && updatedItem ? updatedItem : i)
            }));
        } catch (error) {
            toast.error("Erreur liaison story");
        }
    },

    toggleProductSelection: (itemId) => {
        set((state) => {
            const isSelected = state.draftProduct.includes(itemId);
            return {
                draftProduct: isSelected
                    ? state.draftProduct.filter(id => id !== itemId)
                    : [...state.draftProduct, itemId]
            };
        });
    },


    setActiveItem: (id) => set({ activeItemId: id }),
    toggleEvidenceDrawer: (isOpen) => set({ isEvidenceDrawerOpen: isOpen }),

    lockItem: async (itemId) => {
        try {
            await taranisService.lockReportItem(itemId);
            set((state) => ({
                locks: { ...state.locks, [itemId]: { locked: true, locked_by: 'Me' } }
            }));
            return true;
        } catch (error) {
            toast.error("Item verrouillé par un autre utilisateur");
            await get().checkLockStatus(itemId);
            return false;
        }
    },

    unlockItem: async (itemId) => {
        try {
            await taranisService.unlockReportItem(itemId);
            set((state) => {
                const newLocks = { ...state.locks };
                delete newLocks[itemId];
                return { locks: newLocks };
            });
        } catch (error) {
            console.error(error);
        }
    },

    checkLockStatus: async (itemId) => {
        try {
            const { data } = await taranisService.getReportItemLock(itemId);
            if (data) {
                set((state) => ({
                    locks: { ...state.locks, [itemId]: data }
                }));
            }
        } catch (error) { console.error(error); }
    },

    assembleProduct: async (title) => {
        const { draftProduct } = get();
        if (draftProduct.length === 0) return null;
        try {
            const response = await taranisService.createProduct({
                title,
                product_type_id: 1,
                report_items: draftProduct
            });
            toast.success("Rapport assemblé !");
            set({ draftProduct: [] });
            return response.data?.id; // Return ID for chaining
        } catch (error) {
            toast.error("Erreur assemblage");
            return null;
        }
    },

    publishProduct: async (productId, publisherId) => {
        try {
            await taranisService.publishProduct(productId, publisherId);
            toast.success("Rapport publié et envoyé !");
        } catch (error) {
            toast.error("Erreur publication");
        }
    }
}));
