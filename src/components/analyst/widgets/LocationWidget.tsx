/**
 * 🌍 Location Widget - Affiche les locations (pays/régions) tendances
 */

import { Globe } from 'lucide-react';
import { ClusterWidget } from './ClusterWidget';
import { TagCluster, TagItem } from '../../../types/taranis.types';

interface LocationWidgetProps {
    cluster: TagCluster;
    onTagClick?: (tag: TagItem) => void;
}

export function LocationWidget({ cluster, onTagClick }: LocationWidgetProps) {
    return (
        <ClusterWidget
            cluster={cluster}
            icon={<Globe className="w-5 h-5" />}
            color="#3b82f6" // Blue
            maxTags={10}
            onTagClick={onTagClick}
        />
    );
}
