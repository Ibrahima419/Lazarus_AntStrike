
import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { FileText, Plus, Calendar, Lock, Unlock, MoreVertical, Archive, Copy, Edit } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../components/ui/select"
import { taranisService, ReportItem } from '../../../services/api/taranis.service';

// Local interface extending the service one for UI specific transformations if needed, 
// or just use the service one. We'll use the service one directly but might need a UI wrapper.
// For now, let's use the UI state to hold mapped data or map on the fly.

export function ReportsView() {
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [reportTypes, setReportTypes] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);

    // New Report Dialog State
    const [isNewReportOpen, setIsNewReportOpen] = useState(false);
    const [newReportTitle, setNewReportTitle] = useState('');
    const [newReportType, setNewReportType] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);

    // Edit Report Dialog State
    const [isEditReportOpen, setIsEditReportOpen] = useState(false);
    const [editingReportId, setEditingReportId] = useState<string | null>(null);
    const [editReportTitle, setEditReportTitle] = useState('');
    const [editReportType, setEditReportType] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const [reportsResponse, typesResponse] = await Promise.all([
                taranisService.getReportItems(),
                taranisService.getReportTypes()
            ]);

            // Create types map
            const typesMap: Record<number, string> = {};
            if (typesResponse && typesResponse.data && Array.isArray((typesResponse.data as any).items)) {
                // Handle if data is { items: [...] } structure
                (typesResponse.data as any).items.forEach((t: any) => typesMap[t.id] = t.title);
            } else if (Array.isArray(typesResponse.data)) {
                // Handle if data is [...] directly
                typesResponse.data.forEach((t: any) => typesMap[t.id] = t.title);
            }

            setReportTypes(typesMap);

            let reportsData: ReportItem[] = [];
            if (reportsResponse && reportsResponse.data && Array.isArray((reportsResponse.data as any).items)) {
                reportsData = (reportsResponse.data as any).items;
            } else if (Array.isArray(reportsResponse.data)) {
                reportsData = reportsResponse.data as ReportItem[];
            }

            setReports(reportsData);
        } catch (error) {
            console.error("Failed to fetch report items:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleCreateReport = async () => {
        if (!newReportTitle || !newReportType) return;

        try {
            setIsCreating(true);
            await taranisService.createReportItem({
                title: newReportTitle,
                report_item_type_id: parseInt(newReportType),
                // stories: [], // Not needed if optional
                // attributes: [] // Not needed if optional
            });

            // Reset and refresh
            setNewReportTitle('');
            setNewReportType('');
            setIsNewReportOpen(false);
            fetchReports();
        } catch (error) {
            console.error("Failed to create report:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCloneReport = async (reportId: string) => {
        try {
            await taranisService.cloneReportItem(reportId);
            fetchReports();
        } catch (error) {
            console.error("Failed to clone report:", error);
        }
    };

    const handleDeleteReport = async (reportId: string) => {
        if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;

        try {
            await taranisService.deleteReportItem(reportId);
            fetchReports();
        } catch (error) {
            console.error("Failed to delete report:", error);
        }
    };

    const openEditDialog = (report: ReportItem) => {
        setEditingReportId(report.id);
        setEditReportTitle(report.title);
        setEditReportType(report.report_item_type_id?.toString() || '');
        setIsEditReportOpen(true);
    };

    const handleUpdateReport = async () => {
        if (!editingReportId || !editReportTitle) return;

        try {
            setIsUpdating(true);
            await taranisService.updateReportItem(editingReportId, {
                title: editReportTitle,
                // Only update type if selected, though often type isn't mutable after creation logic-wise, 
                // but API might allow it. We'll include it.
                report_item_type_id: editReportType ? parseInt(editReportType) : undefined
            });
            setIsEditReportOpen(false);
            setEditingReportId(null);
            fetchReports();
        } catch (error) {
            console.error("Failed to update report:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-100">Analysis Reports</h3>

                <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-amber-600 hover:bg-amber-500 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            New Report
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                        <DialogHeader>
                            <DialogTitle>Create New Report</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Start a new analysis report. You can add stories and evidence later.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    value={newReportTitle}
                                    onChange={(e) => setNewReportTitle(e.target.value)}
                                    className="col-span-3 bg-slate-950 border-slate-800"
                                    placeholder="e.g., APT29 Incidence Response"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">
                                    Type
                                </Label>
                                <Select onValueChange={setNewReportType} value={newReportType}>
                                    <SelectTrigger className="col-span-3 bg-slate-950 border-slate-800">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                        {Object.entries(reportTypes).map(([id, title]) => (
                                            <SelectItem key={id} value={id}>
                                                {title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsNewReportOpen(false)}>Cancel</Button>
                            <Button
                                className="bg-amber-600 hover:bg-amber-500"
                                onClick={handleCreateReport}
                                disabled={isCreating || !newReportTitle || !newReportType}
                            >
                                {isCreating ? 'Creating...' : 'Create Report'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Report Dialog */}
                <Dialog open={isEditReportOpen} onOpenChange={setIsEditReportOpen}>
                    <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                        <DialogHeader>
                            <DialogTitle>Edit Report Details</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Update the title or type of the report.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="edit-title"
                                    value={editReportTitle}
                                    onChange={(e) => setEditReportTitle(e.target.value)}
                                    className="col-span-3 bg-slate-950 border-slate-800"
                                    placeholder="Report title"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-type" className="text-right">
                                    Type
                                </Label>
                                <Select onValueChange={setEditReportType} value={editReportType}>
                                    <SelectTrigger className="col-span-3 bg-slate-950 border-slate-800">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                        {Object.entries(reportTypes).map(([id, title]) => (
                                            <SelectItem key={id} value={id}>
                                                {title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsEditReportOpen(false)}>Cancel</Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-500"
                                onClick={handleUpdateReport}
                                disabled={isUpdating || !editReportTitle}
                            >
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-slate-500">Loading reports...</div>
                ) : reports.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-500">No reports found. Create one to get started.</div>
                ) : (
                    reports.map((report) => (
                        <Card key={report.id} className="bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/60 transition-all group">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg bg-amber-500/10 text-amber-500`}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => handleCloneReport(report.id)}>
                                                <Copy className="w-4 h-4 mr-2" /> Clone Report
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => openEditDialog(report)}>
                                                <Edit className="w-4 h-4 mr-2" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-slate-800" />
                                            {/* Locking not fully supported in current ReportItem interface but kept for UI structure */}
                                            <DropdownMenuItem>
                                                <Lock className="w-4 h-4 mr-2" /> Lock
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-950/20" onSelect={() => handleDeleteReport(report.id)}>
                                                <Archive className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <h4 className="font-semibold text-slate-200 mb-2 truncate" title={report.title}>
                                    {report.title}
                                </h4>

                                <div className="flex items-center gap-2 mb-4">
                                    <Badge variant="outline" className="text-xs bg-slate-800/50 border-slate-700 text-slate-400">
                                        {reportTypes[report.report_item_type_id] || 'Report'}
                                    </Badge>
                                    <Badge variant="outline" className={`text-xs border-0 ${report.completed ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {report.completed ? 'Final' : 'Draft'}
                                    </Badge>
                                </div>

                                <div className="text-xs text-slate-500 flex justify-between items-center pt-4 border-t border-slate-800/60">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Updated {new Date(report.last_updated).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

