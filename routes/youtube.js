const express = require('express');
const ytdl = require('ytdl-core');

const router = express.Router();

router.get('/yt', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send('Missing parameters. Please provide a "url" parameter.');
    }

    // Memeriksa apakah URL valid dan dapat diunduh
    if (!ytdl.validateURL(url)) {
      return res.status(400).send('Invalid YouTube URL.');
    }

    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });

    res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
    ytdl(url, { format: format }).pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
