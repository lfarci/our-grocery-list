import { FormEvent, useEffect } from 'react';
import { GroceryItem, QuantityUnit } from '../types';
import { QUANTITY_UNITS } from '../constants';
import { ItemSuggestions } from './ItemSuggestions';

interface AddItemFormProps {
  name: string;
  quantity: string;
  quantityUnit: QuantityUnit | '';
  error: string;
  onNameChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onQuantityUnitChange: (value: QuantityUnit | '') => void;
  onSubmit: (e: FormEvent) => void;
  suggestions: GroceryItem[];
  onSelectSuggestion: (item: GroceryItem) => void;
  showSuggestions: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  formRef: React.RefObject<HTMLDivElement | null>;
}

export function AddItemForm({ 
  name, 
  quantity,
  quantityUnit,
  error, 
  onNameChange, 
  onQuantityChange,
  onQuantityUnitChange,
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
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="quantity" className="sr-only">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => onQuantityChange(e.target.value)}
                  placeholder="Quantity"
                  inputMode="decimal"
                  className="w-full px-3 py-2 border border-warmsand rounded-md focus:outline-none focus:ring-2 focus:ring-softblue focus:border-transparent bg-cream text-warmcharcoal"
                />
              </div>
              <div>
                <label htmlFor="quantityUnit" className="sr-only">Unit</label>
                <select
                  id="quantityUnit"
                  value={quantityUnit}
                  onChange={(e) => onQuantityUnitChange(e.target.value as QuantityUnit | '')}
                  className="w-full px-3 py-2 border border-warmsand rounded-md focus:outline-none focus:ring-2 focus:ring-softblue focus:border-transparent bg-cream text-warmcharcoal"
                >
                  <option value="">Unit</option>
                  {QUANTITY_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {error && (
              <p className="text-mutedcoral text-sm font-semibold">{error}</p>
            )}
            <button
              type="submit"
              className="bg-softblue text-cream px-4 py-2 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-softblue focus:ring-offset-2 transition-colors cursor-pointer ml-auto"
              aria-label="Add Item"
            >
              Add Item
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
