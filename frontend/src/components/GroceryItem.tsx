import { GroceryItem as GroceryItemType, ItemState } from '../types';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggleChecked: (id: string, state: ItemState) => void;
  onDelete: (id: string) => void;
}

export function GroceryItem({ item, onToggleChecked, onDelete }: GroceryItemProps) {
  const isChecked = item.state === 'checked';

  return (
    <div
      className={`p-4 rounded-lg shadow flex items-start gap-3 ${
        isChecked ? 'bg-softmint' : 'bg-cream'
      }`}
    >
      {/* Done Toggle */}
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => onToggleChecked(item.id, isChecked ? 'active' : 'checked')}
        className="mt-1 h-5 w-5 rounded border-warmsand text-freshgreen focus:ring-softblue cursor-pointer"
        aria-label={`Mark ${item.name} as ${isChecked ? 'not checked' : 'checked'}`}
      />

      {/* Item Content */}
      <div className="flex-1 min-w-0">
        <div className={`font-semibold break-words ${isChecked ? 'line-through text-softbrowngray' : 'text-warmcharcoal'}`}>
          {item.name}
        </div>
        {item.notes && (
          <div className={`text-sm mt-1 break-words text-softbrowngray`}>
            {item.notes}
          </div>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(item.id)}
        className="text-mutedcoral hover:text-opacity-80 focus:outline-none focus:ring-2 focus:ring-softblue rounded p-1 transition-colors cursor-pointer"
        aria-label={`Delete ${item.name}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
