import { useState, FormEvent, useCallback, useEffect, useRef } from 'react';
import { ErrorMessage } from './ErrorMessage';
import { AddItemForm } from './AddItemForm';
import { GroceryItemsList } from './GroceryItemsList';
import { CreateItemRequest, GroceryItem, ItemState, QuantityUnit } from '../types';
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
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit | ''>('');
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

  const buildQuantityPayload = useCallback(() => {
    const parsedQuantity = quantity.trim() ? Number(quantity) : null;
    if (parsedQuantity !== null && Number.isNaN(parsedQuantity)) {
      setFormError('Quantity must be a number');
      return null;
    }

    if (parsedQuantity !== null && !quantityUnit) {
      setFormError('Please select a unit for the quantity');
      return null;
    }

    return {
      quantity: parsedQuantity,
      quantityUnit: parsedQuantity !== null ? quantityUnit : null,
    };
  }, [quantity, quantityUnit]);

  const handleSelectSuggestion = useCallback(async (item: GroceryItem) => {
    if (item.state === 'archived') {
      // Unarchive and restore to active list immediately
      try {
        await toggleChecked(item.id, 'active');
        setName('');
        setQuantity('');
        setQuantityUnit('');
        setFormError('');
        inputRef.current?.focus();
      } catch {
        setFormError('Failed to restore item. Please try again.');
      }
    } else if (item.state === 'active') {
      // Allow creating a duplicate of an active item
      try {
        const quantityPayload = buildQuantityPayload();
        if (!quantityPayload) {
          return;
        }

        await addItem({ name: item.name, ...quantityPayload });
        setName('');
        setQuantity('');
        setQuantityUnit('');
        setFormError('');
        inputRef.current?.focus();
      } catch {
        setFormError('Failed to add item. Please try again.');
      }
    }
  }, [toggleChecked, addItem, buildQuantityPayload]);

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

    const quantityPayload = buildQuantityPayload();
    if (!quantityPayload) {
      return;
    }

    try {
      await addItem({ 
        name: name.trim(),
        ...quantityPayload,
      });
      setName('');
      setQuantity('');
      setQuantityUnit('');
      setFormError('');
      inputRef.current?.focus();
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
          quantity={quantity}
          quantityUnit={quantityUnit}
          error={formError}
          onNameChange={handleNameChange}
          onQuantityChange={setQuantity}
          onQuantityUnitChange={setQuantityUnit}
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
          onOpenDetails={onOpenDetails}
        />
      </div>
    </div>
  );
}
