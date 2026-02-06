/**
 * Enhanced Visualizer with Multiple Colors
 */

const contrib = require('blessed-contrib');
const blessed = require('blessed');

class EnhancedVisualizer {
  constructor(grid, screen) {
    this.screen = screen;
    
    // Create three separate visualizer widgets for different frequency ranges
    this.bassLine = grid.set(0, 0, 2, 12, contrib.line, {
      style: { line: 'red', text: 'red', baseline: 'black' },
      label: '🔊 Bass (Low Frequencies)',
      showLegend: false,
      minY: 0,
      maxY: 100
    });
    
    this.midLine = grid.set(2, 0, 2, 12, contrib.line, {
      style: { line: 'yellow', text: 'yellow', baseline: 'black' },
      label: '🎸 Mid (Middle Frequencies)',
      showLegend: false,
      minY: 0,
      maxY: 100
    });
    
    this.trebleLine = grid.set(4, 0, 2, 12, contrib.line, {
      style: { line: 'cyan', text: 'cyan', baseline: 'black' },
      label: '✨ Treble (High Frequencies)',
      showLegend: false,
      minY: 0,
      maxY: 100
    });
  }

  /**
   * Update with audio frequency data
   */
  update(frequencies) {
    if (!frequencies || frequencies.length === 0) return;
    
    const third = Math.floor(frequencies.length / 3);
    
    // Split frequencies into bass, mid, treble
    const bass = frequencies.slice(0, third);
    const mid = frequencies.slice(third, third * 2);
    const treble = frequencies.slice(third * 2);
    
    // Create x-axis labels
    const createLabels = (length) => 
      Array.from({ length }, (_, i) => i % 5 === 0 ? i.toString() : '');
    
    // Update bass
    this.bassLine.setData([{
      x: createLabels(bass.length),
      y: bass.map(f => Math.max(0, Math.min(100, f * 100)))
    }]);
    
    // Update mid
    this.midLine.setData([{
      x: createLabels(mid.length),
      y: mid.map(f => Math.max(0, Math.min(100, f * 100)))
    }]);
    
    // Update treble
    this.trebleLine.setData([{
      x: createLabels(treble.length),
      y: treble.map(f => Math.max(0, Math.min(100, f * 100)))
    }]);
    
    this.screen.render();
  }

  /**
   * Show default pattern when idle
   */
  showDefault() {
    const time = Date.now() / 200;
    const length = 30;
    
    const bassData = Array.from({ length }, (_, i) => 
      Math.sin(time + i / 3) * 40 + 50
    );
    
    const midData = Array.from({ length }, (_, i) => 
      Math.cos(time + i / 4) * 30 + 40
    );
    
    const trebleData = Array.from({ length }, (_, i) => 
      Math.sin(time * 2 + i / 5) * 20 + 30
    );
    
    const labels = Array.from({ length }, (_, i) => i % 5 === 0 ? i.toString() : '');
    
    this.bassLine.setData([{ x: labels, y: bassData }]);
    this.midLine.setData([{ x: labels, y: midData }]);
    this.trebleLine.setData([{ x: labels, y: trebleData }]);
    
    this.screen.render();
  }
}

module.exports = EnhancedVisualizer;
