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
    <div ref={formRef} className="w-full">
      <form onSubmit={onSubmit} className="w-full">
        <div className="flex w-full justify-center">
          <div className="relative flex w-full max-w-4xl items-stretch gap-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                id="name"
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Search or add an item"
                className="w-full border border-warmsand bg-cream px-4 py-3 text-warmcharcoal placeholder:text-softbrowngray shadow-sm focus:border-softblue focus:outline-none focus:ring-2 focus:ring-softblue"
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
              className="inline-flex items-center justify-center bg-softblue px-4 py-3 text-cream shadow-sm transition-colors hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-softblue focus:ring-offset-2"
              aria-label="Add Item"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        {error && (
          <p className="pt-2 text-center text-sm font-semibold text-mutedcoral">{error}</p>
        )}
      </form>
    </div>
  );
}
