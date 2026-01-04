import { FormEvent, useEffect } from 'react';
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
  inputRef: React.RefObject<HTMLInputElement | null>;
  formRef: React.RefObject<HTMLDivElement | null>;
}

export function AddItemForm({ 
  name, 
  error, 
  onNameChange, 
  onSubmit,
  suggestions,
  onSelectSuggestion,
  showSuggestions,
  inputRef,
  formRef
}: AddItemFormProps) {
  // Focus input on mount for better UX
  useEffect(() => {
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddNew = () => {
    // Trigger form submission to add the current name as new item
    const form = inputRef.current?.form;
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <div ref={formRef}>
      <form onSubmit={onSubmit} className="mb-6 bg-cream p-4 rounded-lg shadow">
        <div className="space-y-3">
          <div className="relative flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                id="name"
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Add an item..."
                className="w-full px-3 py-2 border border-warmsand rounded-md focus:outline-none focus:ring-2 focus:ring-softblue focus:border-transparent bg-cream text-warmcharcoal"
                autoComplete="off"
                aria-label="Item Name"
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
            <button
              type="submit"
              className="bg-softblue text-cream p-2 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-softblue focus:ring-offset-2 transition-colors cursor-pointer"
              aria-label="Add Item"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {error && (
            <p className="text-mutedcoral text-sm font-semibold">{error}</p>
          )}
        </div>
      </form>
    </div>
  );
}
