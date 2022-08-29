const express = require('express');
const path = require('path');

const { getPollWorkers, getPrecinct } = require('../utils/airtable');

const router = express.Router();

router.get('/workers', async (req, res) => {
  const {
    baseId,
    precinctTableId,
    workersTableId,
    precinctId,
  } = req.query;
  if (!baseId || !precinctTableId || !workersTableId || !precinctId) {
    res.send(300);
    return;
  }
  const workerData = await getPollWorkers(baseId, workersTableId, precinctTableId, precinctId);

  res.json(workerData);
});

router.get('/precinct', async (req, res) => {
  const {
    baseId,
    precinctTableId,
    workersTableId,
    precinctId,
  } = req.query;
  if (!baseId || !precinctTableId || !workersTableId || !precinctId) {
    res.send(300);
    return;
  }
  const precinctData = await getPrecinct(baseId, workersTableId, precinctTableId, precinctId);

  res.json(precinctData);
});

// Handle React routing, return all other requests to React app
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../dist', 'index.html'));
});

exports.router = router;
