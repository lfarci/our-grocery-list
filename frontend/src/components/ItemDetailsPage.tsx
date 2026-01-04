import type { GroceryItem, UpdateItemRequest } from '../types';
import { BackButton } from './BackButton';
import { EditableText } from './EditableText';
import { ItemDates } from './ItemDates';
import { PageLayout } from './PageLayout';
import { StatusBadge } from './StatusBadge';

interface ItemDetailsPageProps {
  item: GroceryItem | null | undefined;
  onBack: () => void;
  onUpdate?: (id: string, update: UpdateItemRequest) => Promise<GroceryItem>;
  loading?: boolean;
}

function LoadingState() {
  return (
    <PageLayout>
      <div className="text-center py-12 text-warmcharcoal">Loading...</div>
    </PageLayout>
  );
}

interface NotFoundStateProps {
  onBack: () => void;
}

function NotFoundState({ onBack }: NotFoundStateProps) {
  return (
    <PageLayout>
      <BackButton onClick={onBack} />
      <div className="bg-cream p-8 rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-warmcharcoal mb-4">Item Not Found</h2>
        <p className="text-softbrowngray">
          This item doesn't exist or may have been deleted.
        </p>
      </div>
    </PageLayout>
  );
}

interface ItemDetailsCardProps {
  item: GroceryItem;
  onUpdate?: (id: string, update: UpdateItemRequest) => Promise<GroceryItem>;
}

function ItemDetailsCard({ item, onUpdate }: ItemDetailsCardProps) {
  const handleNameSave = async (newName: string) => {
    if (onUpdate && newName !== item.name) {
      await onUpdate(item.id, { name: newName });
    }
  };

  const handleNotesSave = async (newNotes: string) => {
    if (onUpdate) {
      await onUpdate(item.id, { notes: newNotes || null });
    }
  };

  return (
    <div className="bg-cream p-6 rounded-lg shadow">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          {onUpdate ? (
            <EditableText
              value={item.name}
              onSave={handleNameSave}
              as="h1"
              className="text-3xl font-bold text-warmcharcoal font-display break-words"
              required
              maxLength={100}
            />
          ) : (
            <h1 className="text-3xl font-bold text-warmcharcoal font-display break-words">
              {item.name}
            </h1>
          )}
          <StatusBadge state={item.state} />
        </div>
        <ItemDates createdAt={item.createdAt} updatedAt={item.updatedAt} />
      </header>

      <div className="border-t border-warmsand pt-4">
        <h2 className="text-sm font-semibold text-softbrowngray mb-2">Notes</h2>
        {onUpdate ? (
          <EditableText
            value={item.notes ?? ''}
            onSave={handleNotesSave}
            as="p"
            className="text-warmcharcoal whitespace-pre-wrap break-words"
            placeholder="Add notes..."
            multiline
          />
        ) : (
          <p className="text-warmcharcoal whitespace-pre-wrap break-words">
            {item.notes || <span className="text-softbrowngray italic">No notes</span>}
          </p>
        )}
      </div>
    </div>
  );
}

export function ItemDetailsPage({ item, onBack, onUpdate, loading = false }: ItemDetailsPageProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (!item) {
    return <NotFoundState onBack={onBack} />;
  }

  return (
    <PageLayout>
      <BackButton onClick={onBack} />
      <ItemDetailsCard item={item} onUpdate={onUpdate} />
    </PageLayout>
  );
}
