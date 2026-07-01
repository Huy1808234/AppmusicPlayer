const express = require('express');
const cors = require('cors');

const trackRoutes = require('./modules/track/track.route');

const app = express();

app.use(cors());
app.use(express.json());

// Register routes
app.use('/tracks', trackRoutes);

module.exports = app;
