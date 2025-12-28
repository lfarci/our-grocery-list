import { FormEvent } from 'react';

interface AddItemFormProps {
  name: string;
  notes: string;
  error: string;
  onNameChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function AddItemForm({ 
  name, 
  notes, 
  error, 
  onNameChange, 
  onNotesChange, 
  onSubmit
}: AddItemFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-6 bg-cream p-4 rounded-lg shadow">
      <div className="space-y-3">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-warmcharcoal mb-1">
            Item Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g., Milk"
            className="w-full px-3 py-2 border border-warmsand rounded-md focus:outline-none focus:ring-2 focus:ring-softblue focus:border-transparent bg-cream text-warmcharcoal"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-warmcharcoal mb-1">
            Quantity/Notes (optional)
          </label>
          <input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="e.g., 2 gallons, whole milk"
            className="w-full px-3 py-2 border border-warmsand rounded-md focus:outline-none focus:ring-2 focus:ring-softblue focus:border-transparent bg-cream text-warmcharcoal"
          />
        </div>
        {error && (
          <p className="text-mutedcoral text-sm font-semibold">{error}</p>
        )}
        <button
          type="submit"
          className="w-full bg-softblue text-cream py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-softblue focus:ring-offset-2 transition-colors cursor-pointer font-semibold"
        >
          Add Item
        </button>
      </div>
    </form>
  );
}
