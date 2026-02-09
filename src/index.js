/**
 * TerminalTunes - CLI Music Player
 * Main module entry point for programmatic usage
 */

const Player = require('../player');
const YouTubeManager = require('./youtube');
const CuratedPlaylists = require('./curated');
const UI = require('./ui');
const EnhancedVisualizer = require('./visualizer');

module.exports = {
  Player,
  YouTubeManager,
  CuratedPlaylists,
  UI,
  EnhancedVisualizer,
};
