/**
 * 🏷️ Taranis Types - Tag Clusters & Trending Data
 */

export interface TagItem {
    name: string;
    size: number;
}

export interface TagCluster {
    name: string;
    size: number;
    tags: TagItem[];
}

export interface TrendingClustersResponse {
    success: boolean;
    data: {
        items: TagCluster[];
    };
}

export type ClusterType =
    | 'Location'
    | 'Organization'
    | 'Product'
    | 'Person'
    | 'cves'
    | 'registry_key_paths'
    | 'UNKNOWN';

export interface ClusterWidgetProps {
    cluster: TagCluster;
    icon?: React.ReactNode;
    color?: string;
    onTagClick?: (tag: TagItem) => void;
}
