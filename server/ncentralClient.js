const { normalizeDevice } = require('./normalize');

function createNcentralClient({ baseUrl, userJwt, pageSize = 100, fetchFn = fetch }) {
  if (!baseUrl) {
    throw new Error('baseUrl is required');
  }
  if (!userJwt) {
    throw new Error('userJwt is required');
  }

  const tokenCache = {
    accessToken: null,
    refreshToken: null
  };

  async function authenticate() {
    const response = await fetchFn(`${baseUrl}/api/auth/authenticate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userJwt}`
      }
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    tokenCache.accessToken = data.accessToken || data.access_token || null;
    tokenCache.refreshToken = data.refreshToken || data.refresh_token || null;

    return tokenCache.accessToken;
  }

  async function refreshAccessToken() {
    if (!tokenCache.refreshToken) {
      return authenticate();
    }

    const response = await fetchFn(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenCache.refreshToken}`
      }
    });

    if (!response.ok) {
      return authenticate();
    }

    const data = await response.json();
    tokenCache.accessToken = data.accessToken || data.access_token || tokenCache.accessToken;
    tokenCache.refreshToken = data.refreshToken || data.refresh_token || tokenCache.refreshToken;
    return tokenCache.accessToken;
  }

  async function getAccessToken() {
    if (tokenCache.accessToken) {
      return tokenCache.accessToken;
    }
    if (tokenCache.refreshToken) {
      return refreshAccessToken();
    }
    return authenticate();
  }

  async function fetchWithAuth(url, options = {}) {
    const accessToken = await getAccessToken();
    const response = await fetchFn(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      await authenticate();
      const retryToken = tokenCache.accessToken;
      return fetchFn(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${retryToken}`
        }
      });
    }

    return response;
  }

  async function fetchDeviceDetail(deviceId, detailCache) {
    if (detailCache.has(deviceId)) {
      return detailCache.get(deviceId);
    }
    const response = await fetchWithAuth(`${baseUrl}/api/devices/${deviceId}`);
    if (!response.ok) {
      detailCache.set(deviceId, null);
      return null;
    }
    const data = await response.json();
    detailCache.set(deviceId, data);
    return data;
  }

  async function enrichMissingCheckins(devices) {
    const detailCache = new Map();
    const pending = devices.filter((device) => !device.lastCheckinTime && device.deviceId);
    const concurrency = 5;
    const results = [];

    for (let i = 0; i < pending.length; i += concurrency) {
      const batch = pending.slice(i, i + concurrency);
      const details = await Promise.all(
        batch.map((device) => fetchDeviceDetail(device.deviceId, detailCache))
      );
      details.forEach((detail, index) => {
        const original = batch[index];
        if (detail) {
          const merged = normalizeDevice({ ...original, ...detail });
          original.lastCheckinTime = merged.lastCheckinTime;
        }
      });
      results.push(...batch);
    }

    return devices;
  }

  async function listDevices({ orgUnitId, maxPages = 10 } = {}) {
    const normalized = [];
    let pageNumber = 1;
    let hasMore = true;

    while (hasMore && pageNumber <= maxPages) {
      const url = new URL(`${baseUrl}/api/devices`);
      url.searchParams.set('pageNumber', String(pageNumber));
      url.searchParams.set('pageSize', String(pageSize));
      if (orgUnitId) {
        url.searchParams.set('orgUnitId', String(orgUnitId));
      }

      const response = await fetchWithAuth(url.toString());
      if (!response.ok) {
        throw new Error(`Device fetch failed: ${response.status}`);
      }
      const data = await response.json();
      const items = Array.isArray(data) ? data : data.items || data.devices || [];
      const mapped = items.map(normalizeDevice);
      const filtered = orgUnitId
        ? mapped.filter((device) => String(device.orgUnitId) === String(orgUnitId))
        : mapped;

      normalized.push(...filtered);
      hasMore = items.length === pageSize;
      pageNumber += 1;
    }

    await enrichMissingCheckins(normalized);

    return normalized;
  }

  return {
    authenticate,
    refreshAccessToken,
    listDevices,
    _tokenCache: tokenCache
  };
}

module.exports = {
  createNcentralClient
};
