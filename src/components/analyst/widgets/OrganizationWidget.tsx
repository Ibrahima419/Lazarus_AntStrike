/**
 * 🏢 Organization Widget - Affiche les organisations tendances
 */

import { Building2 } from 'lucide-react';
import { ClusterWidget } from './ClusterWidget';
import { TagCluster, TagItem } from '../../../types/taranis.types';

interface OrganizationWidgetProps {
    cluster: TagCluster;
    onTagClick?: (tag: TagItem) => void;
}

export function OrganizationWidget({ cluster, onTagClick }: OrganizationWidgetProps) {
    return (
        <ClusterWidget
            cluster={cluster}
            icon={<Building2 className="w-5 h-5" />}
            color="#f59e0b" // Orange
            maxTags={10}
            onTagClick={onTagClick}
        />
    );
}
