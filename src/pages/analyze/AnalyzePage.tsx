import { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { FileSearch, FileText, Database } from 'lucide-react';
import { ReportsView } from './views/ReportsView';
import { TemplatesView } from './views/TemplatesView';

export default function AnalyzePage() {
    const [activeTab, setActiveTab] = useState('reports');

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-6 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-600">
                        Analyze Operations
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <FileSearch className="w-4 h-4 text-rose-500" />
                        Deep Analysis & Reporting
                    </p>
                </div>
            </div>

            <Tabs defaultValue="reports" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
                    <TabsTrigger value="reports" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white">
                        <FileText className="w-4 h-4 mr-2" />
                        Report Items
                    </TabsTrigger>
                    <TabsTrigger value="types" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white">
                        <Database className="w-4 h-4 mr-2" />
                        Report Templates
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="reports" className="mt-6">
                    <ReportsView />
                </TabsContent>

                <TabsContent value="types" className="mt-6">
                    <TemplatesView />
                </TabsContent>
            </Tabs>
        </div>
    );
}
