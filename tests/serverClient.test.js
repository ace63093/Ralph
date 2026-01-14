const test = require('node:test');
const assert = require('node:assert/strict');
const { createNcentralClient } = require('../server/ncentralClient');

function createMockFetch(responders) {
  const calls = [];
  const fetchFn = async (url, options = {}) => {
    const responder = responders.shift();
    if (!responder) {
      throw new Error(`No responder left for ${url}`);
    }
    calls.push({ url, options });
    return responder(url, options);
  };
  fetchFn.calls = calls;
  return fetchFn;
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

test('server client caches authentication token', async () => {
  const fetchFn = createMockFetch([
    () => jsonResponse(200, { accessToken: 'token-1', refreshToken: 'refresh-1' }),
    () => jsonResponse(200, []),
    () => jsonResponse(200, [])
  ]);

  const client = createNcentralClient({
    baseUrl: 'https://example.test',
    userJwt: 'user-jwt',
    pageSize: 1,
    fetchFn
  });

  await client.listDevices();
  await client.listDevices();

  const authCalls = fetchFn.calls.filter((call) => call.url.includes('/api/auth/authenticate'));
  assert.equal(authCalls.length, 1);
});

test('server client refreshes access token when needed', async () => {
  const fetchFn = createMockFetch([
    () => jsonResponse(200, { accessToken: 'token-2', refreshToken: 'refresh-2' }),
    () => jsonResponse(200, [])
  ]);

  const client = createNcentralClient({
    baseUrl: 'https://example.test',
    userJwt: 'user-jwt',
    pageSize: 1,
    fetchFn
  });

  client._tokenCache.refreshToken = 'refresh-existing';
  client._tokenCache.accessToken = null;

  await client.listDevices();

  const refreshCalls = fetchFn.calls.filter((call) => call.url.includes('/api/auth/refresh'));
  assert.equal(refreshCalls.length, 1);
});

test('server client retries once on 401', async () => {
  const fetchFn = createMockFetch([
    () => jsonResponse(200, { accessToken: 'token-3', refreshToken: 'refresh-3' }),
    () => new Response('Unauthorized', { status: 401 }),
    () => jsonResponse(200, { accessToken: 'token-4', refreshToken: 'refresh-4' }),
    () => jsonResponse(200, [])
  ]);

  const client = createNcentralClient({
    baseUrl: 'https://example.test',
    userJwt: 'user-jwt',
    pageSize: 1,
    fetchFn
  });

  await client.listDevices();

  const authCalls = fetchFn.calls.filter((call) => call.url.includes('/api/auth/authenticate'));
  assert.equal(authCalls.length, 2);
});
