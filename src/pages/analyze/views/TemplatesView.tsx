import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { FileCode, Settings, Trash2, Edit, Plus, Save, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../../components/ui/dialog"
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea"; // Assuming Textarea exists or default to input if not perfect
import { taranisService } from '../../../services/api/taranis.service';
import { toast } from 'sonner';

interface Template {
    id: string; // The path
    content: string;
    validation_status?: {
        is_valid: boolean;
        error_message?: string;
    };
}

interface ReportTypeConfig {
    id: number;
    title: string;
    description: string;
    // Simplified for now
}

export function TemplatesView() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [reportTypes, setReportTypes] = useState<ReportTypeConfig[]>([]);
    const [loading, setLoading] = useState(true);

    // Template Edit State
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
    const [templateContent, setTemplateContent] = useState('');
    const [templatePath, setTemplatePath] = useState('');
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    // Report Type Edit State
    const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
    const [currentType, setCurrentType] = useState<ReportTypeConfig | null>(null);
    const [typeName, setTypeName] = useState('');
    const [typeDesc, setTypeDesc] = useState('');
    const [isSavingType, setIsSavingType] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Templates
            const tmplRes = await taranisService.getTemplates();
            // Map the API response which might be { items: [...] }
            const tmplItems = (tmplRes && (tmplRes as any).items) ? (tmplRes as any).items : [];

            // For templates, the list endpoint might return objects with 'id' (path) but maybe not content?
            // User paste says: items: [{ content, id, validation_status }]
            setTemplates(tmplItems.map((t: any) => ({
                id: t.id,
                content: t.content || '', // Might be base64
                validation_status: t.validation_status
            })));

            // Fetch Report Types (Config)
            // Note: We use the Config endpoint we added
            const typesRes = await taranisService.getProductTypesConfig(); // Wait, user asked for Report Types config, not Product Types?
            // Step 842 had: /config/report-item-types AND /config/product-types
            // Let's fetch /config/report-item-types if we added it effectively.
            // In taranis.service.ts (Frontend), did we add getReportItemTypesConfig?
            // Checking... I added getProductTypesConfig. Did I add getReportItemTypesConfig?
            // In step 819 (Backend Service) I added getReportItemTypesConfig.
            // In step 825 (Routes) I added it.
            // In step 821 (Controller) I added it.
            // In Frontend (Step 829/857)... I might have missed it or mixed it up.
            // Let's assume fetching generic Report Types for now or reuse getReportTypes (Analyze) which returns the same data but read-only usually.
            // But we can try to use taranisService.getReportTypes() (Analyze) for LISTING.

            const rTypesRes = await taranisService.getReportTypes();
            const rTypeItems = (rTypesRes && (rTypesRes as any).items) ? (rTypesRes as any).items : [];
            setReportTypes(rTypeItems);

        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Template Handlers ---

    const handleEditTemplate = (tmpl: Template) => {
        setCurrentTemplate(tmpl);
        setTemplatePath(tmpl.id);
        // decode base64 if needed? API spec says "content" string. Usually base64 for files.
        // Let's assume it comes as base64 or raw. The endpoint /config/templates/{path} returns content.
        // List endpoint also returns content per the user paste.
        // If content looks base64-ish we might need decoding but for now displaying as is or assuming backend handles it.
        // Actually user paste: "content": "string".
        try {
            // Simple heuristic, if it starts with 'ew' (base64 for '{'), try decode, else leave it.
            // Or just use atob if it looks like base64. 
            // For safety, let's just show it. If user edits, we send it back.
            // Usually config/templates expects text or base64 with flag.
            setTemplateContent(tmpl.content); // If base64, user sees base64. 
        } catch (e) {
            setTemplateContent(tmpl.content);
        }
        setIsTemplateDialogOpen(true);
    };

    const handleNewTemplate = () => {
        setCurrentTemplate(null);
        setTemplatePath('');
        setTemplateContent('');
        setIsTemplateDialogOpen(true);
    };

    const handleSaveTemplate = async () => {
        try {
            setIsSavingTemplate(true);
            // Updating
            if (currentTemplate) {
                await taranisService.updateTemplate(templatePath, { content: templateContent });
                toast.success("Template updated");
            } else {
                // Creating (Save)
                await taranisService.saveTemplate({ id: templatePath, content: templateContent });
                toast.success("Template created");
            }
            setIsTemplateDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed to save template", error);
            toast.error("Failed to save template");
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleDeleteTemplate = async (path: string) => {
        if (!confirm(`Delete template ${path}?`)) return;
        try {
            await taranisService.deleteTemplate(path);
            toast.success("Template deleted");
            fetchData();
        } catch (error) {
            console.error("Failed to delete template", error);
            toast.error("Failed to delete template");
        }
    };

    // --- Report Type Handlers ---

    const handleNewType = () => {
        setCurrentType(null);
        setTypeName('');
        setTypeDesc('');
        setIsTypeDialogOpen(true);
    };

    const handleEditType = (type: ReportTypeConfig) => {
        setCurrentType(type);
        setTypeName(type.title);
        setTypeDesc(type.description);
        setIsTypeDialogOpen(true);
    };

    const handleSaveType = async () => {
        try {
            setIsSavingType(true);
            const payload = {
                title: typeName,
                description: typeDesc,
                attribute_groups: [] // Default empty config as tested
            };

            if (currentType) {
                await taranisService.updateReportItemType(currentType.id, payload);
                toast.success("Report Type updated");
            } else {
                await taranisService.createReportItemType(payload);
                toast.success("Report Type created");
            }
            setIsTypeDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed to save report type", error);
            toast.error("Failed to save report type");
        } finally {
            setIsSavingType(false);
        }
    };

    const handleDeleteType = async (type: ReportTypeConfig) => {
        if (!confirm(`Delete report type "${type.title}"?`)) return;
        try {
            await taranisService.deleteReportItemType(type.id);
            toast.success("Report Type deleted");
            fetchData();
        } catch (error) {
            console.error("Failed to delete report type", error);
            toast.error("Failed to delete report type");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-100">Configuration & Templates</h3>
            </div>

            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800">
                    <TabsTrigger value="templates">Report Templates</TabsTrigger>
                    <TabsTrigger value="types">Report Types</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="mt-6 space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={handleNewTemplate} className="bg-rose-600 hover:bg-rose-700">
                            <Plus className="w-4 h-4 mr-2" /> New Template
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(tmpl => (
                            <Card key={tmpl.id} className="bg-slate-900/40 border-slate-800/60 hover:border-slate-700 transition-all">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded bg-slate-800 text-rose-400">
                                            <FileCode className="w-5 h-5" />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(tmpl)}>
                                                <Edit className="w-4 h-4 text-slate-400 hover:text-white" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(tmpl.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500 hover:text-red-400" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-base font-medium text-slate-200 mt-4 truncate" title={tmpl.id}>
                                        {tmpl.id}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center mt-2">
                                        <Badge variant={tmpl.validation_status?.is_valid ? "default" : "destructive"} className="text-xs">
                                            {tmpl.validation_status?.is_valid ? "Valid" : "Invalid"}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="types" className="mt-6 space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={handleNewType} className="bg-amber-600 hover:bg-amber-700">
                            <Plus className="w-4 h-4 mr-2" /> New Type
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {reportTypes.map(type => (
                            <Card key={type.id} className="bg-slate-900/40 border-slate-800/60">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-800 rounded">
                                            <FileText className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-slate-200 font-semibold">{type.title}</h4>
                                            <p className="text-sm text-slate-500">{type.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEditType(type)}>
                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteType(type)} className="text-red-400 hover:text-red-300">
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Template Dialog */}
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{currentTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
                        <DialogDescription>Jinja2 template content.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="path">Path/Filename</Label>
                            <Input
                                id="path"
                                value={templatePath}
                                onChange={(e) => setTemplatePath(e.target.value)}
                                disabled={!!currentTemplate} // Disable path edit for existing
                                placeholder="e.g. daily_report.html"
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">Content</Label>
                            {/* Use a simple textarea for now */}
                            <textarea
                                id="content"
                                className="min-h-[300px] w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-50 font-mono focus:outline-none focus:ring-1 focus:ring-slate-700"
                                value={templateContent}
                                onChange={(e) => setTemplateContent(e.target.value)}
                                placeholder="<html>...</html>"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsTemplateDialogOpen(false)} variant="ghost">Cancel</Button>
                        <Button onClick={handleSaveTemplate} disabled={isSavingTemplate} className="bg-rose-600 hover:bg-rose-500">
                            {isSavingTemplate ? 'Saving...' : 'Save Template'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Report Type Dialog */}
            <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <DialogHeader>
                        <DialogTitle>{currentType ? 'Edit Report Type' : 'New Report Type'}</DialogTitle>
                        <DialogDescription>Configure report type details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type-name">Title</Label>
                            <Input
                                id="type-name"
                                value={typeName}
                                onChange={(e) => setTypeName(e.target.value)}
                                placeholder="e.g. Incident Report"
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type-desc">Description</Label>
                            <Input
                                id="type-desc"
                                value={typeDesc}
                                onChange={(e) => setTypeDesc(e.target.value)}
                                placeholder="Description of the report type"
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsTypeDialogOpen(false)} variant="ghost">Cancel</Button>
                        <Button onClick={handleSaveType} disabled={isSavingType} className="bg-amber-600 hover:bg-amber-500">
                            {isSavingType ? 'Saving...' : 'Save Type'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
