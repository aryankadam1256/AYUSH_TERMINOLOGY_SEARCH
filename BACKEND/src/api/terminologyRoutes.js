const express = require('express');
const router = express.Router();
// Import Pinecone services instead of Elasticsearch
const { searchRagService, queryRagService } = require('../services/ragIntegrationService');
const { translateCode } = require('../services/terminologyService');

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Use Pinecone (via Python Service) instead of Elasticsearch
    const results = await searchRagService(q);
    res.json(results);
  } catch (error) {
    console.error('Error in search route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/translate', async (req, res) => {
  try {
    const { code, target } = req.query;
    if (!code || !target) {
      return res.status(400).json({ error: 'Code and target are required' });
    }
    const result = await translateCode(code, target);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const result = await queryRagService(query);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;