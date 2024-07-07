const express = require('express');
const { ttdl } = require('btch-downloader');

const router = express.Router();

router.get('/tikdl', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send('Missing parameters. Please provide a "url" parameter.');
    }

    const result = await ttdl(url);
    res.json({ url: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
