import React from 'react';
import type { GroceryItem } from '../types';

interface GroceryListProps {
  items: GroceryItem[];
  onToggleDone: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
}

/**
 * Displays the list of grocery items.
 */
export const GroceryList: React.FC<GroceryListProps> = ({
  items,
  onToggleDone,
  onDelete,
}) => {
  if (items.length === 0) {
    return (
      <p
        className="mt-8 text-center text-sm text-gray-500"
        role="status"
        aria-live="polite"
      >
        Your list is empty. Add an item using the form above.
      </p>
    );
  }

  // Sort items: not-done first, then done; oldest first within each group
  const sortedItems = [...items].sort((a, b) => {
    if (a.isDone !== b.isDone) {
      return a.isDone ? 1 : -1;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <ul className="space-y-2 mt-6" role="list">
      {sortedItems.map((item) => (
        <li
          key={item.id}
          className={`flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border ${
            item.isDone ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            checked={item.isDone}
            onChange={(e) => onToggleDone(item.id, e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
            aria-label={`Mark "${item.name}" as ${item.isDone ? 'not done' : 'done'}`}
          />
          <div className="flex-1 min-w-0">
            <span
              className={`block font-medium ${
                item.isDone
                  ? 'line-through text-gray-500'
                  : 'text-gray-900'
              }`}
            >
              {item.name}
            </span>
            {item.notes && (
              <span className="block text-sm text-gray-600 mt-1">
                {item.notes}
              </span>
            )}
          </div>
          <button
            onClick={() => onDelete(item.id)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={`Delete "${item.name}"`}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};
