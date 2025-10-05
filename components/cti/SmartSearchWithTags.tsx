/**
 * Smart Search avec Auto-Suggestions de Tags
 * Utilise /worker/tags pour suggestions intelligentes
 */

import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Search, X, TrendingUp } from 'lucide-react';
import { getTaranisService } from '../../src/services/taranis/taranis-unified-service';

interface SmartSearchProps {
  onSearch: (term: string) => void;
  onTagsChange?: (tags: string[]) => void;
  placeholder?: string;
}

export function SmartSearchWithTags({ onSearch, onTagsChange, placeholder = 'Rechercher...' }: SmartSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const service = getTaranisService();

  // Charger les tags disponibles depuis Taranis
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await service.getWorkerTags();
        setAvailableTags(tags);
        console.log(`✅ ${tags.length} tags chargés depuis Taranis`);
      } catch (err) {
        // Silencieux si endpoint non disponible ou non autorisé
        console.log('⚠️ Tags endpoint non disponible (normal si Taranis hors ligne)');
        setAvailableTags([]);
      }
    };
    loadTags();
  }, [service]);

  // Filtrer suggestions basées sur la saisie
  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = availableTags.filter(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedTags.includes(tag)
      ).slice(0, 10); // Max 10 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, availableTags, selectedTags]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleAddTag = (tag: string) => {
    const newTags = [...selectedTags, tag];
    setSelectedTags(newTags);
    setSearchTerm('');
    setShowSuggestions(false);
    
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleAddTag(suggestions[0]);
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-2">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((tag, index) => (
              <div
                key={index}
                onClick={() => handleAddTag(tag)}
                className="px-4 py-2 hover:bg-accent cursor-pointer flex items-center justify-between"
              >
                <span>{tag}</span>
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

