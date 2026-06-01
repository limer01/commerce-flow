import request from 'supertest';
import { createApp } from './app';

describe('GET /health', () => {
  const app = createApp();

  it('returns 200 with { status: "ok" }', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('CORS', () => {
  const app = createApp();

  it('allows the frontend origin with credentials', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:3000');

    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000'
    );
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
