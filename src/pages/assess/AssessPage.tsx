import { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Radar, Newspaper, Tag, Globe } from 'lucide-react';
import { StoriesView } from './views/StoriesView';
import { NewsFeedView } from './views/NewsFeedView';

export default function AssessPage() {
    const [activeTab, setActiveTab] = useState('stories');

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-6 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
                        Assess Operations
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <Radar className="w-4 h-4 text-amber-500" />
                        Intelligence Gathering & Assessment
                    </p>
                </div>
            </div>

            <Tabs defaultValue="stories" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
                    <TabsTrigger value="stories" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                        <Newspaper className="w-4 h-4 mr-2" />
                        Stories
                    </TabsTrigger>
                    <TabsTrigger value="news" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                        <Globe className="w-4 h-4 mr-2" />
                        News Feed
                    </TabsTrigger>
                    <TabsTrigger value="tags" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                        <Tag className="w-4 h-4 mr-2" />
                        Tags & Sources
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="stories" className="mt-6">
                    <StoriesView />
                </TabsContent>

                <TabsContent value="news" className="mt-6">
                    <NewsFeedView />
                </TabsContent>

                <TabsContent value="tags" className="mt-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold mb-4">Tags & Sources</h2>
                            <p className="text-slate-500">Tags visualization will be implemented here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
