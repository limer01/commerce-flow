import axios from 'axios';

// Extracts the backend's `{ error: string }` message from a failed request,
// falling back to a generic message for network/unexpected errors. Every API
// error in this app follows that shape (enforced server-side).
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const message = (err.response?.data as { error?: string } | undefined)?.error;
    if (message) return message;
  }
  return fallback;
}
