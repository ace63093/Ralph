const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeDevice, parseTimestamp } = require('../server/normalize');

test('normalize: output shape + timestamp parsing', () => {
  const raw = {
    id: '123',
    name: 'Device A',
    class: 'Server',
    href: '/api/devices/123',
    orgUnit: '456',
    customerID: '789',
    lastApplianceCheckinTime: '2024-06-01T12:00:00Z'
  };

  const normalized = normalizeDevice(raw);
  assert.equal(normalized.deviceId, '123');
  assert.equal(normalized.longName, 'Device A');
  assert.equal(normalized.deviceClass, 'Server');
  assert.equal(normalized.uri, '/api/devices/123');
  assert.equal(normalized.orgUnitId, '456');
  assert.equal(normalized.customerId, '789');
  assert.equal(normalized.lastCheckinTime, '2024-06-01T12:00:00.000Z');

  assert.equal(parseTimestamp('invalid'), null);
});
