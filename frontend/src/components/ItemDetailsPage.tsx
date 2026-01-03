import { GroceryItem } from '../types';

interface ItemDetailsPageProps {
  item: GroceryItem | null;
  onBack: () => void;
}

export function ItemDetailsPage({ item, onBack }: ItemDetailsPageProps) {
  // Format the creation date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          <h1 className="text-3xl font-bold text-warmcharcoal mb-6 font-display break-words">
            {item.name}
          </h1>

          <div className="space-y-4">
            <div>
              <dt className="text-sm font-semibold text-softbrowngray mb-1">Created</dt>
              <dd className="text-lg text-warmcharcoal">{formatDate(item.createdAt)}</dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
