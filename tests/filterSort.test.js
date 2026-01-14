const test = require('node:test');
const assert = require('node:assert/strict');
const { bucketizeDevice, sortDevices } = require('../public/app');

test('bucketization: <=30, <=90, >90, unknown', () => {
  const now = new Date('2024-07-01T00:00:00Z');
  assert.equal(bucketizeDevice('2024-06-15T00:00:00Z', now), 'le30');
  assert.equal(bucketizeDevice('2024-04-15T00:00:00Z', now), 'le90');
  assert.equal(bucketizeDevice('2024-01-01T00:00:00Z', now), 'gt90');
  assert.equal(bucketizeDevice(null, now), 'unknown');
  assert.equal(bucketizeDevice('not-a-date', now), 'unknown');
});

test('sorting: name, customerId, lastCheckinTime', () => {
  const devices = [
    { longName: 'Bravo', customerId: '200', lastCheckinTime: '2024-06-01T00:00:00Z' },
    { longName: 'alpha', customerId: '100', lastCheckinTime: null },
    { longName: 'Charlie', customerId: '300', lastCheckinTime: '2024-05-01T00:00:00Z' }
  ];

  const byName = sortDevices(devices, 'longName', 'asc');
  assert.equal(byName[0].longName, 'alpha');

  const byCustomer = sortDevices(devices, 'customerId', 'desc');
  assert.equal(byCustomer[0].customerId, '300');

  const byCheckin = sortDevices(devices, 'lastCheckinTime', 'asc');
  assert.equal(byCheckin[0].lastCheckinTime, '2024-05-01T00:00:00Z');
  assert.equal(byCheckin[2].lastCheckinTime, null);
});
