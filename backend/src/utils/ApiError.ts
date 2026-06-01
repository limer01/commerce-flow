// Error type carrying an HTTP status code. Services throw these to signal
// client-facing failures (bad input, auth, not found); the global error
// handler renders them as `{ "error": message }` with the given status.
// Anything that is NOT an ApiError is treated as an unexpected 500.
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
