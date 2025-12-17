import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { ExternalLink, Clock, Newspaper, Globe, Star, Eye } from 'lucide-react';
import { taranisService } from '../../../services/api/taranis.service';
import { Button } from '../../../../components/ui/button';
import { Toggle } from '../../../../components/ui/toggle';
import { Input } from '../../../../components/ui/input';

import { NewsItem } from '../../../services/api/taranis.service';

// Local wrapper if we need extra UI state
interface NewsItemUI extends NewsItem {
    read?: boolean;
    important?: boolean;
}

export function NewsFeedView() {
    const [news, setNews] = useState<NewsItemUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showImportant, setShowImportant] = useState(false);
    const [showUnread, setShowUnread] = useState(false);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const params: any = {
                search: searchTerm || undefined,
                important: showImportant || undefined,
                read: showUnread ? false : undefined, // Assuming API uses read=false for unread
                limit: 50
            };

            const response = await taranisService.getNewsItems(params);

            // Handle { data: { items: [] } } structure
            let newsData: any[] = [];
            if (response.data && 'items' in response.data && Array.isArray((response.data as any).items)) {
                newsData = (response.data as any).items;
            } else if (Array.isArray(response.data)) {
                newsData = response.data;
            }
            // Map items to UI state (preserving local state if needed? or just plain)
            const mappedNews = newsData.map((item: any) => ({
                ...item,
                source: item.source || item.url || 'Unknown', // source in API seems to be a URL often
                summary: item.content || item.summary,
                // API didn't return read/important, defaulting to false
                read: item.read || false,
                important: item.important || false
            }));
            setNews(mappedNews);
        } catch (error) {
            console.error("Failed to fetch news:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchNews();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, showImportant, showUnread]);

    const handleToggleNewsAttribute = async (item: NewsItem, attr: 'important' | 'read') => {
        // Implementation would mirror StoriesView logic, assuming updateNewsItem exists
        // taranisService.updateNewsItem(item.id, { [attr]: !item[attr] });
        // For now, simple optimistic update of local state if API not ready
        setNews(news.map(n => n.id === item.id ? { ...n, [attr]: !n[attr] } : n));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            <div className="lg:col-span-2 space-y-4 h-full flex flex-col">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search news feed..."
                        className="bg-slate-900/50 border-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Toggle pressed={showImportant} onPressedChange={setShowImportant} variant="outline">
                        <Star className="w-4 h-4 mr-2" /> Important
                    </Toggle>
                    <Toggle pressed={showUnread} onPressedChange={setShowUnread} variant="outline">
                        <Eye className="w-4 h-4 mr-2" /> Unread
                    </Toggle>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading feeds...</div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No news items found.</div>
                    ) : (
                        news.map((item) => (
                            <Card key={item.id} className={`bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/60 group transition-all ${!item.read ? 'border-l-2 border-l-blue-500' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs py-0 h-5 border-slate-700 text-slate-400 bg-slate-800/50">
                                                    {item.source}
                                                </Badge>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(item.published || item.updated).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-slate-200 leading-snug group-hover:text-amber-400 transition-colors">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                                                {item.content || (item as any).summary}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-amber-400"
                                                onClick={() => handleToggleNewsAttribute(item, 'important')}
                                            >
                                                <Star className={`w-3.5 h-3.5 ${item.important ? 'fill-amber-400 text-amber-400' : ''}`} />
                                            </Button>
                                            <a href={item.source} target="_blank" rel="noopener noreferrer">
                                                <Button
                                                    size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-cyan-400"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}
