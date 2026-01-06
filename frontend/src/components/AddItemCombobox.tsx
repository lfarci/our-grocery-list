import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react';
import { GroceryItem } from '../types';

interface AddItemComboboxProps {
  suggestions: GroceryItem[];
  onAddItem: (name: string) => Promise<void>;
  onRestoreArchivedItem: (item: GroceryItem) => Promise<void>;
  onDuplicateActiveItem: (item: GroceryItem) => Promise<void>;
  onSearchQueryChange: (query: string) => void;
  error?: string;
}

interface DropdownOption {
  id: string;
  type: 'archived' | 'active' | 'add-new';
  item?: GroceryItem;
  label: string;
  sublabel?: string;
}

export function AddItemCombobox({
  suggestions,
  onAddItem,
  onRestoreArchivedItem,
  onDuplicateActiveItem,
  onSearchQueryChange,
  error,
}: AddItemComboboxProps) {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownMaxHeightRef = useRef<number>(300);

  const listboxId = 'grocery-listbox';
  
  // Calculate dropdown options
  const trimmedValue = value.trim();
  const shouldShowDropdown = trimmedValue.length >= 2;
  
  const options: DropdownOption[] = [];
  
  if (shouldShowDropdown) {
    const archivedSuggestions = suggestions.filter(item => item.state === 'archived');
    const activeSuggestions = suggestions.filter(item => item.state === 'active');
    
    // Add archived items first (Recently Used)
    archivedSuggestions.forEach(item => {
      options.push({
        id: `archived-${item.id}`,
        type: 'archived',
        item,
        label: item.name,
      });
    });
    
    // Add active items (Already in List)
    activeSuggestions.forEach(item => {
      options.push({
        id: `active-${item.id}`,
        type: 'active',
        item,
        label: item.name,
        sublabel: '(add another)',
      });
    });
    
    // Add "Add new" option if no exact archived match
    const hasExactArchivedMatch = archivedSuggestions.some(
      item => item.name.toLowerCase() === trimmedValue.toLowerCase()
    );
    
    if (!hasExactArchivedMatch) {
      const hasExactActiveMatch = activeSuggestions.some(
        item => item.name.toLowerCase() === trimmedValue.toLowerCase()
      );
      
      const label = hasExactActiveMatch
        ? `Add another "${trimmedValue}"`
        : `Add "${trimmedValue}"`;
      
      options.push({
        id: 'add-new',
        type: 'add-new',
        label,
      });
    }
  }
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Measure available viewport space for dropdown
  useEffect(() => {
    if (!isOpen || !inputRef.current) return;
    
    const measureDropdownSpace = () => {
      const inputRect = inputRef.current!.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const availableSpace = viewportHeight - inputRect.bottom - 16; // 16px padding
      dropdownMaxHeightRef.current = Math.max(150, Math.min(availableSpace, 400));
    };
    
    measureDropdownSpace();
    
    // Re-measure when viewport changes (e.g., mobile keyboard appears)
    const handleResize = () => measureDropdownSpace();
    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);
  
  // Open dropdown when typing >= 2 chars
  useEffect(() => {
    if (shouldShowDropdown && !isOpen) {
      setIsOpen(true);
      setHighlightedIndex(0);
    } else if (!shouldShowDropdown && isOpen) {
      setIsOpen(false);
    }
  }, [shouldShowDropdown, isOpen]);
  
  // Announce results when dropdown opens or updates
  useEffect(() => {
    if (isOpen && options.length > 0) {
      const archivedCount = options.filter(o => o.type === 'archived').length;
      const activeCount = options.filter(o => o.type === 'active').length;
      const hasAddNew = options.some(o => o.type === 'add-new');
      
      let message = `${options.length} ${options.length === 1 ? 'option' : 'options'} available`;
      
      if (archivedCount > 0 || activeCount > 0) {
        const parts = [];
        if (archivedCount > 0) parts.push(`${archivedCount} recently used`);
        if (activeCount > 0) parts.push(`${activeCount} already in list`);
        if (hasAddNew) parts.push('1 add new');
        message = parts.join(', ') + ' available';
      }
      
      setAnnouncement(message);
    } else if (isOpen && options.length === 0) {
      setAnnouncement('No suggestions available');
    }
  }, [isOpen, options.length]);
  
  // Reset highlight when options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [options.length]);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (value.trim()) {
          setValue('');
          setIsOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);
  
  const handleInputChange = useCallback((newValue: string) => {
    setValue(newValue);
    onSearchQueryChange(newValue);
  }, [onSearchQueryChange]);
  
  const handleClear = useCallback(() => {
    setValue('');
    setIsOpen(false);
    inputRef.current?.focus();
    setAnnouncement('Input cleared');
  }, []);
  
  const handleSelectOption = useCallback(async (option: DropdownOption) => {
    try {
      if (option.type === 'archived' && option.item) {
        await onRestoreArchivedItem(option.item);
        setAnnouncement(`Added ${option.item.name}`);
      } else if (option.type === 'active' && option.item) {
        await onDuplicateActiveItem(option.item);
        setAnnouncement(`Added another ${option.item.name}`);
      } else if (option.type === 'add-new') {
        await onAddItem(trimmedValue);
        setAnnouncement(`Added ${trimmedValue}`);
      }
      
      setValue('');
      setIsOpen(false);
      setHighlightedIndex(0);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  }, [trimmedValue, onAddItem, onRestoreArchivedItem, onDuplicateActiveItem]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      // If dropdown is closed and user presses Enter, try to add as new item
      if (e.key === 'Enter' && trimmedValue.length > 0) {
        e.preventDefault();
        handleSelectOption({
          id: 'add-new',
          type: 'add-new',
          label: `Add "${trimmedValue}"`,
        });
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (options[highlightedIndex]) {
          handleSelectOption(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        // Allow default tab behavior
        setIsOpen(false);
        break;
    }
  }, [isOpen, options, highlightedIndex, trimmedValue, handleSelectOption]);
  
  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const highlightedElement = listboxRef.current.querySelector(`#${options[highlightedIndex]?.id}`);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen, options]);
  
  const activeDescendant = isOpen && options[highlightedIndex] 
    ? options[highlightedIndex].id 
    : undefined;
  
  return (
    <div ref={containerRef} className="sticky top-0 z-10 bg-honey pb-4">
      <div className="relative">
        <label htmlFor="grocery-input" className="sr-only">
          Add item to grocery list
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id="grocery-input"
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            aria-autocomplete="list"
            aria-label="Add item to grocery list"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add an item..."
            className="w-full px-3 py-3 pr-10 border-2 border-warmsand rounded-lg focus:outline-none focus:ring-2 focus:ring-softblue focus:border-transparent bg-cream text-warmcharcoal text-base shadow-sm"
            autoComplete="off"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear input"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-warmcharcoal hover:text-softblue focus:outline-none focus:ring-2 focus:ring-softblue rounded p-1"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {isOpen && options.length > 0 && (
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label="Grocery item suggestions"
            className="absolute w-full mt-1 bg-cream border-2 border-warmsand rounded-lg shadow-lg overflow-auto"
            style={{ maxHeight: `${dropdownMaxHeightRef.current}px` }}
          >
            {/* Archived items section */}
            {options.some(o => o.type === 'archived') && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-warmcharcoal bg-warmsand sticky top-0">
                  Recently Used (Archived)
                </div>
                {options.filter(o => o.type === 'archived').map((option) => {
                  const globalIndex = options.indexOf(option);
                  const isHighlighted = globalIndex === highlightedIndex;
                  return (
                    <div
                      key={option.id}
                      id={option.id}
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
                        handleSelectOption(option);
                      }}
                      className={`
                        px-3 py-3 cursor-pointer flex items-center gap-2 min-h-[44px]
                        ${isHighlighted 
                          ? 'bg-softblue text-cream border-l-4 border-warmcharcoal font-semibold' 
                          : 'hover:bg-softblue hover:bg-opacity-10'}
                      `}
                    >
                      <svg 
                        className={`w-5 h-5 flex-shrink-0 ${isHighlighted ? 'text-cream' : 'text-warmcharcoal'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className={isHighlighted ? 'text-cream' : 'text-warmcharcoal'}>{option.label}</span>
                    </div>
                  );
                })}
              </>
            )}
            
            {/* Active items section */}
            {options.some(o => o.type === 'active') && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-warmcharcoal bg-warmsand sticky top-0">
                  Already in List
                </div>
                {options.filter(o => o.type === 'active').map((option) => {
                  const globalIndex = options.indexOf(option);
                  const isHighlighted = globalIndex === highlightedIndex;
                  return (
                    <div
                      key={option.id}
                      id={option.id}
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectOption(option);
                      }}
                      className={`
                        px-3 py-3 cursor-pointer flex items-center gap-2 min-h-[44px]
                        ${isHighlighted 
                          ? 'bg-softblue text-cream border-l-4 border-warmcharcoal font-semibold' 
                          : 'hover:bg-softblue hover:bg-opacity-10'}
                      `}
                    >
                      <svg 
                        className={`w-5 h-5 flex-shrink-0 ${isHighlighted ? 'text-cream' : 'text-warmcharcoal'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className={isHighlighted ? 'text-cream' : 'text-warmcharcoal'}>{option.label}</span>
                      {option.sublabel && (
                        <span className={`text-xs ml-auto opacity-60 ${isHighlighted ? 'text-cream' : 'text-warmcharcoal'}`}>{option.sublabel}</span>
                      )}
                    </div>
                  );
                })}
              </>
            )}
            
            {/* Add new option */}
            {options.some(o => o.type === 'add-new') && (
              <>
                {(options.some(o => o.type === 'archived') || options.some(o => o.type === 'active')) && (
                  <div className="border-t-2 border-warmsand" />
                )}
                {options.filter(o => o.type === 'add-new').map((option) => {
                  const globalIndex = options.indexOf(option);
                  const isHighlighted = globalIndex === highlightedIndex;
                  return (
                    <div
                      key={option.id}
                      id={option.id}
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectOption(option);
                      }}
                      className={`
                        px-3 py-3 cursor-pointer flex items-center gap-2 font-semibold min-h-[44px]
                        ${isHighlighted 
                          ? 'bg-softblue text-cream border-l-4 border-warmcharcoal' 
                          : 'text-softblue hover:bg-softblue hover:bg-opacity-10'}
                      `}
                    >
                      <svg 
                        className={`w-5 h-5 flex-shrink-0 ${isHighlighted ? 'text-cream' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>{option.label}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
        
        {error && (
          <p className="mt-2 text-mutedcoral text-sm font-semibold">{error}</p>
        )}
      </div>
      
      {/* Screen reader live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}
