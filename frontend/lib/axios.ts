import axios from 'axios';

// Shared axios instance for all client-side API calls.
// The base URL is read from NEXT_PUBLIC_API_URL and is NEVER hardcoded;
// it defaults to the local backend dev server. withCredentials is required
// so the httpOnly JWT cookie is forwarded on every request.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000',
  withCredentials: true,
});
