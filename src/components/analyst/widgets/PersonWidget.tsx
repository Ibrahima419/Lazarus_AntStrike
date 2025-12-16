/**
 * 👤 Person Widget - Affiche les personnalités mentionnées
 */

import { User } from 'lucide-react';
import { ClusterWidget } from './ClusterWidget';
import { TagCluster, TagItem } from '../../../types/taranis.types';

interface PersonWidgetProps {
    cluster: TagCluster;
    onTagClick?: (tag: TagItem) => void;
}

export function PersonWidget({ cluster, onTagClick }: PersonWidgetProps) {
    return (
        <ClusterWidget
            cluster={cluster}
            icon={<User className="w-5 h-5" />}
            color="#8b5cf6" // Purple
            maxTags={10}
            onTagClick={onTagClick}
        />
    );
}
