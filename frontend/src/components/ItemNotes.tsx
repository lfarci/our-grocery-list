interface ItemNotesProps {
  notes: string;
}

export function ItemNotes({ notes }: ItemNotesProps) {
  return (
    <div className="border-t border-warmsand pt-4">
      <h2 className="text-sm font-semibold text-softbrowngray mb-2">Notes</h2>
      <p className="text-warmcharcoal whitespace-pre-wrap break-words">{notes}</p>
    </div>
  );
}
