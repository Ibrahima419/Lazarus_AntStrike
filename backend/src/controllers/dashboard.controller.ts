/**
 * 📊 Dashboard Controller
 * Aggregates data for the CTI Dashboard (Analyst View)
 */

import { Request, Response, NextFunction } from 'express';
import { TaranisService } from '../services/taranis.service';
import { logger } from '../utils/logger';

export class DashboardController {
    /**
     * Get Analyst Dashboard Data
     * Combines Taranis Trending Clusters with other key metrics
     */
    static async getAnalystDashboard(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. Fetch Trending Clusters from Taranis (Last 7 days default)
            // The user specially asked for "tags cluster de taranis pour chaque tags"
            // Looking at TaranisService, we have getTrendingClusters and getClusterByType

            let trendingTags: any = {
                location: [],
                organization: [],
                person: [],
                product: [],
                cves: [] // User mentioned CVEs in screenshot (actually 'cves')
            };

            try {
                // Try to get trending clusters summary
                const clusters = await TaranisService.getTrendingClusters({ days: 7 });
                if (clusters) {
                    trendingTags = { ...trendingTags, ...clusters };
                }
            } catch (err) {
                logger.warn('Failed to fetch trending clusters from Taranis', err);
                // Fallback or empty state is fine
            }

            // 2. Fetch Dashboard Stats (Counts)
            let stats = {
                newsItems: 0,
                stories: 0,
                analyses: 0,
                products: 0
            };

            try {
                const dashboardData = await TaranisService.getDashboard();
                if (dashboardData) {
                    // Map Taranis dashboard stats structure to ours
                    // Assuming structure based on screenshot/docs
                    stats.newsItems = dashboardData.news_items_count || 0;
                    stats.stories = dashboardData.stories_count || 0;
                    stats.analyses = dashboardData.analyses_count || 0;
                    stats.products = dashboardData.products_count || 0;
                }
            } catch (err) {
                logger.warn('Failed to fetch dashboard stats from Taranis', err);
            }

            res.json({
                stats,
                trendingTags
            });

        } catch (error) {
            next(error);
        }
    }
}
