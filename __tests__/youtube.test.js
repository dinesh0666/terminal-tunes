/**
 * YouTube Module Tests
 */

const YouTubeManager = require('../src/youtube');
const fs = require('fs-extra');

describe('YouTubeManager', () => {
  let yt;

  beforeEach(() => {
    yt = new YouTubeManager();
  });

  describe('URL Parsing', () => {
    test('should extract video ID from YouTube URL', () => {
      const url1 = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const url2 = 'https://youtu.be/dQw4w9WgXcQ';

      expect(yt.extractVideoId(url1)).toBe('dQw4w9WgXcQ');
      expect(yt.extractVideoId(url2)).toBe('dQw4w9WgXcQ');
    });

    test('should extract playlist ID from YouTube URL', () => {
      const url = 'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf';
      expect(yt.extractPlaylistId(url)).toBe('PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf');
    });

    test('should return null for invalid URLs', () => {
      expect(yt.extractVideoId('not-a-url')).toBeNull();
      expect(yt.extractPlaylistId('not-a-url')).toBeNull();
    });
  });

  describe('Filename Sanitization', () => {
    test('should sanitize filenames', () => {
      expect(yt.sanitizeFilename('Test: File | Name?')).toBe('Test_File_Name');
      expect(yt.sanitizeFilename('Multiple   Spaces')).toBe('Multiple_Spaces');
    });
  });
});
