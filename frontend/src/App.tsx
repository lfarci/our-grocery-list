import { useState } from 'react';
import { GroceryList } from './components/GroceryList';
import type { GroceryItem } from './types';

function App() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      notes: notes.trim() || undefined,
      isDone: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems((prev) => [...prev, newItem]);
    setName('');
    setNotes('');
  };

  const handleToggleDone = (id: string, isDone: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isDone, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Our Grocery List
          </h1>
          <p className="text-gray-600">
            Simple shared grocery list for your household
          </p>
        </header>

        {/* Add Item Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="item-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Milk, Bread, Eggs"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
              />
            </div>

            <div>
              <label
                htmlFor="item-notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes (optional)
              </label>
              <input
                type="text"
                id="item-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., 2 gallons, whole wheat"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Add Item
            </button>
          </div>
        </form>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Shopping List ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h2>
          <GroceryList
            items={items}
            onToggleDone={handleToggleDone}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

