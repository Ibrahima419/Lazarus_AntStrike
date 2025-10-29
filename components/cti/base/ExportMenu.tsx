/**
 * 📥 ExportMenu - Menu d'export réutilisable multi-formats
 */

import { useState } from 'react';
import { Button } from '../../ui/button';
import {
  Download,
  FileJson,
  FileText,
  FileSpreadsheet,
  File,
  Check
} from 'lucide-react';

export type ExportFormat = 'json' | 'csv' | 'pdf' | 'html';

interface ExportMenuProps {
  data: any;
  filename?: string;
  formats?: ExportFormat[];
  onExport?: (format: ExportFormat, data: any) => void;
}

export function ExportMenu({
  data,
  filename = 'export',
  formats = ['json', 'csv', 'pdf', 'html'],
  onExport
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exported, setExported] = useState<ExportFormat | null>(null);

  const handleExport = (format: ExportFormat) => {
    if (onExport) {
      onExport(format, data);
    } else {
      // Default export logic
      exportData(format, data, filename);
    }
    
    setExported(format);
    setTimeout(() => {
      setExported(null);
      setIsOpen(false);
    }, 1500);
  };

  const exportData = (format: ExportFormat, data: any, filename: string) => {
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;

      case 'csv':
        content = convertToCSV(data);
        mimeType = 'text/csv';
        extension = 'csv';
        break;

      case 'html':
        content = convertToHTML(data);
        mimeType = 'text/html';
        extension = 'html';
        break;

      case 'pdf':
        // Pour PDF, il faudrait utiliser jsPDF ou similaire
        alert('Export PDF nécessite une configuration supplémentaire');
        return;

      default:
        return;
    }

    // Download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any): string => {
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      const rows = data.map((item) =>
        headers.map((header) => JSON.stringify(item[header] || '')).join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }
    return JSON.stringify(data);
  };

  const convertToHTML = (data: any): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #e2e8f0; }
          h1 { color: #06b6d4; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; }
          th { background: #1e293b; color: #06b6d4; font-weight: bold; }
          tr:hover { background: #1e293b; }
        </style>
      </head>
      <body>
        <h1>AntStrike CTI - Export</h1>
        <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
      </html>
    `;
  };

  const formatConfig = {
    json: { icon: FileJson, label: 'JSON', color: 'text-blue-400' },
    csv: { icon: FileSpreadsheet, label: 'CSV', color: 'text-green-400' },
    html: { icon: FileText, label: 'HTML', color: 'text-orange-400' },
    pdf: { icon: File, label: 'PDF', color: 'text-red-400' }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Download className="w-4 h-4 mr-2" />
        Exporter
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
            <div className="p-2 space-y-1">
              {formats.map((format) => {
                const config = formatConfig[format];
                const Icon = config.icon;
                const isExported = exported === format;

                return (
                  <button
                    key={format}
                    onClick={() => handleExport(format)}
                    disabled={isExported}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded
                      transition-all text-left
                      ${isExported 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'hover:bg-slate-800 text-slate-300'
                      }
                    `}
                  >
                    {isExported ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    )}
                    <span className="font-medium">{config.label}</span>
                    {isExported && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

