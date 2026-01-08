import { useEffect, useState } from 'react';
import type { GroceryItem, QuantityUnit, UpdateItemRequest } from '../types';
import { QUANTITY_UNITS } from '../constants';
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
      <div className="bg-softwhitecream p-8 rounded-xl shadow-sm border border-warmsand text-center">
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
  const [quantityValue, setQuantityValue] = useState(item.quantity?.toString() ?? '');
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit | ''>(item.quantityUnit ?? '');
  const [isSavingQuantity, setIsSavingQuantity] = useState(false);

  useEffect(() => {
    setQuantityValue(item.quantity?.toString() ?? '');
    setQuantityUnit(item.quantityUnit ?? '');
  }, [item.quantity, item.quantityUnit]);

  const revertQuantityToOriginal = () => {
    setQuantityValue(item.quantity?.toString() ?? '');
    setQuantityUnit(item.quantityUnit ?? '');
  };

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

  const saveQuantity = async (newQuantityValue: string, newQuantityUnit: QuantityUnit | '') => {
    if (!onUpdate) {
      return;
    }

    const trimmed = newQuantityValue.trim();
    const parsedQuantity = trimmed ? Number(trimmed) : null;

    if (parsedQuantity !== null && Number.isNaN(parsedQuantity)) {
      revertQuantityToOriginal();
      return;
    }

    // Reject negative quantities
    if (parsedQuantity !== null && parsedQuantity < 0) {
      revertQuantityToOriginal();
      return;
    }

    const normalizedUnit = parsedQuantity !== null ? (newQuantityUnit || null) : null;

    if (parsedQuantity === item.quantity && normalizedUnit === (item.quantityUnit ?? null)) {
      return;
    }

    setIsSavingQuantity(true);
    try {
      await onUpdate(item.id, { quantity: parsedQuantity, quantityUnit: normalizedUnit });
    } finally {
      setIsSavingQuantity(false);
    }
  };

  const handleQuantityBlur = async () => {
    await saveQuantity(quantityValue, quantityUnit);
  };

  const handleUnitChange = async (newUnit: QuantityUnit | '') => {
    setQuantityUnit(newUnit);
    await saveQuantity(quantityValue, newUnit);
  };

  return (
    <div className="bg-softwhitecream p-6 rounded-xl shadow-sm border border-warmsand">
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

      <div className="border-t border-warmsand pt-4 mt-6">
        <h2 className="text-sm font-semibold text-softbrowngray mb-2">Quantity</h2>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div>
            <label htmlFor="details-quantity" className="sr-only">Quantity</label>
            <input
              id="details-quantity"
              type="number"
              inputMode="decimal"
              min="0"
              value={quantityValue}
              onChange={(e) => setQuantityValue(e.target.value)}
              onBlur={handleQuantityBlur}
              disabled={isSavingQuantity}
              className="w-full px-3 py-2 border border-warmsand rounded-md focus:outline-none focus:ring-2 focus:ring-softblue focus:border-transparent bg-softwhitecream text-warmcharcoal placeholder:text-softbrowngray"
              placeholder="Enter quantity"
            />
          </div>
          <div>
            <label htmlFor="details-quantity-unit" className="sr-only">Unit</label>
            <select
              id="details-quantity-unit"
              value={quantityUnit}
              onChange={(e) => handleUnitChange(e.target.value as QuantityUnit | '')}
              disabled={isSavingQuantity}
              className="w-full px-3 py-2 border border-warmsand rounded-md focus:outline-none focus:ring-2 focus:ring-softblue focus:border-transparent bg-softwhitecream text-warmcharcoal"
            >
              <option value="">Unit</option>
              {QUANTITY_UNITS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>
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
