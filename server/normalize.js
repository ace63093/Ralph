function parseTimestamp(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function normalizeDevice(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      deviceId: null,
      longName: null,
      deviceClass: null,
      uri: null,
      orgUnitId: null,
      customerId: null,
      lastCheckinTime: null
    };
  }

  const lastCheckin = raw.lastApplianceCheckinTime
    || raw.lastCheckinTime
    || raw.lastCheckin
    || raw.lastSeen
    || null;

  return {
    deviceId: raw.deviceId ?? raw.id ?? null,
    longName: raw.longName ?? raw.name ?? raw.deviceName ?? null,
    deviceClass: raw.deviceClass ?? raw.class ?? raw.deviceType ?? null,
    uri: raw.uri ?? raw.href ?? null,
    orgUnitId: raw.orgUnitId ?? raw.orgUnit ?? null,
    customerId: raw.customerId ?? raw.customerID ?? null,
    lastCheckinTime: parseTimestamp(lastCheckin)
  };
}

module.exports = {
  parseTimestamp,
  normalizeDevice
};
