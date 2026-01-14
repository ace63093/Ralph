(function (global) {
  function normalizeDevice(raw) {
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    return {
      deviceId: raw.deviceId ?? raw.id ?? null,
      longName: raw.longName ?? raw.name ?? raw.deviceName ?? '',
      deviceClass: raw.deviceClass ?? raw.class ?? raw.deviceType ?? '',
      uri: raw.uri ?? raw.href ?? '',
      orgUnitId: raw.orgUnitId ?? raw.orgUnit ?? '',
      customerId: raw.customerId ?? raw.customerID ?? '',
      lastCheckinTime: raw.lastCheckinTime ?? raw.lastApplianceCheckinTime ?? null
    };
  }

  async function getDevices(config, orgUnitId) {
    const mode = config.dataMode || 'local';
    if (mode === 'rewst') {
      if (!config.rewstWebhookUrl) {
        throw new Error('rewstWebhookUrl is required for rewst mode');
      }
      const method = (config.rewstMethod || 'GET').toUpperCase();
      const response = await fetch(config.rewstWebhookUrl, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: method === 'POST' ? JSON.stringify({ orgUnitId }) : undefined
      });
      if (!response.ok) {
        throw new Error(`Rewst fetch failed: ${response.status}`);
      }
      const data = await response.json();
      return (Array.isArray(data) ? data : data.devices || []).map(normalizeDevice);
    }

    const baseUrl = config.apiBaseUrl || '';
    const url = new URL(`${baseUrl}/api/devices`, window.location.origin);
    if (orgUnitId) {
      url.searchParams.set('orgUnitId', orgUnitId);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Local fetch failed: ${response.status}`);
    }
    const data = await response.json();
    return (Array.isArray(data) ? data : []).map(normalizeDevice);
  }

  const provider = { getDevices };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = provider;
  } else {
    global.DeviceProvider = provider;
  }
})(typeof window !== 'undefined' ? window : globalThis);
