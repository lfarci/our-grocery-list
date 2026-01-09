import { GroceryItem as GroceryItemType, ItemState, CATEGORIES } from '../types';
import { GroceryItem } from './GroceryItem';

interface GroceryItemsListProps {
  items: GroceryItemType[];
  onToggleChecked: (id: string, state: ItemState) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onOpenDetails?: (id: string) => void;
  showCheckbox: boolean;
  archiveLabel: string;
}

export function GroceryItemsList({
  items,
  onToggleChecked,
  onDelete,
  onArchive,
  onOpenDetails,
  showCheckbox,
  archiveLabel,
}: GroceryItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-softbrowngray font-display text-lg">
        Your list is empty. Add something above.
      </div>
    );
  }

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, GroceryItemType[]>);

  return (
    <div className="space-y-6" role="list">
      {CATEGORIES.map((category) => {
        const categoryItems = itemsByCategory[category];
        
        // Only render section if it has items
        if (!categoryItems || categoryItems.length === 0) {
          return null;
        }

        return (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-semibold text-warmcharcoal font-display">
              {category}
            </h2>
            <div className="space-y-3">
              {categoryItems.map((item) => (
                <GroceryItem
                  key={item.id}
                  item={item}
                  onToggleChecked={onToggleChecked}
                  onDelete={onDelete}
                  onArchive={onArchive}
                  onOpenDetails={onOpenDetails}
                  showCheckbox={showCheckbox}
                  archiveLabel={archiveLabel}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
