interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="mb-4 p-4 bg-softwhite border border-mutedcoral rounded-lg shadow-sm">
      <p className="text-warmcharcoal font-semibold">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 text-mutedcoral hover:text-opacity-80 underline cursor-pointer font-semibold"
      >
        Retry
      </button>
    </div>
  );
}
