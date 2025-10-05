/**
 * Stories Builder - Créateur d'histoires de menaces interactif
 * Interface drag & drop pour créer et corréler des éléments de CTI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  FileText, Plus, Save, Trash2, Edit, Eye, Link, 
  Tag, Calendar, User, Target, AlertTriangle, CheckCircle,
  Search, Filter, Download, Share, Brain, Zap
} from 'lucide-react';

import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';
import { TaranisStory, TaranisNewsItem } from './types';

interface StoryElement {
  id: string;
  type: 'ioc' | 'entity' | 'event' | 'campaign';
  title: string;
  content: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  position: { x: number; y: number };
  connections: string[];
  metadata: Record<string, any>;
}

interface StoryConnection {
  id: string;
  from: string;
  to: string;
  type: 'related' | 'caused' | 'targeted' | 'used';
  confidence: number;
  description: string;
}

export function StoriesBuilder() {
  const [stories, setStories] = useState<TaranisStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<TaranisStory | null>(null);
  const [storyElements, setStoryElements] = useState<StoryElement[]>([]);
  const [connections, setConnections] = useState<StoryConnection[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [draggedElement, setDraggedElement] = useState<StoryElement | null>(null);

  const service = getTaranisService();

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setIsLoading(true);
    try {
      const storiesData = await service.getStories();
      setStories(storiesData);
      
      if (storiesData.length > 0 && !selectedStory) {
        setSelectedStory(storiesData[0]);
        loadStoryElements(storiesData[0]);
      }
    } catch (error) {
      console.error('Erreur chargement stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStoryElements = (story: TaranisStory) => {
    // Convertir les news items en éléments de story
    const elements: StoryElement[] = story.newsItems?.map((item, index) => ({
      id: `element-${index}-${Date.now()}`,
      type: 'event',
      title: item.title,
      content: item.content,
      confidence: item.confidence || 0.8,
      severity: item.riskLevel || 'medium',
      tags: item.tags || [],
      position: { x: 100 + (index * 200), y: 100 + (index * 150) },
      connections: [],
      metadata: {
        source: item.osintSourceId,
        collectedDate: item.collectedDate,
        publishedDate: item.publishedDate
      }
    })) || [];

    setStoryElements(elements);

    // Créer des connexions automatiques basées sur l'IA
    const autoConnections = createAutoConnections(elements);
    setConnections(autoConnections);
  };

  const createAutoConnections = (elements: StoryElement[]): StoryConnection[] => {
    const connections: StoryConnection[] = [];
    
    // Connexions basées sur les tags similaires
    elements.forEach((element1, i) => {
      elements.slice(i + 1).forEach(element2 => {
        const commonTags = element1.tags.filter(tag => element2.tags.includes(tag));
        if (commonTags.length > 0) {
          connections.push({
            id: `conn-${element1.id}-${element2.id}`,
            from: element1.id,
            to: element2.id,
            type: 'related',
            confidence: commonTags.length / Math.max(element1.tags.length, element2.tags.length),
            description: `Shared tags: ${commonTags.join(', ')}`
          });
        }
      });
    });

    return connections;
  };

  const createNewStory = async () => {
    try {
      const newStory: Partial<TaranisStory> = {
        title: 'New Threat Story',
        content: 'Story description...',
        status: 'draft',
        tags: [],
        newsItems: []
      };

      const createdStory = await service.updateStory('new', newStory);
      setStories(prev => [...prev, createdStory]);
      setSelectedStory(createdStory);
      setIsEditing(true);
    } catch (error) {
      console.error('Erreur création story:', error);
    }
  };

  const saveStory = async () => {
    if (!selectedStory) return;

    try {
      const updatedStory = await service.updateStory(selectedStory.id, {
        ...selectedStory,
        newsItems: storyElements.map(element => ({
          id: element.id,
          title: element.title,
          content: element.content,
          confidence: element.confidence,
          riskLevel: element.severity,
          tags: element.tags,
          osintSourceId: element.metadata.source,
          collectedDate: element.metadata.collectedDate,
          publishedDate: element.metadata.publishedDate
        }))
      });

      setStories(prev => prev.map(s => s.id === updatedStory.id ? updatedStory : s));
      setSelectedStory(updatedStory);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur sauvegarde story:', error);
    }
  };

  const addStoryElement = (type: StoryElement['type']) => {
    const newElement: StoryElement = {
      id: `element-${Date.now()}`,
      type,
      title: `New ${type}`,
      content: '',
      confidence: 0.5,
      severity: 'medium',
      tags: [],
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      connections: [],
      metadata: {}
    };

    setStoryElements(prev => [...prev, newElement]);
  };

  const updateElement = (elementId: string, updates: Partial<StoryElement>) => {
    setStoryElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (elementId: string) => {
    setStoryElements(prev => prev.filter(el => el.id !== elementId));
    setConnections(prev => prev.filter(conn => 
      conn.from !== elementId && conn.to !== elementId
    ));
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'ioc': return <Target className="w-4 h-4" />;
      case 'entity': return <User className="w-4 h-4" />;
      case 'event': return <AlertTriangle className="w-4 h-4" />;
      case 'campaign': return <Zap className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const filteredStories = stories.filter(story => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Stories Builder
            </CardTitle>
            <CardDescription>
              Create and manage threat intelligence stories
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={createNewStory} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Story
            </Button>
            {isEditing && (
              <Button onClick={saveStory} size="sm" variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Liste des stories */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedStory?.id === story.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setSelectedStory(story);
                  loadStoryElements(story);
                  setIsEditing(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{story.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {story.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={story.status === 'published' ? 'default' : 'secondary'}>
                      {story.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {story.newsItems?.length || 0} items
                    </span>
                  </div>
                </div>
                {story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {story.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {story.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{story.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Canvas de construction */}
        {selectedStory && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedStory.title}</h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                >
                  {isEditing ? <Eye className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'View' : 'Edit'}
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Outils de création */}
            {isEditing && (
              <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                <span className="text-sm font-medium">Add elements:</span>
                <Button onClick={() => addStoryElement('ioc')} variant="outline" size="sm">
                  <Target className="w-4 h-4 mr-1" />
                  IOC
                </Button>
                <Button onClick={() => addStoryElement('entity')} variant="outline" size="sm">
                  <User className="w-4 h-4 mr-1" />
                  Entity
                </Button>
                <Button onClick={() => addStoryElement('event')} variant="outline" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Event
                </Button>
                <Button onClick={() => addStoryElement('campaign')} variant="outline" size="sm">
                  <Zap className="w-4 h-4 mr-1" />
                  Campaign
                </Button>
              </div>
            )}

            {/* Canvas interactif */}
            <div className="relative bg-muted/10 rounded-lg p-6 min-h-[400px] border-2 border-dashed border-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Story Canvas</p>
                  <p className="text-sm">Drag elements to build your threat story</p>
                </div>
              </div>

              {/* Éléments de story */}
              {storyElements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute border-2 rounded-lg p-3 min-w-[200px] cursor-move ${
                    getSeverityColor(element.severity)
                  }`}
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getElementIcon(element.type)}
                      <span className="font-medium text-sm">{element.type.toUpperCase()}</span>
                    </div>
                    {isEditing && (
                      <Button
                        onClick={() => deleteElement(element.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={element.title}
                        onChange={(e) => updateElement(element.id, { title: e.target.value })}
                        className="text-sm"
                        placeholder="Element title"
                      />
                      <Textarea
                        value={element.content}
                        onChange={(e) => updateElement(element.id, { content: e.target.value })}
                        className="text-xs min-h-[60px]"
                        placeholder="Element description"
                      />
                      <div className="flex items-center gap-2">
                        <Select
                          value={element.severity}
                          onValueChange={(value) => updateElement(element.id, { severity: value as any })}
                        >
                          <SelectTrigger className="w-20 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(element.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h5 className="font-medium text-sm mb-1">{element.title}</h5>
                      <p className="text-xs text-muted-foreground mb-2">{element.content}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(element.severity)}>
                          {element.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(element.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Connexions */}
              {connections.map((connection) => {
                const fromElement = storyElements.find(el => el.id === connection.from);
                const toElement = storyElements.find(el => el.id === connection.to);

                if (!fromElement || !toElement) return null;

                return (
                  <div
                    key={`${connection.from}-${connection.to}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: Math.min(fromElement.position.x, toElement.position.x),
                      top: Math.min(fromElement.position.y, toElement.position.y),
                      width: Math.abs(toElement.position.x - fromElement.position.x),
                      height: Math.abs(toElement.position.y - fromElement.position.y)
                    }}
                  >
                    <svg className="w-full h-full">
                      <line
                        x1={fromElement.position.x - Math.min(fromElement.position.x, toElement.position.x)}
                        y1={fromElement.position.y - Math.min(fromElement.position.y, toElement.position.y)}
                        x2={toElement.position.x - Math.min(fromElement.position.x, toElement.position.x)}
                        y2={toElement.position.y - Math.min(fromElement.position.y, toElement.position.y)}
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    </svg>
                  </div>
                );
              })}
            </div>

            {/* Métadonnées de la story */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <p className="text-2xl font-bold">{storyElements.length}</p>
                <p className="text-sm text-muted-foreground">Elements</p>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <p className="text-2xl font-bold">{connections.length}</p>
                <p className="text-sm text-muted-foreground">Connections</p>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <p className="text-2xl font-bold">
                  {storyElements.length > 0 ? Math.round(
                    storyElements.reduce((sum, el) => sum + el.confidence, 0) / storyElements.length * 100
                  ) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <p className="text-2xl font-bold">
                  {storyElements.filter(el => el.severity === 'critical' || el.severity === 'high').length}
                </p>
                <p className="text-sm text-muted-foreground">High/Critical</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
