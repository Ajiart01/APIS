const express = require('express');
const { twitter } = require('btch-downloader');

const router = express.Router();

router.get('/twitter', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send('Missing parameters. Please provide a "url" parameter.');
    }

    const result = await twitter(url);
    res.json({ url: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
