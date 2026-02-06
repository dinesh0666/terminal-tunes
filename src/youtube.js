/**
 * YouTube Module
 * Handles YouTube playlist import and streaming
 */

const ytdl = require('ytdl-core');
const ytSearch = require('youtube-search-api');
const fs = require('fs-extra');
const path = require('path');

class YouTubeManager {
  constructor() {
    this.downloadDir = path.join(__dirname, '..', 'data', 'youtube');
    fs.ensureDirSync(this.downloadDir);
  }

  /**
   * Search for YouTube videos
   */
  async search(query, limit = 10) {
    try {
      const results = await ytSearch.GetListByKeyword(query, false, limit);
      return results.items.map(item => ({
        id: item.id,
        title: item.title,
        channel: item.channelTitle,
        duration: item.length ? item.length.simpleText : 'Unknown',
        url: `https://www.youtube.com/watch?v=${item.id}`
      }));
    } catch (error) {
      throw new Error(`YouTube search failed: ${error.message}`);
    }
  }

  /**
   * Get video info
   */
  async getVideoInfo(url) {
    try {
      const info = await ytdl.getInfo(url);
      return {
        title: info.videoDetails.title,
        author: info.videoDetails.author.name,
        duration: parseInt(info.videoDetails.lengthSeconds),
        thumbnail: info.videoDetails.thumbnails[0].url,
        formats: info.formats.filter(f => f.hasAudio)
      };
    } catch (error) {
      throw new Error(`Failed to get video info: ${error.message}`);
    }
  }

  /**
   * Download audio from YouTube video
   */
  async downloadAudio(url, options = {}) {
    try {
      const info = await this.getVideoInfo(url);
      const filename = this.sanitizeFilename(info.title) + '.mp3';
      const filepath = path.join(this.downloadDir, filename);

      if (await fs.pathExists(filepath) && !options.force) {
        return {
          path: filepath,
          title: info.title,
          cached: true
        };
      }

      return new Promise((resolve, reject) => {
        const stream = ytdl(url, {
          quality: 'highestaudio',
          filter: 'audioonly'
        });

        const writeStream = fs.createWriteStream(filepath);
        
        stream.pipe(writeStream);

        writeStream.on('finish', () => {
          resolve({
            path: filepath,
            title: info.title,
            cached: false
          });
        });

        stream.on('error', (error) => {
          reject(new Error(`Download failed: ${error.message}`));
        });

        writeStream.on('error', (error) => {
          reject(new Error(`Write failed: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Import playlist from YouTube playlist URL
   */
  async importPlaylist(playlistUrl) {
    try {
      // Extract playlist ID
      const playlistId = this.extractPlaylistId(playlistUrl);
      if (!playlistId) {
        throw new Error('Invalid playlist URL');
      }

      // Get playlist items
      const playlist = await ytSearch.GetPlaylistData(playlistId);
      
      return {
        title: playlist.title,
        items: playlist.items.map(item => ({
          id: item.id,
          title: item.title,
          channel: item.channelTitle,
          url: `https://www.youtube.com/watch?v=${item.id}`
        }))
      };
    } catch (error) {
      throw new Error(`Playlist import failed: ${error.message}`);
    }
  }

  /**
   * Stream audio from YouTube URL (returns download path)
   */
  async streamAudio(url) {
    return await this.downloadAudio(url);
  }

  /**
   * Extract playlist ID from URL
   */
  extractPlaylistId(url) {
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract video ID from URL
   */
  extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"\/\\|?*]+/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 200);
  }

  /**
   * Clear download cache
   */
  async clearCache() {
    await fs.emptyDir(this.downloadDir);
  }

  /**
   * Get cache size
   */
  async getCacheSize() {
    const files = await fs.readdir(this.downloadDir);
    let totalSize = 0;
    
    for (const file of files) {
      const filepath = path.join(this.downloadDir, file);
      const stats = await fs.stat(filepath);
      totalSize += stats.size;
    }
    
    return totalSize;
  }
}

module.exports = YouTubeManager;
