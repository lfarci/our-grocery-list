import { useState, FormEvent } from 'react';
import { useGroceryList } from '../hooks';
import { ErrorMessage } from './ErrorMessage';
import { AddItemForm } from './AddItemForm';
import { GroceryItemsList } from './GroceryItemsList';

const MAX_NAME_LENGTH = 50;
const MAX_NOTES_LENGTH = 50;

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

    if (name.trim().length > MAX_NAME_LENGTH) {
      setFormError(`Item name must be ${MAX_NAME_LENGTH} characters or less`);
      return;
    }

    if (notes.trim().length > MAX_NOTES_LENGTH) {
      setFormError(`Notes must be ${MAX_NOTES_LENGTH} characters or less`);
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
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Our Grocery List
        </h1>

        {error && <ErrorMessage message={error} onRetry={loadItems} />}

        <AddItemForm
          name={name}
          notes={notes}
          error={formError}
          onNameChange={setName}
          onNotesChange={setNotes}
          onSubmit={handleSubmit}
        />

        <GroceryItemsList
          items={items}
          onToggleDone={toggleDone}
          onDelete={removeItem}
        />
      </div>
    </div>
  );
}
