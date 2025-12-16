/**
 * 📱 Product Widget - Affiche les produits technologiques tendances
 */

import { Package } from 'lucide-react';
import { ClusterWidget } from './ClusterWidget';
import { TagCluster, TagItem } from '../../../types/taranis.types';

interface ProductWidgetProps {
    cluster: TagCluster;
    onTagClick?: (tag: TagItem) => void;
}

export function ProductWidget({ cluster, onTagClick }: ProductWidgetProps) {
    return (
        <ClusterWidget
            cluster={cluster}
            icon={<Package className="w-5 h-5" />}
            color="#10b981" // Green
            maxTags={10}
            onTagClick={onTagClick}
        />
    );
}
