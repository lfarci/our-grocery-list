import { GroceryItem } from '../types';

interface ItemSuggestionsProps {
  suggestions: GroceryItem[];
  onSelect: (item: GroceryItem) => void;
  onAddNew: () => void;
  searchQuery: string;
}

export function ItemSuggestions({ 
  suggestions, 
  onSelect, 
  onAddNew, 
  searchQuery 
}: ItemSuggestionsProps) {
  if (suggestions.length === 0 && !searchQuery) {
    return null;
  }

  const activeSuggestions = suggestions.filter(item => item.state === 'active');
  const archivedSuggestions = suggestions.filter(item => item.state === 'archived');
  const hasExactActiveMatch = activeSuggestions.some(
    item => item.name.toLowerCase() === searchQuery.toLowerCase()
  );
  const hasExactArchivedMatch = archivedSuggestions.some(
    item => item.name.toLowerCase() === searchQuery.toLowerCase()
  );
  
  // Show "Add new" button logic:
  // - Always show if there's a search query, unless...
  // - Hide if there's an exact archived match (user should restore instead)
  const shouldShowAddButton = searchQuery && !hasExactArchivedMatch;
  const addButtonText = hasExactActiveMatch 
    ? `Add another "${searchQuery}"`
    : `Add "${searchQuery}" as new item`;

  return (
    <div className="absolute z-10 w-full mt-1 bg-cream border border-warmsand rounded-md shadow-lg max-h-60 overflow-auto">
      {archivedSuggestions.length > 0 && (
        <div className="py-1">
          <div className="px-3 py-1 text-xs font-semibold text-warmcharcoal bg-warmsand">
            Recently Used (Archived)
          </div>
          {archivedSuggestions.map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-left px-3 py-2 hover:bg-softblue hover:bg-opacity-10 cursor-pointer flex items-center gap-2"
            >
              <svg 
                className="w-4 h-4 text-warmcharcoal" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-warmcharcoal">{item.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {activeSuggestions.length > 0 && (
        <div className="py-1">
          <div className="px-3 py-1 text-xs font-semibold text-warmcharcoal bg-warmsand">
            Already in List
          </div>
          {activeSuggestions.map(item => (
            <div
              key={item.id}
              className="px-3 py-2 text-warmcharcoal opacity-60 flex items-center gap-2"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{item.name}</span>
              <span className="text-xs ml-auto">(already added)</span>
            </div>
          ))}
        </div>
      )}

      {shouldShowAddButton && (
        <div className="py-1 border-t border-warmsand">
          <button
            onClick={onAddNew}
            className="w-full text-left px-3 py-2 hover:bg-softblue hover:bg-opacity-10 cursor-pointer flex items-center gap-2 font-semibold text-softblue"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{addButtonText}</span>
          </button>
        </div>
      )}
    </div>
  );
}
