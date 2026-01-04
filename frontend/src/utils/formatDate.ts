/**
 * Formats a date string for display.
 * Returns a human-readable date with time.
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Date unavailable';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Date unavailable';
  }
}

/**
 * Formats a date as relative time (e.g., "just now", "5 minutes ago", "yesterday")
 * Falls back to short date format for older dates.
 */
export function formatRelativeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Date unavailable';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffDays === 1) {
      return 'yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    // For older dates, use short format
    const isThisYear = date.getFullYear() === now.getFullYear();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(isThisYear ? {} : { year: 'numeric' }),
    });
  } catch {
    return 'Date unavailable';
  }
}

/**
 * Checks if two date strings represent different times
 */
export function areDatesDifferent(date1: string, date2: string): boolean {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d1.getTime() - d2.getTime());
    return diffMs > 0;
  } catch {
    return false;
  }
}
