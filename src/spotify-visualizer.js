/**
 * Spotify-inspired Equalizer
 * Minimal, text-only bars (no numbers/null labels)
 */

const blessed = require('blessed');

class SpotifyVisualizer {
  constructor(grid, screen) {
    this.screen = screen;
    this.trackName = '';
    this.artistName = '';
    this.barCount = 32;
    this.maxHeight = 12;
    this.idleTimer = null;
    this.samples = new Array(this.barCount).fill(0);

    this.box = grid.set(0, 0, 6, 12, blessed.box, {
      label: 'Audio Spectrum',
      border: { type: 'line', fg: 'cyan' },
      tags: true,
      style: { fg: 'white', bg: 'black' }
    });
  }

  setTrackInfo(name, artist) {
    this.trackName = name || 'Unknown';
    this.artistName = artist || 'Unknown';
    this.render();
  }

  // Map incoming samples (0..1 floats) into internal buffer
  update(samples) {
    if (!samples || samples.length === 0) return;
    const stride = Math.max(1, Math.floor(samples.length / this.barCount));
    for (let i = 0; i < this.barCount; i++) {
      const slice = samples.slice(i * stride, (i + 1) * stride);
      const avg = slice.reduce((a, b) => a + b, 0) / Math.max(1, slice.length);
      this.samples[i] = Math.max(0, Math.min(1, avg));
    }
    this.render();
  }

  startIdleAnimation() {
    this.stopIdleAnimation();
    this.idleTimer = setInterval(() => {
      this.samples = this.samples.map(() => Math.random() * 0.35);
      this.render();
    }, 120);
  }

  stopIdleAnimation() {
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    }
  }

  clear() {
    this.samples = new Array(this.barCount).fill(0);
    this.stopIdleAnimation();
    this.render();
  }

  render() {
    const bars = this.samples;
    const lines = [];

    // Build bars top-down
    for (let row = this.maxHeight; row >= 1; row--) {
      let line = ' ';
      for (let i = 0; i < this.barCount; i++) {
        const h = Math.round(bars[i] * this.maxHeight);
        const char = h >= row ? '▉' : ' ';
        const color = i % 2 === 0 ? '{cyan-fg}' : '{magenta-fg}';
        line += color + char + '{/} ';
      }
      lines.push(line);
    }

    lines.push('\n');
    lines.push(`{right}{bold}${this.trackName}{/bold}\n${this.artistName}{/right}`);

    this.box.setContent(lines.join('\n'));
    this.screen.render();
  }
}

module.exports = SpotifyVisualizer;
