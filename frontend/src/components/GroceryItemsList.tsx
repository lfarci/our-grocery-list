import { GroceryItem as GroceryItemType } from '../types';
import { GroceryItem } from './GroceryItem';

interface GroceryItemsListProps {
  items: GroceryItemType[];
  onToggleDone: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
}

export function GroceryItemsList({ items, onToggleDone, onDelete }: GroceryItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Your list is empty. Add something above.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <GroceryItem
          key={item.id}
          item={item}
          onToggleDone={onToggleDone}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
