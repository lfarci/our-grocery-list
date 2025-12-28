interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-800 font-semibold">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 text-red-600 hover:text-red-800 underline cursor-pointer font-semibold"
      >
        Retry
      </button>
    </div>
  );
}
