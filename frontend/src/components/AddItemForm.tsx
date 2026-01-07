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
      <form onSubmit={onSubmit}>
        <div className="space-y-2">
          <div className="relative">
            <input
              ref={inputRef}
              id="name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Type to add or search..."
              className="w-full px-4 py-3 border border-warmsand rounded-lg focus:outline-none focus:ring-2 focus:ring-softblue focus:border-transparent bg-softwhitecream text-warmcharcoal placeholder:text-softbrowngray"
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
          {error && (
            <p className="text-mutedcoral text-sm font-semibold">{error}</p>
          )}
        </div>
      </form>
    </div>
  );
}
