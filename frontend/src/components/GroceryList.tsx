import { useState, FormEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { ErrorMessage } from './ErrorMessage';
import { AddItemForm } from './AddItemForm';
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
  autoFocusInput?: boolean;
}

type ListMode = 'store' | 'kitchen';

const MODE_STORAGE_KEY = 'grocery-list-mode';

const filterItemsByMode = (items: GroceryItem[], mode: ListMode) => {
  if (mode === 'kitchen') {
    return items.filter(item => item.state === 'archived');
  }

  return items.filter(item => item.state === 'active' || item.state === 'checked');
};

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
  autoFocusInput = true,
}: GroceryListProps) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<ListMode>(() => {
    if (typeof window === 'undefined') {
      return 'store';
    }

    const savedMode = window.localStorage.getItem(MODE_STORAGE_KEY);
    return savedMode === 'kitchen' ? 'kitchen' : 'store';
  });
  const [formError, setFormError] = useState('');
  const [suggestions, setSuggestions] = useState<GroceryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Compute whether to show suggestions based on name length
  const trimmedName = name.trim();
  const shouldShowSuggestions = trimmedName.length >= 2;
  // Show suggestions popover when user types 2+ characters, even if API returns 0 suggestions
  const showSuggestions = shouldShowSuggestions;

  // Handle click outside to close suggestions and clear input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        // Only clear if there's text in the input
        if (name.trim()) {
          setName('');
          setSuggestions([]);
          setFormError('');
        }
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      // Cleanup event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [name]);

  useEffect(() => {
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  // Debounced search for suggestions
  useEffect(() => {
    if (!shouldShowSuggestions) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const results = await api.searchItems(trimmedName);
        setSuggestions(results);
      } catch (err) {
        console.error('Error searching items:', err);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [trimmedName, shouldShowSuggestions]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    setFormError('');
    // Clear suggestions when user clears the input or types less than 2 characters
    if (value.trim().length < 2) {
      setSuggestions([]);
    }
  }, []);

  const handleSelectSuggestion = useCallback(async (item: GroceryItem) => {
    if (item.state === 'archived') {
      // Unarchive and restore to active list immediately
      try {
        await toggleChecked(item.id, 'active');
        setName('');
        setFormError('');
        inputRef.current?.focus();
      } catch {
        setFormError('Failed to restore item. Please try again.');
      }
    } else if (item.state === 'active') {
      // Allow creating a duplicate of an active item
      try {
        await addItem({ name: item.name });
        setName('');
        setFormError('');
        inputRef.current?.focus();
      } catch {
        setFormError('Failed to add item. Please try again.');
      }
    }
  }, [toggleChecked, addItem]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate empty input - show validation message
    if (!name.trim()) {
      setFormError('Please enter an item name');
      return;
    }

    if (name.trim().length > MAX_ITEM_NAME_LENGTH) {
      setFormError(`Item name must be ${MAX_ITEM_NAME_LENGTH} characters or less`);
      return;
    }

    try {
      await addItem({ 
        name: name.trim(),
      });
      setName('');
      setFormError('');
      inputRef.current?.focus();
    } catch {
      setFormError('Failed to add item. Please try again.');
    }
  };

  const filteredItems = useMemo(() => filterItemsByMode(items, mode), [items, mode]);

  const handleArchive = useCallback(async (id: string) => {
    if (mode === 'kitchen') {
      await toggleChecked(id, 'active');
      return;
    }

    await archiveItem(id);
  }, [archiveItem, mode, toggleChecked]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-warmcharcoal">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-6">
          <div className="flex items-center justify-end pb-4">
            <div className="inline-flex items-center rounded-full border border-warmsand/70 bg-softwhitecream p-1 shadow-sm" role="group" aria-label="List mode">
              <button
                type="button"
                onClick={() => setMode('store')}
                aria-pressed={mode === 'store'}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition cursor-pointer ${
                  mode === 'store'
                    ? 'bg-softblue text-softwhitecream shadow-sm ring-1 ring-honey/50'
                    : 'text-warmcharcoal hover:bg-warmsand/40'
                }`}
              >
                Store
              </button>
              <button
                type="button"
                onClick={() => setMode('kitchen')}
                aria-pressed={mode === 'kitchen'}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition cursor-pointer ${
                  mode === 'kitchen'
                    ? 'bg-softblue text-softwhitecream shadow-sm ring-1 ring-honey/50'
                    : 'text-warmcharcoal hover:bg-warmsand/40'
                }`}
              >
                Kitchen
              </button>
            </div>
          </div>
          {error && <ErrorMessage message={error} onRetry={loadItems} />}

          <GroceryItemsList
            items={filteredItems}
            onToggleChecked={toggleChecked}
            onDelete={removeItem}
            onArchive={handleArchive}
            onOpenDetails={onOpenDetails}
            showCheckbox={mode === 'store'}
            archiveLabel={mode === 'kitchen' ? 'Restore' : 'Archive'}
          />
        </div>
      </div>

      {/* Fixed bottom composer bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream border-t border-warmsand/60 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <AddItemForm
            name={name}
            error={formError}
            onNameChange={handleNameChange}
            onSubmit={handleSubmit}
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
            showSuggestions={showSuggestions}
            inputRef={inputRef}
            formRef={formRef}
            autoFocus={autoFocusInput}
          />
        </div>
      </div>
    </div>
  );
}
