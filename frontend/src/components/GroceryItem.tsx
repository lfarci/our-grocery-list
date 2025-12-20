import { GroceryItem as GroceryItemType } from '../types';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggleDone: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
}

export function GroceryItem({ item, onToggleDone, onDelete }: GroceryItemProps) {
  return (
    <div
      className={`bg-white p-4 rounded-lg shadow flex items-start gap-3 ${
        item.isDone ? 'opacity-60' : ''
      }`}
    >
      {/* Done Toggle */}
      <input
        type="checkbox"
        checked={item.isDone}
        onChange={() => onToggleDone(item.id, !item.isDone)}
        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        aria-label={`Mark ${item.name} as ${item.isDone ? 'not done' : 'done'}`}
      />

      {/* Item Content */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium ${item.isDone ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {item.name}
        </div>
        {item.notes && (
          <div className={`text-sm mt-1 ${item.isDone ? 'text-gray-400' : 'text-gray-600'}`}>
            {item.notes}
          </div>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(item.id)}
        className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1 transition-colors"
        aria-label={`Delete ${item.name}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
