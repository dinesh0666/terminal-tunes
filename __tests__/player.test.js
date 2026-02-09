/**
 * Player Module Tests
 */

const Player = require('../player');
const fs = require('fs-extra');

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player();
  });

  afterEach(async () => {
    if (player.isPlaying) {
      player.stop();
    }
  });

  describe('Constructor', () => {
    test('should initialize with default values', () => {
      expect(player.currentTrack).toBeNull();
      expect(player.playlist).toEqual([]);
      expect(player.currentIndex).toBe(0);
      expect(player.isPlaying).toBe(false);
      expect(player.volume).toBe(80);
    });
  });

  describe('Volume Control', () => {
    test('should set volume within range 0-100', () => {
      player.setVolume(50);
      expect(player.volume).toBe(50);

      player.setVolume(150);
      expect(player.volume).toBe(100);

      player.setVolume(-10);
      expect(player.volume).toBe(0);
    });
  });

  describe('Playlist Management', () => {
    test('should shuffle playlist', () => {
      player.playlist = [
        { name: 'song1' },
        { name: 'song2' },
        { name: 'song3' },
        { name: 'song4' },
        { name: 'song5' }
      ];

      const original = [...player.playlist];
      player.shufflePlaylist();

      expect(player.playlist.length).toBe(original.length);
    });

    test('should jump to specific track', () => {
      player.playlist = [
        { name: 'song1' },
        { name: 'song2' },
        { name: 'song3' }
      ];

      player.jumpTo(2);
      expect(player.currentIndex).toBe(2);
    });
  });
});
