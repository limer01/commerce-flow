// Test environment defaults. Tests must never depend on a developer's local
// .env — set deterministic values here so crypto/JWT helpers and any code
// reading these vars behave consistently in CI and locally.
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
process.env.NODE_ENV = 'test';
