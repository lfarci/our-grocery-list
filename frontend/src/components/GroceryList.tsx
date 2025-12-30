import { useState, FormEvent, useCallback, useEffect, useRef } from 'react';
import { useGroceryList } from '../hooks';
import { ErrorMessage } from './ErrorMessage';
import { AddItemForm } from './AddItemForm';
import { GroceryItemsList } from './GroceryItemsList';
import { GroceryItem } from '../types';
import * as api from '../api';

const MAX_NAME_LENGTH = 50;

export function GroceryList() {
  const { items, loading, error, loadItems, addItem, toggleChecked, removeItem } = useGroceryList();
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [suggestions, setSuggestions] = useState<GroceryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute whether to show suggestions based on name length and suggestions
  const trimmedName = name.trim();
  const shouldShowSuggestions = trimmedName.length >= 2;
  const showSuggestions = shouldShowSuggestions && suggestions.length > 0;

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
        // Maintain focus after action
        setTimeout(() => inputRef.current?.focus(), 0);
      } catch {
        setFormError('Failed to restore item. Please try again.');
      }
    } else if (item.state === 'active') {
      // Allow creating a duplicate of an active item
      try {
        await addItem({ name: item.name });
        setName('');
        setFormError('');
        // Maintain focus after action
        setTimeout(() => inputRef.current?.focus(), 0);
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

    try {
      await addItem({ name: name.trim() });
      setName('');
      setFormError('');
      // Maintain focus after adding
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch {
      setFormError('Failed to add item. Please try again.');
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
        />

        <GroceryItemsList
          items={items}
          onToggleChecked={toggleChecked}
          onDelete={removeItem}
        />
      </div>
    </div>
  );
}
