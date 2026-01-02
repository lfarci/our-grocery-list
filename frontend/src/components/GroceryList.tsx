import { useState, FormEvent, useCallback, useEffect, useRef } from 'react';
import { useGroceryList } from '../hooks';
import { ErrorMessage } from './ErrorMessage';
import { AddItemForm } from './AddItemForm';
import { GroceryItemsList } from './GroceryItemsList';
import { GroceryItem } from '../types';
import * as api from '../api';

const MAX_NAME_LENGTH = 50;

export function GroceryList() {
  const { items, loading, error, itemErrors, isOffline, loadItems, addItem, toggleChecked, removeItem, archiveItem, retryToggleChecked, retryArchive, retryDelete } = useGroceryList();
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [suggestions, setSuggestions] = useState<GroceryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [shouldRefocus, setShouldRefocus] = useState(false);
  const retryTimeoutRef = useRef<number | null>(null);

  // Compute whether to show suggestions based on name length and suggestions
  const trimmedName = name.trim();
  const shouldShowSuggestions = trimmedName.length >= 2;
  const showSuggestions = shouldShowSuggestions && suggestions.length > 0;

  // Refocus input after operations complete
  useEffect(() => {
    if (shouldRefocus) {
      inputRef.current?.focus();
      setShouldRefocus(false);
    }
  }, [shouldRefocus]);

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

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
    // Cancel any pending retry when user changes input (TASK-002: idempotent retry)
    if (retryTimeoutRef.current !== null) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
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
        setShouldRefocus(true);
      } catch {
        setFormError('Failed to restore item. Please try again.');
      }
    } else if (item.state === 'active') {
      // Allow creating a duplicate of an active item
      try {
        await addItem({ name: item.name });
        setName('');
        setFormError('');
        setShouldRefocus(true);
      } catch {
        setFormError('Failed to add item. Please try again.');
      }
    }
  }, [toggleChecked, addItem]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Empty input does nothing - no error message
    if (!name.trim()) {
      return;
    }

    if (name.trim().length > MAX_NAME_LENGTH) {
      setFormError(`Item name must be ${MAX_NAME_LENGTH} characters or less`);
      return;
    }

    // Cancel any pending retry before attempting a new submission
    if (retryTimeoutRef.current !== null) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const itemName = name.trim();

    try {
      await addItem({ name: itemName });
      setName('');
      setFormError('');
      setShouldRefocus(true);
    } catch {
      // TASK-001: Keep input filled and show error, then auto-retry once after 2 seconds
      setFormError('Failed to add item. Retrying...');
      
      // Schedule exactly one retry after 2000ms
      retryTimeoutRef.current = window.setTimeout(async () => {
        retryTimeoutRef.current = null;
        try {
          await addItem({ name: itemName });
          // Retry succeeded - clear input and error
          setName('');
          setFormError('');
          setShouldRefocus(true);
        } catch {
          // Retry failed - keep error visible, do not loop
          setFormError('Failed to add item. Please try again.');
        }
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-honey flex items-center justify-center">
        <div className="text-warmcharcoal">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-honey">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-warmcharcoal mb-6 text-center font-display">
          Our Grocery List
        </h1>

        {/* TASK-006: Offline indicator banner */}
        {isOffline && (
          <div className="mb-4 p-3 bg-warmsand border border-mutedcoral rounded-lg text-center">
            <p className="text-warmcharcoal font-semibold text-sm">
              Offline - changes will sync when reconnected
            </p>
          </div>
        )}

        {error && <ErrorMessage message={error} onRetry={loadItems} />}

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
        />

        <GroceryItemsList
          items={items}
          onToggleChecked={toggleChecked}
          onDelete={removeItem}
          onArchive={archiveItem}
          itemErrors={itemErrors}
          onRetryToggle={retryToggleChecked}
          onRetryArchive={retryArchive}
          onRetryDelete={retryDelete}
        />
      </div>
    </div>
  );
}
