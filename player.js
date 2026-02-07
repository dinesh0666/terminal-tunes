/**
 * Player Module
 * Handles audio playback and control with robust process management
 */

const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');
const { spawn, execSync } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const mm = require('music-metadata');

class Player extends EventEmitter {
  constructor() {
    super();
    this._initializeState();
    this._cleanupZombieProcesses();
  }

  /**
   * Initialize player state
   * @private
   */
  _initializeState() {
    // Playback state
    this.currentTrack = null;
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.volume = 80;
    this.repeat = false;
    this.shuffle = false;
    
    // Audio process management
    this.audioProcess = null;
    this.audioPid = null;
    this.ipcSocket = `/tmp/terminal-tunes-${process.pid}.sock`;
    
    // Intervals
    this.visualizationInterval = null;
    this.progressInterval = null;
    
    // Progress tracking
    this.playStartTime = null;
    this.trackDuration = 0;
    
    // Flags
    this.isVolumeChange = false;
  }

  /**
   * Clean up any zombie processes on startup
   * @private
   */
  _cleanupZombieProcesses() {
    this.forceKillAll();
  }

  // ==================== PROCESS MANAGEMENT ====================

  // ==================== PROCESS MANAGEMENT ====================

  /**
   * Force kill all audio processes (afplay/mpv)
   * Nuclear option for cleaning up zombie processes
   */
  forceKillAll() {
    this._killStoredProcess();
    this._killSystemProcesses();
  }

  /**
   * Kill process by stored PID
   * @private
   */
  _killStoredProcess() {
    if (this.audioPid) {
      try { process.kill(-this.audioPid, 'SIGKILL'); } catch (e) {}
      try { process.kill(this.audioPid, 'SIGKILL'); } catch (e) {}
      this.audioPid = null;
    }
    if (this.audioProcess) {
      try { this.audioProcess.kill('SIGKILL'); } catch (e) {}
      try { this.audioProcess.removeAllListeners(); } catch (e) {}
      try { this.audioProcess.stdout?.destroy(); } catch (e) {}
      try { this.audioProcess.stderr?.destroy(); } catch (e) {}
      this.audioProcess = null;
    }
  }

  /**
   * Kill all audio processes system-wide
   * @private
   */
  _killSystemProcesses() {
    const killCommands = [
      'killall -9 afplay 2>/dev/null',
      'pkill -9 -x afplay 2>/dev/null',
      'pkill -9 -f afplay 2>/dev/null',
      "ps -A -o pid,comm | awk '/afplay/ {print $1}' | xargs kill -9 2>/dev/null",
      'killall -9 mpv 2>/dev/null',
      'pkill -9 -x mpv 2>/dev/null',
      'pkill -9 -f mpv 2>/dev/null',
      "ps -A -o pid,comm | awk '/mpv/ {print $1}' | xargs kill -9 2>/dev/null"
    ];
    
    for (const cmd of killCommands) {
      try { execSync(cmd); } catch (e) { /* Best-effort, ignore errors */ }
    }
    
    // Clean up IPC socket
    try {
      if (fs.existsSync(this.ipcSocket)) {
        fs.unlinkSync(this.ipcSocket);
      }
    } catch (e) { /* Ignore */ }
  }

  // ==================== PLAYBACK CONTROL ====================

  /**
   * Stop playback and clean up
   */
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.stopVisualization();
    this.stopProgressTracking();
    this.forceKillAll();
    this.emit('stop');
  }

  /**
   * Play current track
   */
  play() {
    if (this.playlist.length === 0) {
      throw new Error('No tracks loaded');
    }

    this._stopCurrentPlayback();
    
    // Wait for processes to die before starting new one
    setTimeout(() => {
      this.currentTrack = this.playlist[this.currentIndex];
      this._startAudioPlayback();
    }, 150);
  }

  /**
   * Stop current playback synchronously
   * @private
   */
  _stopCurrentPlayback() {
    this.isPlaying = false;
    this.isPaused = false;
    this.stopVisualization();
    this.forceKillAll();
  }

  /**
   * Start audio playback for current track
   * @private
   */
  _startAudioPlayback() {
    try {
      this.isPlaying = true;

      // Emit loading state for streams (unless just changing volume)
      if (this.currentTrack.stream && !this.isVolumeChange) {
        this.emit('streamLoading', this.currentTrack);
      }
      
      // Spawn appropriate audio process
      this.audioProcess = this._spawnAudioProcess();
      this.audioPid = this.audioProcess.pid;

      // Setup duration tracking
      this._setupDurationTracking();
      
      // Attach process event handlers
      this._attachProcessHandlers();

      // Start visualization and progress tracking
      this.startVisualization();
      this.startProgressTracking();
      
      // Emit play event
      this._emitPlayEvent();

    } catch (err) {
      this.isPlaying = false;
      this.emit('error', err);
    }
  }

  /**
   * Spawn appropriate audio process based on track type
   * @private
   * @returns {ChildProcess}
   */
  _spawnAudioProcess() {
    // Use mpv for all playback (both streams and local files)
    // This allows dynamic volume control via IPC
    return spawn('mpv', [
      '--no-video',
      '--really-quiet',
      `--volume=${this.volume}`,
      '--ao=coreaudio',
      `--input-ipc-server=${this.ipcSocket}`,
      this.currentTrack.path
    ]);
  }

  /**
   * Setup duration tracking for current track
   * @private
   */
  _setupDurationTracking() {
    if (!this.currentTrack.stream) {
      this.getTrackDuration(this.currentTrack.path);
    } else {
      this.trackDuration = this.currentTrack.duration || 0;
    }
  }

  /**
   * Attach event handlers to audio process
   * @private
   */
  _attachProcessHandlers() {
    this.audioProcess.on('exit', (code, signal) => {
      if (code === 0 && signal === null && this.isPlaying) {
        this.emit('trackEnd');
        this.next();
      }
    });

    this.audioProcess.on('error', (err) => {
      console.error('\n[Player] Audio process error:', err.message);
      if (this.currentTrack?.stream) {
        console.error('[Player] Hint: Make sure mpv and yt-dlp are installed');
        this.emit('streamError', {
          message: 'Failed to connect to stream',
          reason: err.message,
          isNetwork: true
        });
      }
      this.isPlaying = false;
      this.emit('error', err);
    });

    this.audioProcess.on('close', (code) => {
      if (code !== 0 && this.currentTrack?.stream) {
        this.emit('streamError', {
          message: 'Stream connection failed',
          reason: `Exit code: ${code}`,
          isNetwork: true
        });
      }
    });
  }

  /**
   * Emit play event with appropriate timing
   * @private
   */
  _emitPlayEvent() {
    if (this.currentTrack.stream) {
      // Give mpv time to start before emitting play
      setTimeout(() => {
        this.emit('play', this.currentTrack);
        this.emit('volume', this.volume);
        this.isVolumeChange = false;
      }, 1000);
    } else {
      this.emit('play', this.currentTrack);
      this.emit('volume', this.volume);
      this.isVolumeChange = false;
    }
  }

  /**
   * Pause playback
   */
  pause() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    this.isPaused = true;
    this.stopVisualization();
    this.stopProgressTracking();
    this.forceKillAll();
    this.emit('pause');
  }

  /**
   * Resume playback (restarts track from beginning)
   * Note: afplay doesn't support seeking, so we restart
   */
  resume() {
    if (!this.isPaused) return;
    this.play(); 
  }

  /**
   * Play next track
   */
  next() {
    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex++;
      this.play();
    } else if (this.repeat) {
      this.currentIndex = 0;
      this.play();
    } else {
      this.stop();
    }
  }

  /**
   * Play previous track
   */
  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.play();
    } else if (this.repeat) {
      this.currentIndex = this.playlist.length - 1;
      this.play();
    } else {
      this.play(); // Restart current
    }
  }

  /**
   * Set volume level (0-100)
   * @param {number} level - Volume level
   */
  setVolume(level) {
    this.volume = Math.max(0, Math.min(100, level));
    this.emit('volume', this.volume);
    
    // If playing, send volume command to mpv via IPC
    if (this.isPlaying && this.audioProcess && fs.existsSync(this.ipcSocket)) {
      try {
        // Send volume command to mpv via IPC socket
        const cmd = JSON.stringify({ command: ['set_property', 'volume', this.volume] }) + '\n';
        const net = require('net');
        const client = net.createConnection(this.ipcSocket, () => {
          client.write(cmd);
          client.end();
        });
        client.on('error', () => {
          // If IPC fails, ignore - volume will be applied on next track
        });
      } catch (err) {
        // Ignore IPC errors
      }
    }
  }

  // ==================== VISUALIZATION & PROGRESS ====================

  startVisualization() {
    this.stopVisualization();
    this.visualizationInterval = setInterval(() => {
        // Generate pseudo-frequency data (20 bars)
        // Make it look dynamic based on time
        const time = Date.now() / 100;
        const data = [];
        for (let i = 0; i < 30; i++) {
            // Perlin-noise-ish sine waves
            const val = Math.sin(time + i * 0.5) * 0.5 + 0.5; 
            // Add some jitter
            const jitter = Math.random() * 0.2;
            data.push(Math.max(0, Math.min(1, val + jitter)));
        }
        this.emit('audioData', data);
    }, 75);
  }

  stopVisualization() {
    if (this.visualizationInterval) {
      clearInterval(this.visualizationInterval);
      this.visualizationInterval = null;
    }
  }

  startProgressTracking() {
    this.stopProgressTracking();
    this.playStartTime = Date.now();
    
    this.progressInterval = setInterval(() => {
      const elapsed = (Date.now() - this.playStartTime) / 1000;
      const percent = this.trackDuration > 0 ? Math.min(100, (elapsed / this.trackDuration) * 100) : 0;
      
      this.emit('progress', {
        current: elapsed,
        duration: this.trackDuration,
        percent: percent
      });
    }, 500);
  }

  stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  async getTrackDuration(filePath) {
    try {
      const { parseFile } = require('music-metadata');
      const metadata = await parseFile(filePath);
      this.trackDuration = metadata.format.duration || 0;
    } catch (e) {
      // Fallback: estimate from file size (rough)
      this.trackDuration = 180; // Default 3 min
    }
  }

  // --- Loading ---

  async load(filePath, options = {}) {
    // If URL, treat as streaming track
    if (/^https?:\/\//i.test(filePath)) {
      // Fetch video metadata from YouTube
      let videoTitle = filePath;
      let videoDuration = 0;
      
      console.log('📡 Fetching video information...');
      // Emit loading state for UI
      this.emit('streamLoading', { url: filePath });
      
      try {
        // Add timeout to prevent hanging
        const execWithTimeout = (cmd, timeout = 15000) => {
          return Promise.race([
            exec(cmd),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timed out')), timeout)
            )
          ]);
        };
        
        const { stdout } = await execWithTimeout(
          `yt-dlp --dump-json --no-playlist "${filePath}"`,
          15000
        );
        const metadata = JSON.parse(stdout);
        videoTitle = metadata.title || filePath;
        videoDuration = metadata.duration || 0;
        console.log(`✓ Found: ${videoTitle} (${Math.floor(videoDuration / 60)}:${String(Math.floor(videoDuration % 60)).padStart(2, '0')})`);
      } catch (e) {
        console.error('Could not fetch video metadata:', e.message);
        // Emit network error for UI to handle
        this.emit('networkError', {
          message: 'Failed to load stream',
          reason: e.message.includes('timed out') 
            ? 'Network timeout - Check your internet connection' 
            : e.message.includes('not found') || e.message.includes('unavailable')
            ? 'Video unavailable or removed'
            : 'Could not connect to streaming service',
          url: filePath
        });
        throw new Error(`Network error: ${e.message}`);
      }
      
      this.playlist = [{
        path: filePath,
        name: videoTitle,
        format: 'stream',
        stream: true,
        duration: videoDuration
      }];
      
      // Set options and emit
      this.volume = parseInt(options.volume) || 80;
      this.shuffle = options.shuffle || false;
      this.repeat = options.repeat || false;
      this.emit('loaded', this.playlist);
      this.emit('volume', this.volume);
      return;
    }
    
    // Local file/folder path
    try {
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
            await this.loadFolder(filePath);
        } else {
            await this.loadFile(filePath);
        }
    } catch (e) {
        throw new Error(`Could not load path: ${filePath}`);
    }
    
    this.volume = parseInt(options.volume) || 80;
    this.shuffle = options.shuffle || false;
    this.repeat = options.repeat || false;

    if (this.shuffle) {
        this.shufflePlaylist();
    }
    this.emit('loaded', this.playlist);
    this.emit('volume', this.volume);
  }

  async loadFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
      throw new Error(`Unsupported format: ${ext}`);
    }
    this.playlist = [{
      path: filePath,
      name: path.basename(filePath, ext),
      format: ext,
    }];
  }

  async loadFolder(folderPath) {
    const files = await fs.readdir(folderPath);
    const supportedFormats = ['.mp3', '.wav', '.ogg', '.m4a'];
    this.playlist = files
      .filter(file => supportedFormats.includes(path.extname(file).toLowerCase()))
      .map(file => ({
        path: path.join(folderPath, file),
        name: path.basename(file, path.extname(file)),
        format: path.extname(file),
      }));
    if (this.playlist.length === 0) throw new Error('No audio files found');
  }

  shufflePlaylist() {
    for (let i = this.playlist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
    }
  }
}

module.exports = Player;
