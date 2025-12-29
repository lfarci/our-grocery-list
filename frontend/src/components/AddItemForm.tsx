import { FormEvent, useRef, useEffect } from 'react';
import { GroceryItem } from '../types';
import { ItemSuggestions } from './ItemSuggestions';

interface AddItemFormProps {
  name: string;
  error: string;
  onNameChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  suggestions: GroceryItem[];
  onSelectSuggestion: (item: GroceryItem) => void;
  showSuggestions: boolean;
}

export function AddItemForm({ 
  name, 
  error, 
  onNameChange, 
  onSubmit,
  suggestions,
  onSelectSuggestion,
  showSuggestions
}: AddItemFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount for better UX
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAddNew = () => {
    // Trigger form submission to add the current name as new item
    const form = inputRef.current?.form;
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <form onSubmit={onSubmit} className="mb-6 bg-cream p-4 rounded-lg shadow">
      <div className="space-y-3">
        <div className="relative">
          <label htmlFor="name" className="block text-sm font-semibold text-warmcharcoal mb-1">
            Item Name *
          </label>
          <input
            ref={inputRef}
            id="name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Start typing to search or add new..."
            className="w-full px-3 py-2 border border-warmsand rounded-md focus:outline-none focus:ring-2 focus:ring-softblue focus:border-transparent bg-cream text-warmcharcoal"
            autoComplete="off"
          />
          {showSuggestions && (
            <ItemSuggestions
              suggestions={suggestions}
              onSelect={onSelectSuggestion}
              onAddNew={handleAddNew}
              searchQuery={name}
            />
          )}
        </div>
        {error && (
          <p className="text-mutedcoral text-sm font-semibold">{error}</p>
        )}
        <button
          type="submit"
          className="w-full bg-softblue text-cream py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-softblue focus:ring-offset-2 transition-colors cursor-pointer font-semibold"
        >
          Add Item
        </button>
      </div>
    </form>
  );
}
