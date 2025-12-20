import { useState, FormEvent } from 'react';
import { useGroceryList } from '../hooks';

export function GroceryList() {
  const { items, loading, error, loadItems, addItem, toggleDone, removeItem } = useGroceryList();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setFormError('Please enter an item name');
      return;
    }

    try {
      await addItem({ name: name.trim(), notes: notes.trim() || undefined });
      setName('');
      setNotes('');
      setFormError('');
    } catch (err) {
      setFormError('Failed to add item. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Our Grocery List
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadItems}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Add Item Form */}
        <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Milk"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity/Notes (optional)
              </label>
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., 2 gallons, whole milk"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {formError && (
              <p className="text-red-600 text-sm">{formError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add Item
            </button>
          </div>
        </form>

        {/* Items List */}
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Your list is empty. Add something above.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white p-4 rounded-lg shadow flex items-start gap-3 ${
                  item.isDone ? 'opacity-60' : ''
                }`}
              >
                {/* Done Toggle */}
                <input
                  type="checkbox"
                  checked={item.isDone}
                  onChange={() => toggleDone(item.id, !item.isDone)}
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
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1 transition-colors"
                  aria-label={`Delete ${item.name}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
