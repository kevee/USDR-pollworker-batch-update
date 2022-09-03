const express = require("express");
const path = require("path");

const {
  getPollWorkers,
  getPrecinct,
  updateWorkerStatuses,
} = require("../utils/airtable");

const router = express.Router();

router.get("/workers", async (req, res) => {
  const { configId, precinctId } = req.query;
  if (!configId || !precinctId) {
    res.sendStatus(300);
    return;
  }
  const workerData = await getPollWorkers(configId, precinctId);

  res.json(workerData);
});

router.get("/precinct", async (req, res) => {
  const { configId, precinctId } = req.query;
  if (!configId || !precinctId) {
    res.sendStatus(300);
    return;
  }
  const precinctData = await getPrecinct(configId, precinctId);

  res.json(precinctData);
});

router.post("/update", async (req, res) => {
  const { configId, workerStatuses } = req.body;
  if (await updateWorkerStatuses(configId, workerStatuses)) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
});

// Handle React routing, return all other requests to React app
router.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../dist", "index.html"));
});

exports.router = router;
