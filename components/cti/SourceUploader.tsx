/**
 * Source Uploader - Composant d'Upload de Fichiers de Sources
 * Supporte CSV, JSON, XML et autres formats de données CTI
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Upload, FileText, File, FileSpreadsheet, FileJson, 
  CheckCircle, AlertTriangle, X, Eye, Download,
  Database, Globe, Rss, Mail, Link
} from 'lucide-react';

import { OSINTSourceConfig } from '../../src/services/taranis/taranis-unified-service';

interface SourceUploaderProps {
  onCreateSource: (source: Partial<OSINTSourceConfig>) => Promise<void>;
  isLoading: boolean;
}

interface UploadedFile {
  file: File;
  content: string;
  type: 'csv' | 'json' | 'xml' | 'txt';
  preview: any[];
  parsed: boolean;
  error?: string;
}

interface ParsedData {
  headers: string[];
  rows: any[];
  totalRows: number;
  sample: any[];
}

export function SourceUploader({ onCreateSource, isLoading }: SourceUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [sourceConfig, setSourceConfig] = useState({
    name: '',
    type: 'manual' as const,
    description: '',
    autoCollect: false,
    collectionInterval: 3600, // 1 heure par défaut
    enabled: true
  });

  // Types de fichiers supportés
  const supportedTypes = {
    csv: { icon: FileSpreadsheet, label: 'CSV', color: 'bg-green-100 text-green-800' },
    json: { icon: FileJson, label: 'JSON', color: 'bg-blue-100 text-blue-800' },
    xml: { icon: FileText, label: 'XML', color: 'bg-purple-100 text-purple-800' },
    txt: { icon: File, label: 'TXT', color: 'bg-gray-100 text-gray-800' }
  };

  // Gestion du drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Gestion de la sélection de fichiers
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  }, []);

  // Traitement des fichiers
  const handleFiles = useCallback(async (fileList: File[]) => {
    const newFiles: UploadedFile[] = [];
    
    for (const file of fileList) {
      const fileType = getFileType(file.name);
      if (!fileType) {
        continue; // Fichier non supporté
      }

      try {
        const content = await readFileContent(file);
        const preview = parseFileContent(content, fileType);
        
        newFiles.push({
          file,
          content,
          type: fileType,
          preview: preview.slice(0, 5), // Aperçu des 5 premières lignes
          parsed: true
        });
      } catch (error) {
        newFiles.push({
          file,
          content: '',
          type: fileType,
          preview: [],
          parsed: false,
          error: `Erreur lors de la lecture: ${error}`
        });
      }
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Si c'est un seul fichier CSV/JSON, analyser automatiquement
    if (newFiles.length === 1 && newFiles[0].parsed) {
      analyzeFileData(newFiles[0]);
    }
  }, []);

  // Déterminer le type de fichier
  const getFileType = (filename: string): 'csv' | 'json' | 'xml' | 'txt' | null => {
    const ext = filename.toLowerCase().split('.').pop();
    if (['csv'].includes(ext || '')) return 'csv';
    if (['json'].includes(ext || '')) return 'json';
    if (['xml'].includes(ext || '')) return 'xml';
    if (['txt'].includes(ext || '')) return 'txt';
    return null;
  };

  // Lire le contenu du fichier
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Parser le contenu selon le type
  const parseFileContent = (content: string, type: string): any[] => {
    switch (type) {
      case 'csv':
        return parseCSV(content);
      case 'json':
        return parseJSON(content);
      case 'xml':
        return parseXML(content);
      default:
        return content.split('\n').filter(line => line.trim());
    }
  };

  // Parser CSV
  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  };

  // Parser JSON
  const parseJSON = (content: string): any[] => {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [data];
    } catch {
      return [];
    }
  };

  // Parser XML (simplifié)
  const parseXML = (content: string): any[] => {
    // Implémentation simplifiée - dans un vrai projet, utiliser une lib XML
    const items = content.match(/<item[^>]*>[\s\S]*?<\/item>/g) || [];
    return items.map(item => ({ content: item }));
  };

  // Analyser les données du fichier
  const analyzeFileData = (uploadedFile: UploadedFile) => {
    if (uploadedFile.type === 'csv' && uploadedFile.preview.length > 0) {
      const headers = Object.keys(uploadedFile.preview[0]);
      const rows = uploadedFile.preview;
      
      setParsedData({
        headers,
        rows,
        totalRows: rows.length,
        sample: rows.slice(0, 3)
      });
      
      // Générer un nom de source automatique
      setSourceConfig(prev => ({
        ...prev,
        name: prev.name || `${uploadedFile.file.name.replace(/\.[^/.]+$/, '')}_source`
      }));
    }
  };

  // Supprimer un fichier
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setParsedData(null);
    }
  };

  // Créer la source à partir des fichiers uploadés
  const createSourceFromFiles = async () => {
    try {
      setUploadProgress(0);
      
      const sourceData: Partial<OSINTSourceConfig> = {
        name: sourceConfig.name,
        type: sourceConfig.type,
        enabled: sourceConfig.enabled,
        parameters: {
          files: files.map(f => ({
            name: f.file.name,
            type: f.type,
            size: f.file.size,
            content: f.content.substring(0, 10000) // Limiter la taille pour l'API
          })),
          autoCollect: sourceConfig.autoCollect,
          collectionInterval: sourceConfig.collectionInterval,
          description: sourceConfig.description
        }
      };

      await onCreateSource(sourceData);
      
      // Reset du formulaire
      setFiles([]);
      setParsedData(null);
      setSourceConfig({
        name: '',
        type: 'manual',
        description: '',
        autoCollect: false,
        collectionInterval: 3600,
        enabled: true
      });
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Erreur lors de la création de la source:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Zone de drag & drop */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Fichiers de Sources CTI
          </CardTitle>
          <CardDescription>
            Glissez-déposez vos fichiers ou cliquez pour sélectionner. Formats supportés: CSV, JSON, XML, TXT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Glissez vos fichiers ici</p>
            <p className="text-sm text-gray-500 mb-4">ou</p>
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Sélectionner des fichiers
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".csv,.json,.xml,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </Button>
          </div>

          {/* Liste des fichiers uploadés */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="font-medium">Fichiers uploadés ({files.length})</h4>
              {files.map((file, index) => {
                const fileType = supportedTypes[file.type];
                const IconComponent = fileType.icon;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5" />
                      <div>
                        <p className="font-medium">{file.file.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={fileType.color}>{fileType.label}</Badge>
                          <span className="text-sm text-gray-500">
                            {(file.file.size / 1024).toFixed(1)} KB
                          </span>
                          {file.parsed && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Parsé
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log('Preview:', file.preview)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Aperçu des données parsées */}
          {parsedData && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Aperçu des données</h4>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <p className="text-sm">
                    <strong>{parsedData.totalRows}</strong> lignes détectées, 
                    <strong> {parsedData.headers.length}</strong> colonnes
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        {parsedData.headers.map((header, index) => (
                          <th key={index} className="p-2 text-left font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.sample.map((row, index) => (
                        <tr key={index} className="border-t">
                          {parsedData.headers.map((header, colIndex) => (
                            <td key={colIndex} className="p-2">
                              {String(row[header] || '').substring(0, 50)}
                              {String(row[header] || '').length > 50 && '...'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration de la source */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration de la Source</CardTitle>
            <CardDescription>
              Configurez les paramètres de votre nouvelle source de données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source-name">Nom de la source</Label>
                <Input
                  id="source-name"
                  value={sourceConfig.name}
                  onChange={(e) => setSourceConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Ma_source_CTI"
                />
              </div>
              
              <div>
                <Label htmlFor="source-type">Type de source</Label>
                <Select 
                  value={sourceConfig.type} 
                  onValueChange={(value: any) => setSourceConfig(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Manuel (Upload)
                    </div>
                    </SelectItem>
                    <SelectItem value="RSS">
                      <div className="flex items-center gap-2">
                        <Rss className="w-4 h-4" />
                        RSS Feed
                      </div>
                    </SelectItem>
                    <SelectItem value="API">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        API REST
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="source-description">Description</Label>
              <Textarea
                id="source-description"
                value={sourceConfig.description}
                onChange={(e) => setSourceConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de votre source de données CTI..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button 
                onClick={createSourceFromFiles}
                disabled={isLoading || !sourceConfig.name}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Créer la Source
                  </>
                )}
              </Button>
              
              {uploadProgress > 0 && (
                <div className="flex items-center gap-2">
                  <Progress value={uploadProgress} className="w-32" />
                  <span className="text-sm text-gray-500">{uploadProgress}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
