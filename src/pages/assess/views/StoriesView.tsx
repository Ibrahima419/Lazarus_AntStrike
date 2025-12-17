import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import React, { useEffect, useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import {
    Search, ExternalLink, Calendar, Hash, Share2, Filter,
    Star, Shield, CheckCircle2, AlertTriangle, Eye
} from 'lucide-react';
import { taranisService } from '../../../services/api/taranis.service';
import { Toggle } from '../../../../components/ui/toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu"

// Types from service
import { Story } from '../../../services/api/taranis.service';

export function StoriesView() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [showImportant, setShowImportant] = useState(false);
    const [showUnread, setShowUnread] = useState(false);
    const [showCybersecurity, setShowCybersecurity] = useState(false);
    const [showRelevant, setShowRelevant] = useState(false);

    const fetchStories = async () => {
        try {
            setLoading(true);
            const params: any = {
                search: searchTerm || undefined,
                important: showImportant || undefined,
                unread: showUnread || undefined,
                cybersecurity: showCybersecurity ? true : undefined,
                relevant: showRelevant ? true : undefined,
                limit: 20
            };

            const response = await taranisService.getStories(params);
            // Handle { data: { items: [] } } structure from Taranis API
            let storiesData: Story[] = [];

            if (response.data && 'items' in response.data && Array.isArray((response.data as any).items)) {
                storiesData = (response.data as any).items;
            } else if (Array.isArray(response.data)) {
                storiesData = response.data;
            }

            setStories(storiesData);
        } catch (error) {
            console.error("Failed to fetch stories:", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search and effect for filters
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStories();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, showImportant, showUnread, showCybersecurity, showRelevant]);

    const handleToggleImportant = async (story: Story) => {
        try {
            // Optimistic update
            setStories(stories.map(s => s.id === story.id ? { ...s, important: !s.important } : s));
            await taranisService.updateStory(story.id, { important: !story.important });
        } catch (error) {
            fetchStories(); // Revert on error
        }
    };

    const handleToggleRead = async (story: Story) => {
        try {
            setStories(stories.map(s => s.id === story.id ? { ...s, read: !s.read } : s));
            await taranisService.updateStory(story.id, { read: !story.read });
        } catch (error) {
            fetchStories();
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search stories..."
                        className="pl-9 bg-slate-900/50 border-slate-700 focus:border-amber-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <Toggle
                        variant="outline"
                        pressed={showImportant}
                        onPressedChange={setShowImportant}
                        className="data-[state=on]:bg-amber-900/30 data-[state=on]:text-amber-400 border-slate-700"
                    >
                        <Star className="w-4 h-4 mr-2" />
                        Important
                    </Toggle>

                    <Toggle
                        variant="outline"
                        pressed={showUnread}
                        onPressedChange={setShowUnread}
                        className="data-[state=on]:bg-blue-900/30 data-[state=on]:text-blue-400 border-slate-700"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Unread
                    </Toggle>

                    <Toggle
                        variant="outline"
                        pressed={showCybersecurity}
                        onPressedChange={setShowCybersecurity}
                        className="data-[state=on]:bg-red-900/30 data-[state=on]:text-red-400 border-slate-700"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Cybersecurity
                    </Toggle>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-slate-700">
                                <Filter className="w-4 h-4 mr-2" />
                                More Filters
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuCheckboxItem
                                checked={showRelevant}
                                onCheckedChange={setShowRelevant}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                Highly Relevant Only
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading intelligence stories...</div>
                ) : stories.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No stories found matching your criteria.</div>
                ) : (
                    stories.map((story) => (
                        <Card key={story.id} className={`group relative overflow-hidden transition-all duration-300 border-slate-800/60 bg-slate-900/40 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-slate-900/50 ${story.important ? 'border-amber-500/30' : ''}`}>
                            {/* Decorative gradient for importance */}
                            {story.important && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            )}

                            <CardContent className="p-6">
                                <div className="flex justify-between items-start gap-5">
                                    <div className="flex-1 space-y-3">
                                        {/* Header: Badges & Date */}
                                        <div className="flex items-center gap-3">
                                            {story.important && (
                                                <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10 px-2.5 py-0.5 shadow-sm shadow-amber-900/20">
                                                    <Star className="w-3 h-3 mr-1.5 fill-amber-500" /> Important
                                                </Badge>
                                            )}
                                            {!story.read && (
                                                <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 animate-pulse">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2" /> New
                                                </Badge>
                                            )}
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {story.created ? new Date(story.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg md:text-xl font-bold text-slate-100 leading-tight group-hover:text-cyan-400 transition-colors cursor-pointer">
                                            {story.title}
                                        </h3>

                                        {/* Summary */}
                                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 md:line-clamp-3 max-w-4xl">
                                            {story.summary || "No summary available for this intelligence story."}
                                        </p>

                                        {/* Tags & Metadata */}
                                        <div className="flex flex-wrap items-center gap-2 pt-2">
                                            {story.tags && story.tags.length > 0 ? (
                                                story.tags.map((tag: any, index: number) => {
                                                    // Handle if tag is object or string
                                                    const tagName = typeof tag === 'string' ? tag : tag.name || 'Tag';
                                                    return (
                                                        <Badge key={index} variant="secondary" className="bg-slate-800 text-slate-300 border border-slate-700/50 hover:bg-slate-700 transition-colors px-2 py-0.5 text-xs">
                                                            #{tagName}
                                                        </Badge>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">No tags</span>
                                            )}

                                            <div className="h-4 w-px bg-slate-800 mx-2 hidden md:block" />

                                            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                                                <Hash className="w-3 h-3 text-slate-600" />
                                                {story.news_items?.length || 0} ITEMS
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions Column */}
                                    <div className="flex flex-col gap-1 border-l border-slate-800 pl-4 py-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className={`h-9 w-9 rounded-lg transition-all ${story.important ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'}`}
                                            onClick={() => handleToggleImportant(story)}
                                            title="Mark as Important"
                                        >
                                            <Star className={`w-4 h-4 ${story.important ? 'fill-current' : ''}`} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className={`h-9 w-9 rounded-lg transition-all ${!story.read ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-800'}`}
                                            title={story.read ? "Mark as Unread" : "Mark as Read"}
                                            onClick={() => handleToggleRead(story)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-9 w-9 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800" title="Share">
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
