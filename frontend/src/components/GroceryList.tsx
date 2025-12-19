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
    return <p>Your list is empty. Add something above.</p>;
  }

  // Sort items: not-done first, then done; oldest first within each group
  const sortedItems = [...items].sort((a, b) => {
    if (a.isDone !== b.isDone) {
      return a.isDone ? 1 : -1;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <ul>
      {sortedItems.map((item) => (
        <li key={item.id}>
          <input
            type="checkbox"
            checked={item.isDone}
            onChange={(e) => onToggleDone(item.id, e.target.checked)}
          />
          <span style={{ textDecoration: item.isDone ? 'line-through' : 'none' }}>
            {item.name}
          </span>
          {item.notes && <span> — {item.notes}</span>}
          <button onClick={() => onDelete(item.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};
