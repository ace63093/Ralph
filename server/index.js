const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const { createNcentralClient } = require('./ncentralClient');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const client = createNcentralClient({
  baseUrl: process.env.NC_BASE_URL,
  userJwt: process.env.NC_USER_JWT,
  pageSize: Number(process.env.NC_PAGE_SIZE) || 100
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/devices', async (req, res) => {
  try {
    const orgUnitId = req.query.orgUnitId;
    const devices = await client.listDevices({ orgUnitId });
    res.json(devices);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load devices',
      detail: error.message
    });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
