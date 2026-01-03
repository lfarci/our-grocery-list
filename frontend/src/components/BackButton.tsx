interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = 'Back to List' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mb-6 flex items-center gap-2 text-warmcharcoal hover:text-softbrowngray transition-colors"
      aria-label="Back to list"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
