const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/get', async (req, res) => {
  // to implement
});

// Handle React routing, return all requests to React app
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../dist', 'index.html'));
});

exports.router = router;
