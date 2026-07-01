const express = require('express');
const trackController = require('./track.controller');

const router = express.Router();

router.get('/', trackController.getTracks);
router.post('/', trackController.createTrack);
router.delete('/', trackController.deleteAllTracks);
router.put('/:_id', trackController.updateTrack);
router.delete('/:_id', trackController.deleteTrack);

module.exports = router;
