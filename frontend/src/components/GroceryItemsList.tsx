import { GroceryItem as GroceryItemType, ItemState } from '../types';
import { GroceryItem } from './GroceryItem';

interface GroceryItemsListProps {
  items: GroceryItemType[];
  onToggleChecked: (id: string, state: ItemState) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onOpenDetails?: (id: string) => void;
}

export function GroceryItemsList({ items, onToggleChecked, onDelete, onArchive, onOpenDetails }: GroceryItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-softbrowngray font-display text-lg">
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
          onToggleChecked={onToggleChecked}
          onDelete={onDelete}
          onArchive={onArchive}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
}
