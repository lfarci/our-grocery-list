import { formatRelativeDate, areDatesDifferent, formatDate } from '../utils/formatDate';

interface ItemDatesProps {
  createdAt: string;
  updatedAt: string;
}

export function ItemDates({ createdAt, updatedAt }: ItemDatesProps) {
  const wasUpdated = areDatesDifferent(createdAt, updatedAt);

  return (
    <p className="text-sm text-softbrowngray mt-1" title={`Created: ${formatDate(createdAt)}${wasUpdated ? `\nUpdated: ${formatDate(updatedAt)}` : ''}`}>
      Added {formatRelativeDate(createdAt)}
      {wasUpdated && (
        <span className="mx-1">·</span>
      )}
      {wasUpdated && (
        <span>edited {formatRelativeDate(updatedAt)}</span>
      )}
    </p>
  );
}
