import { useState } from 'react';
import { GroceryItem } from '../types';
import * as api from '../api';

interface ItemDetailsPageProps {
  item: GroceryItem | null | undefined;
  onBack: () => void;
  onUpdate?: () => void;
  loading?: boolean;
}

export function ItemDetailsPage({ item, onBack, onUpdate, loading = false }: ItemDetailsPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Format the creation date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date unavailable';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Date unavailable';
    }
  };

  // Handle entering edit mode
  const handleEdit = () => {
    if (item) {
      setEditedName(item.name);
      setErrorMessage(null);
      setIsEditing(true);
    }
  };

  // Handle canceling edit
  const handleCancel = () => {
    setIsEditing(false);
    setEditedName('');
    setErrorMessage(null);
  };

  // Handle saving the edited name
  const handleSave = async () => {
    if (!item) return;

    const trimmedName = editedName.trim();

    // Validate name
    if (!trimmedName) {
      setErrorMessage('Item name cannot be empty');
      return;
    }

    if (trimmedName.length > 50) {
      setErrorMessage('Item name must be 50 characters or less');
      return;
    }

    // Don't save if name hasn't changed
    if (trimmedName === item.name) {
      setIsEditing(false);
      setEditedName('');
      setErrorMessage(null);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await api.updateItem(item.id, { name: trimmedName });
      setIsEditing(false);
      setEditedName('');
      // Trigger refresh if callback provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update item');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-honey">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12 text-warmcharcoal">Loading...</div>
        </div>
      </div>
    );
  }

  // Handle not-found state
  if (!item) {
    return (
      <div className="min-h-screen bg-honey">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-warmcharcoal hover:text-softbrowngray transition-colors"
            aria-label="Back to list"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to List</span>
          </button>

          <div className="bg-cream p-8 rounded-lg shadow text-center">
            <h2 className="text-2xl font-bold text-warmcharcoal mb-4">Item Not Found</h2>
            <p className="text-softbrowngray">
              This item doesn't exist or may have been deleted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-honey">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-warmcharcoal hover:text-softbrowngray transition-colors"
          aria-label="Back to list"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to List</span>
        </button>

        {/* Item details card */}
        <div className="bg-cream p-6 rounded-lg shadow">
          {/* Edit mode */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="item-name" className="block text-sm font-semibold text-softbrowngray mb-2">
                  Item Name
                </label>
                <input
                  id="item-name"
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-4 py-2 border border-softbrowngray rounded-lg focus:outline-none focus:ring-2 focus:ring-warmcharcoal"
                  maxLength={50}
                  disabled={isSaving}
                  autoFocus
                />
                {errorMessage && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {errorMessage}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-warmcharcoal text-cream px-4 py-2 rounded-lg hover:bg-softbrowngray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 bg-softbrowngray text-cream px-4 py-2 rounded-lg hover:bg-warmcharcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View mode */
            <>
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-warmcharcoal font-display break-words flex-1">
                  {item.name}
                </h1>
                <button
                  onClick={handleEdit}
                  className="ml-4 flex-shrink-0 bg-warmcharcoal text-cream px-4 py-2 rounded-lg hover:bg-softbrowngray transition-colors"
                  aria-label="Edit item name"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-semibold text-softbrowngray mb-1">Created</dt>
                  <dd className="text-lg text-warmcharcoal">{formatDate(item.createdAt)}</dd>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
