(function (global) {
  const DEFAULT_CONFIG = {
    dataMode: 'local',
    apiBaseUrl: '',
    rewstWebhookUrl: '',
    defaultOrgUnitId: ''
  };

  const BUCKETS = [
    { id: 'all', label: 'All' },
    { id: 'le30', label: '\u226430 days' },
    { id: 'le90', label: '\u226490 days' },
    { id: 'gt90', label: '>90 days' },
    { id: 'unknown', label: 'Unknown' }
  ];

  function parseDate(value) {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  function bucketizeDevice(lastCheckinTime, now = new Date()) {
    const date = parseDate(lastCheckinTime);
    if (!date) {
      return 'unknown';
    }
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays <= 30) {
      return 'le30';
    }
    if (diffDays <= 90) {
      return 'le90';
    }
    return 'gt90';
  }

  function sortDevices(devices, key, direction = 'asc') {
    const dir = direction === 'desc' ? -1 : 1;
    return [...devices].sort((a, b) => {
      if (key === 'lastCheckinTime') {
        const aDate = parseDate(a.lastCheckinTime);
        const bDate = parseDate(b.lastCheckinTime);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return dir * (aDate.getTime() - bDate.getTime());
      }
      const aValue = (a[key] ?? '').toString().toLowerCase();
      const bValue = (b[key] ?? '').toString().toLowerCase();
      return dir * aValue.localeCompare(bValue);
    });
  }

  function filterDevicesByBucket(devices, bucketId, now = new Date()) {
    if (bucketId === 'all') {
      return devices;
    }
    return devices.filter((device) => bucketizeDevice(device.lastCheckinTime, now) === bucketId);
  }

  function formatDate(value) {
    if (!value) {
      return 'Unknown';
    }
    const date = parseDate(value);
    if (!date) {
      return 'Unknown';
    }
    return date.toLocaleString();
  }

  function buildBucketButtons(container, onSelect) {
    container.innerHTML = '';
    BUCKETS.forEach((bucket) => {
      const button = document.createElement('button');
      button.textContent = bucket.label;
      button.dataset.bucket = bucket.id;
      button.className = 'bucket-button';
      button.addEventListener('click', () => onSelect(bucket.id));
      container.appendChild(button);
    });
  }

  function renderTable(tbody, devices) {
    tbody.innerHTML = '';
    devices.forEach((device) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${device.longName || ''}</td>
        <td>${device.deviceClass || ''}</td>
        <td>${device.customerId || ''}</td>
        <td>${formatDate(device.lastCheckinTime)}</td>
      `;
      tbody.appendChild(row);
    });
  }

  async function init() {
    const config = Object.assign({}, DEFAULT_CONFIG, global.DASH_CONFIG || {});
    const provider = global.DeviceProvider;

    const orgInput = document.getElementById('orgUnitId');
    const loadButton = document.getElementById('loadDevices');
    const status = document.getElementById('status');
    const count = document.getElementById('count');
    const bucketContainer = document.getElementById('bucketFilters');
    const tbody = document.querySelector('#deviceTable tbody');

    let devices = [];
    let currentBucket = 'all';
    let currentSort = { key: 'longName', direction: 'asc' };

    orgInput.value = config.defaultOrgUnitId || '';

    function updateStatus(message, isError = false) {
      status.textContent = message;
      status.className = isError ? 'status error' : 'status';
    }

    function updateTable() {
      const filtered = filterDevicesByBucket(devices, currentBucket);
      const sorted = sortDevices(filtered, currentSort.key, currentSort.direction);
      renderTable(tbody, sorted);
      count.textContent = `${sorted.length} devices`;
    }

    function setActiveBucket(bucketId) {
      currentBucket = bucketId;
      Array.from(bucketContainer.children).forEach((button) => {
        button.classList.toggle('active', button.dataset.bucket === bucketId);
      });
      updateTable();
    }

    buildBucketButtons(bucketContainer, setActiveBucket);
    setActiveBucket('all');

    loadButton.addEventListener('click', async () => {
      try {
        updateStatus('Loading devices...');
        const orgUnitId = orgInput.value.trim();
        devices = await provider.getDevices(config, orgUnitId);
        updateStatus('Devices loaded.');
        updateTable();
      } catch (error) {
        updateStatus(error.message, true);
      }
    });

    document.querySelectorAll('[data-sort]')
      .forEach((header) => {
        header.addEventListener('click', () => {
          const key = header.dataset.sort;
          if (currentSort.key === key) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
          } else {
            currentSort = { key, direction: 'asc' };
          }
          updateTable();
        });
      });
  }

  const app = {
    bucketizeDevice,
    sortDevices,
    filterDevicesByBucket,
    init
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = app;
  } else {
    global.DashApp = app;
    if (typeof document !== 'undefined') {
      document.addEventListener('DOMContentLoaded', () => {
        app.init();
      });
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
