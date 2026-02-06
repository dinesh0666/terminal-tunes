/**
 * Curated Playlists Module
 * Ad-free curated playlists like Youtify
 */

const fs = require('fs-extra');
const path = require('path');

class CuratedPlaylists {
  constructor() {
    this.playlistsDir = path.join(__dirname, '..', 'data', 'curated');
    this.ensureDirectories();
    this.initializeDefaultPlaylists();
  }

  async ensureDirectories() {
    await fs.ensureDir(this.playlistsDir);
  }

  /**
   * Initialize default curated playlists
   */
  async initializeDefaultPlaylists() {
    const defaultPlaylists = [
      {
        id: 'chill-vibes',
        name: 'Chill Vibes',
        description: 'Relaxing tracks for focus and calm',
        category: 'Ambient',
        tracks: [
          'Chillhop Music - Lofi Hip Hop Mix',
          'Peaceful Piano - Spotify',
          'Deep Focus - Spotify'
        ],
        youtubeQueries: [
          'lofi hip hop radio',
          'ambient study music',
          'peaceful piano music'
        ]
      },
      {
        id: 'coding-zone',
        name: 'Coding Zone',
        description: 'Perfect background music for programming',
        category: 'Focus',
        tracks: [
          'Synthwave Mix',
          'Electronic Focus',
          'Cyberpunk Coding Music'
        ],
        youtubeQueries: [
          'synthwave mix',
          'coding music mix',
          'cyberpunk mix'
        ]
      },
      {
        id: 'workout-energy',
        name: 'Workout Energy',
        description: 'High-energy tracks to keep you moving',
        category: 'Energy',
        tracks: [
          'Workout Mix',
          'EDM Gym Music',
          'Running Playlist'
        ],
        youtubeQueries: [
          'workout mix',
          'gym music mix',
          'edm workout'
        ]
      },
      {
        id: 'indie-discoveries',
        name: 'Indie Discoveries',
        description: 'Hidden gems from indie artists',
        category: 'Indie',
        tracks: [
          'Indie Folk Mix',
          'Alternative Indie',
          'Indie Rock Playlist'
        ],
        youtubeQueries: [
          'indie music mix',
          'indie folk playlist',
          'indie rock 2024'
        ]
      },
      {
        id: 'jazz-cafe',
        name: 'Jazz Café',
        description: 'Smooth jazz for coffee and contemplation',
        category: 'Jazz',
        tracks: [
          'Smooth Jazz',
          'Coffee Shop Jazz',
          'Late Night Jazz'
        ],
        youtubeQueries: [
          'smooth jazz mix',
          'coffee shop jazz',
          'evening jazz'
        ]
      }
    ];

    for (const playlist of defaultPlaylists) {
      const playlistPath = path.join(this.playlistsDir, `${playlist.id}.json`);
      if (!await fs.pathExists(playlistPath)) {
        await fs.writeJson(playlistPath, playlist, { spaces: 2 });
      }
    }
  }

  /**
   * List all curated playlists
   */
  async list() {
    const files = await fs.readdir(this.playlistsDir);
    const playlists = [];

    for (const file of files) {
      if (path.extname(file) === '.json') {
        const data = await fs.readJson(path.join(this.playlistsDir, file));
        playlists.push({
          id: data.id,
          name: data.name,
          description: data.description,
          category: data.category,
          trackCount: data.youtubeQueries ? data.youtubeQueries.length : data.tracks.length
        });
      }
    }

    return playlists;
  }

  /**
   * Get a specific curated playlist
   */
  async get(id) {
    const playlistPath = path.join(this.playlistsDir, `${id}.json`);
    
    if (!await fs.pathExists(playlistPath)) {
      throw new Error(`Curated playlist "${id}" not found`);
    }

    return await fs.readJson(playlistPath);
  }

  /**
   * Get playlists by category
   */
  async getByCategory(category) {
    const allPlaylists = await this.list();
    return allPlaylists.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Search curated playlists
   */
  async search(query) {
    const allPlaylists = await this.list();
    const lowerQuery = query.toLowerCase();
    
    return allPlaylists.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Create a custom curated playlist
   */
  async create(id, name, description, category, youtubeQueries) {
    const playlistPath = path.join(this.playlistsDir, `${id}.json`);
    
    if (await fs.pathExists(playlistPath)) {
      throw new Error(`Playlist "${id}" already exists`);
    }

    const playlist = {
      id,
      name,
      description,
      category,
      youtubeQueries,
      created: new Date().toISOString(),
      custom: true
    };

    await fs.writeJson(playlistPath, playlist, { spaces: 2 });
    return playlist;
  }

  /**
   * Update a curated playlist
   */
  async update(id, updates) {
    const playlistPath = path.join(this.playlistsDir, `${id}.json`);
    
    if (!await fs.pathExists(playlistPath)) {
      throw new Error(`Playlist "${id}" not found`);
    }

    const playlist = await fs.readJson(playlistPath);
    const updated = {
      ...playlist,
      ...updates,
      updated: new Date().toISOString()
    };

    await fs.writeJson(playlistPath, updated, { spaces: 2 });
    return updated;
  }

  /**
   * Delete a custom curated playlist
   */
  async delete(id) {
    const playlistPath = path.join(this.playlistsDir, `${id}.json`);
    
    if (!await fs.pathExists(playlistPath)) {
      throw new Error(`Playlist "${id}" not found`);
    }

    const playlist = await fs.readJson(playlistPath);
    
    if (!playlist.custom) {
      throw new Error('Cannot delete default curated playlists');
    }

    await fs.remove(playlistPath);
  }

  /**
   * Get all categories
   */
  async getCategories() {
    const playlists = await this.list();
    const categories = [...new Set(playlists.map(p => p.category))];
    return categories.sort();
  }
}

module.exports = CuratedPlaylists;
