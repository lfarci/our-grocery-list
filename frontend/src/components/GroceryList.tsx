import { useState, useCallback, useEffect } from 'react';
import { ErrorMessage } from './ErrorMessage';
import { AddItemCombobox } from './AddItemCombobox';
import { GroceryItemsList } from './GroceryItemsList';
import { CreateItemRequest, GroceryItem, ItemState } from '../types';
import * as api from '../api';
import { MAX_ITEM_NAME_LENGTH } from '../constants';

interface GroceryListProps {
  items: GroceryItem[];
  loading: boolean;
  error: string | null;
  loadItems: () => void;
  addItem: (item: CreateItemRequest) => Promise<GroceryItem>;
  toggleChecked: (id: string, state: ItemState) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  archiveItem: (id: string) => Promise<void>;
  onOpenDetails?: (id: string) => void;
}

export function GroceryList({
  items,
  loading,
  error,
  loadItems,
  addItem,
  toggleChecked,
  removeItem,
  archiveItem,
  onOpenDetails,
}: GroceryListProps) {
  const [suggestions, setSuggestions] = useState<GroceryItem[]>([]);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search for suggestions
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const results = await api.searchItems(trimmedQuery);
        setSuggestions(results);
      } catch (err) {
        console.error('Error searching items:', err);
        setSuggestions([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddItem = useCallback(async (name: string) => {
    setFormError('');
    
    // Validate empty input
    if (!name.trim()) {
      setFormError('Please enter an item name');
      throw new Error('Empty item name');
    }

    if (name.trim().length > MAX_ITEM_NAME_LENGTH) {
      setFormError(`Item name must be ${MAX_ITEM_NAME_LENGTH} characters or less`);
      throw new Error('Item name too long');
    }

    try {
      await addItem({ name: name.trim() });
      setFormError('');
      setSearchQuery('');
    } catch (err) {
      setFormError('Failed to add item. Please try again.');
      throw err;
    }
  }, [addItem]);

  const handleRestoreArchivedItem = useCallback(async (item: GroceryItem) => {
    setFormError('');
    try {
      await toggleChecked(item.id, 'active');
      setSearchQuery('');
    } catch (err) {
      setFormError('Failed to restore item. Please try again.');
      throw err;
    }
  }, [toggleChecked]);

  const handleDuplicateActiveItem = useCallback(async (item: GroceryItem) => {
    setFormError('');
    try {
      await addItem({ name: item.name });
      setSearchQuery('');
    } catch (err) {
      setFormError('Failed to add item. Please try again.');
      throw err;
    }
  }, [addItem]);

  if (loading) {
    return (
      <div className="min-h-screen bg-honey flex items-center justify-center">
        <div className="text-warmcharcoal">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-honey">
      <AddItemCombobox
        suggestions={suggestions}
        onAddItem={handleAddItem}
        onRestoreArchivedItem={handleRestoreArchivedItem}
        onDuplicateActiveItem={handleDuplicateActiveItem}
        onSearchQueryChange={setSearchQuery}
        error={formError}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mt-4">
            <ErrorMessage message={error} onRetry={loadItems} />
          </div>
        )}

        <GroceryItemsList
          items={items}
          onToggleChecked={toggleChecked}
          onDelete={removeItem}
          onArchive={archiveItem}
          onOpenDetails={onOpenDetails}
        />
      </div>
    </div>
  );
}
