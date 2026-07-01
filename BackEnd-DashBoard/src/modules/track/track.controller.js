const trackService = require('./track.service');

const getTracks = async (req, res) => {
  try {
    const tracks = await trackService.getTracks();
    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
};

const createTrack = async (req, res) => {
  const { title, artist, url, artwork } = req.body;

  if (!title || !artist || !url || !artwork) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const _id = await trackService.createTrack({ title, artist, url, artwork });
    res.status(201).json({ _id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Add failed' });
  }
};

const updateTrack = async (req, res) => {
  try {
    const { _id } = req.params;
    await trackService.updateTrack(_id, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
};

const deleteTrack = async (req, res) => {
  try {
    const { _id } = req.params;
    await trackService.deleteTrack(_id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

const deleteAllTracks = async (req, res) => {
  try {
    const deletedCount = await trackService.deleteAllTracks();
    res.json({ success: true, deleted: deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete all failed' });
  }
};

module.exports = {
  getTracks,
  createTrack,
  updateTrack,
  deleteTrack,
  deleteAllTracks,
};
