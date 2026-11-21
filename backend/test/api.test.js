const assert = require('node:assert/strict');
const test = require('node:test');
const { app } = require('../server');

let server;
let baseUrl;

test.before(async () => {
  server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  return { response, body: await response.json() };
}

test('health endpoint reports API status', async () => {
  const { response, body } = await request('/api/health');
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.status, 'ok');
});

test('protected routes reject requests without bearer tokens', async () => {
  const paths = [
    '/api/auth/me',
    '/api/employers/profile',
    '/api/admin/employer-verifications',
    '/api/applications/mine',
    '/api/notifications',
    '/api/saved-opportunities',
  ];

  for (const path of paths) {
    const { response, body } = await request(path);
    assert.equal(response.status, 401, path);
    assert.equal(body.code, 'AUTH_REQUIRED', path);
  }
});

test('database-dependent public listing reports unavailable database', async () => {
  const { response, body } = await request('/api/opportunities');
  assert.equal(response.status, 503);
  assert.equal(body.code, 'DATABASE_UNAVAILABLE');
});

test('database-dependent authentication reports unavailable database', async () => {
  const { response, body } = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'user@example.com', password: 'password' }),
  });
  assert.equal(response.status, 503);
  assert.equal(body.code, 'DATABASE_UNAVAILABLE');
});

test('email verification validates missing token', async () => {
  const { response, body } = await request('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 400);
  assert.equal(body.code, 'VALIDATION_ERROR');
});

test('unknown routes return a structured 404', async () => {
  const { response, body } = await request('/api/does-not-exist');
  assert.equal(response.status, 404);
  assert.equal(body.code, 'ROUTE_NOT_FOUND');
});
