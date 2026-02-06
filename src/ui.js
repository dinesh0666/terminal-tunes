/**
 * UI Module
 * Handles terminal UI and visualizations
 */

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const chalk = require('chalk');
const SpotifyVisualizer = require('./spotify-visualizer');

class UI {
  constructor(player) {
    this.player = player;
    this.screen = null;
    this.grid = null;
    this.widgets = {};
    this.setupUI();
    this.setupEventListeners();
  }

  /**
   * Setup the terminal UI
   */
  setupUI() {
    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Terminal Tunes - Music Player',
    });

    // Create grid layout
    this.grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: this.screen,
    });

    // Spotify-style visualizer (top section)
    this.visualizer = new SpotifyVisualizer(this.grid, this.screen);

    // Track info (middle left)
    this.widgets.trackInfo = this.grid.set(6, 0, 3, 6, blessed.box, {
      label: '♪ Now Playing',
      content: 'No track loaded',
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan',
        },
      },
    });

    // Playlist (middle right)
    this.widgets.playlist = this.grid.set(6, 6, 3, 6, blessed.list, {
      label: '≡ Playlist',
      tags: true,
      keys: true,
      vi: true,
      mouse: true,
      border: {
        type: 'line',
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan',
        },
        selected: {
          bg: 'blue',
          fg: 'white',
        },
      },
    });

    // Progress bar (bottom left)
    this.widgets.progress = this.grid.set(9, 0, 1, 8, contrib.gauge, {
      label: 'Progress',
      stroke: 'cyan',
      fill: 'white',
    });

    // Volume meter (bottom middle)
    this.widgets.volume = this.grid.set(9, 8, 1, 2, contrib.gauge, {
      label: 'Vol',
      stroke: 'green',
      fill: 'white',
    });

    // Controls info (bottom)
    this.widgets.controls = this.grid.set(10, 0, 2, 12, blessed.box, {
      label: 'Controls',
      content: this.getControlsText(),
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan',
        },
      },
    });

    // Setup keyboard shortcuts
    this.setupKeyboardControls();
  }

  /**
   * Setup keyboard controls
   */
  setupKeyboardControls() {
    // Quit
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.player.stop();
      process.exit(0);
    });

    // Play/Pause
    this.screen.key(['space', 'p'], () => {
      if (this.player.isPlaying) {
        this.player.pause();
        this.updateStatus('⏸️  PAUSED');
      } else if (this.player.isPaused) {
        this.player.resume();
        this.updateStatus('▶️  Playing');
      } else if (this.player.playlist.length > 0) {
        this.player.play();
        this.updateStatus('▶️  Playing');
      }
    });

    // Next track
    this.screen.key(['n', 'right'], () => {
      if (this.player.playlist.length > 0) {
        this.player.next();
      }
    });

    // Previous track
    this.screen.key(['b', 'left'], () => {
      if (this.player.playlist.length > 0) {
        this.player.previous();
      }
    });

    // Volume up
    this.screen.key(['up', '+', '='], () => {
      const newVolume = Math.min(100, this.player.volume + 5);
      this.player.setVolume(newVolume);
      this.showVolumeNotification(newVolume);
    });

    // Volume down
    this.screen.key(['down', '-', '_'], () => {
      const newVolume = Math.max(0, this.player.volume - 5);
      this.player.setVolume(newVolume);
      this.showVolumeNotification(newVolume);
    });

    // Stop
    this.screen.key(['s'], () => {
      this.player.stop();
      this.updateStatus('⏹ Stopped');
    });
  }

  /**
   * Show volume notification
   */
  showVolumeNotification(level) {
    const bars = '█'.repeat(Math.floor(level / 5));
    const empty = '░'.repeat(20 - Math.floor(level / 5));
    this.widgets.trackInfo.setLabel(`♪ Now Playing - Volume: ${level}% [${bars}${empty}]`);
    setTimeout(() => {
      this.widgets.trackInfo.setLabel('♪ Now Playing');
      this.screen.render();
    }, 1000);
    this.screen.render();
  }

  /**
   * Setup event listeners for player events
   */
  setupEventListeners() {
    this.player.on('loaded', (playlist) => {
      this.updatePlaylist(playlist);
    });

    this.player.on('streamLoading', (track) => {
      this.showStreamLoading();
    });

    this.player.on('streamError', (error) => {
      this.showNetworkError(error);
    });

    this.player.on('play', (track) => {
      // Clear loading animations first
      if (this.loadingInterval) {
        clearInterval(this.loadingInterval);
        this.loadingInterval = null;
      }
      if (this.errorInterval) {
        clearInterval(this.errorInterval);
        this.errorInterval = null;
      }
      
      // Force clear the trackInfo content before updating
      this.widgets.trackInfo.setContent('');
      this.screen.render();
      
      // Now update with actual track info
      this.updateTrackInfo(track);
      // Update visualizer with track info
      this.visualizer.setTrackInfo(track.name, track.artist || 'Unknown Artist');
      this.visualizer.startIdleAnimation();
    });

    this.player.on('audioData', (samples) => {
      // Update visualizer with real audio data
      this.visualizer.update(samples);
    });

    this.player.on('volume', (level) => {
      this.updateVolume(level);
    });

    this.player.on('progress', (data) => {
      this.updateProgress(data);
    });

    this.player.on('pause', () => {
      this.updateStatus('⏸️  Paused');
      this.visualizer.stopIdleAnimation();
    });

    this.player.on('resume', () => {
      this.updateStatus('▶️  Playing');
      this.visualizer.startIdleAnimation();
    });

    this.player.on('stop', () => {
      this.updateStatus('⏹️  Stopped');
      this.visualizer.clear();
    });

    this.player.on('error', (error) => {
      this.showError(error.message);
    });
  }

  /**
   * Update playlist display
   */
  updatePlaylist(playlist) {
    const items = playlist.map((track, index) => 
      `${index + 1}. ${track.name}`
    );
    this.widgets.playlist.setItems(items);
    this.screen.render();
  }

  /**
   * Update track info display
   */
  updateTrackInfo(track) {
    this.currentTrack = track;
    const info = `
{center}{bold}${track.name}{/bold}{/center}

{cyan-fg}Artist:{/cyan-fg} ${track.artist || 'Unknown'}
{cyan-fg}Album:{/cyan-fg} ${track.album || 'Unknown'}
{cyan-fg}Format:{/cyan-fg} ${track.format}

{green-fg}Status:{/green-fg} {green-fg}▶ Playing{/green-fg}
    `;
    this.widgets.trackInfo.setContent(info);
    this.screen.render();
  }

  /**
   * Update volume display
   */
  updateVolume(level) {
    this.widgets.volume.setPercent(level);
    this.widgets.volume.setLabel(`Vol ${level}%`);
    this.screen.render();
  }

  /**
   * Update progress display
   */
  updateProgress(data) {
    this.widgets.progress.setPercent(data.percent);
    const currentMin = Math.floor(data.current / 60);
    const currentSec = Math.floor(data.current % 60);
    const durationMin = Math.floor(data.duration / 60);
    const durationSec = Math.floor(data.duration % 60);
    this.widgets.progress.setLabel(
      `Progress [${currentMin}:${currentSec.toString().padStart(2, '0')} / ${durationMin}:${durationSec.toString().padStart(2, '0')}]`
    );
    this.screen.render();
  }

  /**
   * Update status display
   */
  updateStatus(status) {
    if (this.currentTrack) {
      const info = `
{center}{bold}${this.currentTrack.name}{/bold}{/center}

{cyan-fg}Artist:{/cyan-fg} ${this.currentTrack.artist || 'Unknown'}
{cyan-fg}Album:{/cyan-fg} ${this.currentTrack.album || 'Unknown'}
{cyan-fg}Format:{/cyan-fg} ${this.currentTrack.format}

{yellow-fg}Status:{/yellow-fg} {bold}${status}{/bold}
      `;
      this.widgets.trackInfo.setContent(info);
      this.screen.render();
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const info = `
{center}{red-fg}{bold}ERROR{/bold}{/red-fg}{/center}

{red-fg}${message}{/red-fg}
    `;
    this.widgets.trackInfo.setContent(info);
    this.screen.render();
  }

  showStreamLoading() {
    let frame = 0;
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const dots = ['', '.', '..', '...'];
    let dotFrame = 0;
    
    const loadingInterval = setInterval(() => {
      const spinner = frames[frame % frames.length];
      const dot = dots[Math.floor(dotFrame / 3) % dots.length];
      
      const content = `
{center}{cyan-fg}{bold}${spinner} BUFFERING STREAM ${spinner}{/bold}{/cyan-fg}{/center}

{center}{yellow-fg}Connecting to audio source${dot}{/yellow-fg}{/center}
{center}{gray-fg}Please wait...{/gray-fg}{/center}
      `;
      
      this.widgets.trackInfo.setContent(content);
      this.screen.render();
      
      frame++;
      dotFrame++;
    }, 80);

    // Store interval to clear it later
    this.loadingInterval = loadingInterval;
    
    // Auto-clear after 10 seconds
    setTimeout(() => {
      if (this.loadingInterval) {
        clearInterval(this.loadingInterval);
        this.loadingInterval = null;
      }
    }, 10000);
  }

  showNetworkError(error) {
    // Clear loading animation
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }

    let frame = 0;
    const errorInterval = setInterval(() => {
      const pulse = frame % 2 === 0 ? '█' : '▓';
      const content = `
{center}{red-fg}{bold}╔══════════════════════════════╗{/bold}{/red-fg}{/center}
{center}{red-fg}{bold}║  ${pulse}  NETWORK ERROR  ${pulse}  ║{/bold}{/red-fg}{/center}
{center}{red-fg}{bold}╚══════════════════════════════╝{/bold}{/red-fg}{/center}

{center}{yellow-fg}${error.message}{/yellow-fg}{/center}
{center}{gray-fg}${error.reason}{/gray-fg}{/center}

{center}{cyan-fg}Possible issues:{/cyan-fg}{/center}
{center}{white-fg}• No internet connection{/white-fg}{/center}
{center}{white-fg}• Stream URL unavailable{/white-fg}{/center}
{center}{white-fg}• yt-dlp needs update{/white-fg}{/center}

{center}{green-fg}Press Q to quit{/green-fg}{/center}
      `;
      
      this.widgets.trackInfo.setContent(content);
      this.screen.render();
      frame++;
    }, 500);

    // Store for cleanup
    this.errorInterval = errorInterval;
  }

  /**
   * Get controls text
   */
  getControlsText() {
    return `
{center}{cyan-fg}[SPACE/P]{/cyan-fg} Play/Pause  {cyan-fg}[N]{/cyan-fg} Next  {cyan-fg}[B]{/cyan-fg} Previous  {cyan-fg}[S]{/cyan-fg} Stop{/center}
{center}{cyan-fg}[↑/↓ or +/-]{/cyan-fg} Volume  {cyan-fg}[Q/ESC]{/cyan-fg} Quit{/center}
    `;
  }

  /**
   * Render the UI
   */
  render() {
    this.screen.render();
    
    // Auto-start playing if not already started
    if (this.player.playlist.length > 0 && !this.player.isPlaying) {
      this.player.play();
    }
  }
}

module.exports = UI;
