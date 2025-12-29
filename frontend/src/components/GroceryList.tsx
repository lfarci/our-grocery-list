import { useState, FormEvent, useCallback, useEffect } from 'react';
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
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search for suggestions
  useEffect(() => {
    const trimmedName = name.trim();
    
    if (!trimmedName || trimmedName.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const results = await api.searchItems(trimmedName);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error searching items:', err);
        setSuggestions([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [name]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    setFormError('');
  }, []);

  const handleSelectSuggestion = useCallback(async (item: GroceryItem) => {
    setShowSuggestions(false);
    
    if (item.state === 'archived') {
      // Unarchive and add to list
      try {
        await toggleChecked(item.id, 'active');
        setName('');
        setFormError('');
      } catch (err) {
        setFormError('Failed to restore item. Please try again.');
      }
    } else if (item.state === 'active') {
      // Item already exists - user can still add duplicate by typing and submitting
      // Just clear the input to let them know it's already there
      setName('');
      setFormError('');
    }
  }, [toggleChecked]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setFormError('Please enter an item name');
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
      setShowSuggestions(false);
    } catch (err) {
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
