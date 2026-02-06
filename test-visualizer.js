#!/usr/bin/env node

/**
 * Test the enhanced visualizer without audio files
 */

const Player = require('../src/player');
const UI = require('../src/ui');

console.log('🎵 Testing TerminalTunes Enhanced Visualizer...\n');
console.log('This will show the colorful 3-band visualizer in action!\n');
console.log('Press Q to quit\n');

setTimeout(() => {
  const player = new Player();
  
  // Create a dummy playlist
  player.playlist = [{
    path: '/tmp/dummy.mp3',
    name: 'Visualization Demo',
    artist: 'TerminalTunes',
    album: 'Test',
    format: '.mp3',
    duration: 180
  }];
  
  const ui = new UI(player);
  ui.render();
  
  // Simulate audio data
  setInterval(() => {
    const frequencies = [];
    const time = Date.now() / 1000;
    
    for (let i = 0; i < 64; i++) {
      const freq = i / 64;
      
      // Bass (red) - low frequencies
      const bass = freq < 0.3 ? Math.exp(-freq * 2) * (0.8 + Math.random() * 0.4) : 0;
      
      // Mid (yellow) - middle frequencies  
      const mid = (freq >= 0.3 && freq < 0.7) ? 
        Math.exp(-Math.abs(freq - 0.5) * 8) * (0.6 + Math.random() * 0.4) : 0;
      
      // Treble (cyan) - high frequencies
      const treble = freq >= 0.7 ? 
        Math.random() * 0.4 * Math.sin(time * 2 + i / 10) : 0;
      
      frequencies.push(bass + mid + treble);
    }
    
    player.emit('audioData', frequencies);
  }, 50);
  
}, 1000);
