#!/usr/bin/env node

/**
 * TerminalTunes - CLI Music Player
 * Entry point for the application
 */

const { program } = require('commander');
const chalk = require('chalk');
const boxen = require('boxen');
const path = require('path');
const fs = require('fs-extra');

// Import app modules
const Player = require('../player');
const UI = require('../src/ui');
const YouTubeManager = require('../src/youtube');
const CuratedPlaylists = require('../src/curated');

// ASCII Art Banner
const banner = `
 ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗         
 ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║         
    ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║         
    ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║         
    ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗    
    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝    
                                                                        
 ████████╗██╗   ██╗███╗   ██╗███████╗███████╗                         
 ╚══██╔══╝██║   ██║████╗  ██║██╔════╝██╔════╝                         
    ██║   ██║   ██║██╔██╗ ██║█████╗  ███████╗                         
    ██║   ██║   ██║██║╚██╗██║██╔══╝  ╚════██║                         
    ██║   ╚██████╔╝██║ ╚████║███████╗███████║                         
    ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚══════╝                         
`;

console.log(chalk.cyan(banner));
console.log(chalk.gray('  A beautiful CLI music player with visualizations\n'));

// CLI Configuration
program
  .name('terminal-tunes')
  .description('A beautiful CLI music player with real-time audio visualizations')
  .version('1.0.0');

// Play command
program
  .command('play [file]')
  .description('Play a music file or folder')
  .option('-s, --shuffle', 'Shuffle playback')
  .option('-r, --repeat', 'Repeat playback')
  .option('-v, --volume <level>', 'Set volume (0-100)', '80')
  .action(async (file, options) => {
    try {
      if (!file) {
        console.log(chalk.yellow('⚠ Please provide a file or folder to play'));
        console.log(chalk.gray('Example: terminal-tunes play ./music'));
        return;
      }
      let filePath = file;

      // If it's a URL, stream directly (no download). Otherwise resolve local.
      const isUrl = /^https?:\/\//i.test(file);
      if (isUrl) {
        console.log(chalk.blue('🌐 Connecting to stream...'));
      } else {
        filePath = path.resolve(file);
        if (!await fs.pathExists(filePath)) {
          console.log(chalk.red(`✗ File or folder not found: ${file}`));
          return;
        }
      }

      // Initialize player and UI
      const player = new Player();
      
      // Load first, then setup UI
      await player.load(filePath, options);
      
      const ui = new UI(player);
      
      // Render UI and start playing
      ui.render();
      
    } catch (error) {
      console.error(chalk.red('\n✗ Error:'), error.message);
      console.error(chalk.gray(error.stack));
      process.exit(1);
    }
  });

// Playlist command
program
  .command('playlist <action> [name]')
  .description('Manage playlists (create, list, load, delete)')
  .action(async (action, name) => {
    const player = new Player();
    
    try {
      switch (action) {
        case 'list':
          const playlists = await player.listPlaylists();
          if (playlists.length === 0) {
            console.log(chalk.yellow('No saved playlists found'));
          } else {
            console.log(chalk.cyan('\n📝 Saved Playlists:\n'));
            playlists.forEach(pl => {
              console.log(chalk.white(`  ${pl.name}`));
              console.log(chalk.gray(`    Created: ${new Date(pl.created).toLocaleDateString()}`));
              console.log(chalk.gray(`    Tracks: ${pl.trackCount}\n`));
            });
          }
          break;

        case 'save':
          if (!name) {
            console.log(chalk.red('✗ Please provide a playlist name'));
            return;
          }
          const savedPath = await player.savePlaylist(name);
          console.log(chalk.green(`✓ Playlist saved: ${savedPath}`));
          break;

        case 'load':
          if (!name) {
            console.log(chalk.red('✗ Please provide a playlist name'));
            return;
          }
          const playlist = await player.loadPlaylistFile(name);
          console.log(chalk.green(`✓ Loaded playlist: ${playlist.name}`));
          console.log(chalk.gray(`  Tracks: ${playlist.tracks.length}`));
          break;

        case 'delete':
          if (!name) {
            console.log(chalk.red('✗ Please provide a playlist name'));
            return;
          }
          await player.deletePlaylist(name);
          console.log(chalk.green(`✓ Deleted playlist: ${name}`));
          break;

        default:
          console.log(chalk.red(`✗ Unknown action: ${action}`));
          console.log(chalk.gray('Available actions: list, save, load, delete'));
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

// Info command
program
  .command('info <file>')
  .description('Display information about an audio file')
  .action(async (file) => {
    try {
      const { parseFile } = require('music-metadata');
      const metadata = await parseFile(file);
      
      console.log(chalk.cyan('\n🎵 File Information:\n'));
      console.log(chalk.white(`  Title: ${metadata.common.title || 'Unknown'}`));
      console.log(chalk.white(`  Artist: ${metadata.common.artist || 'Unknown'}`));
      console.log(chalk.white(`  Album: ${metadata.common.album || 'Unknown'}`));
      console.log(chalk.white(`  Year: ${metadata.common.year || 'Unknown'}`));
      console.log(chalk.white(`  Genre: ${metadata.common.genre ? metadata.common.genre.join(', ') : 'Unknown'}`));
      console.log(chalk.white(`  Duration: ${Math.floor(metadata.format.duration / 60)}:${Math.floor(metadata.format.duration % 60).toString().padStart(2, '0')}`));
      console.log(chalk.white(`  Format: ${metadata.format.container}`));
      console.log(chalk.white(`  Bitrate: ${Math.floor(metadata.format.bitrate / 1000)} kbps\n`));
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

// YouTube command
program
  .command('youtube <action>')
  .description('YouTube integration (search, download, import)')
  .argument('[query]', 'Search query or URL')
  .option('-l, --limit <number>', 'Limit search results', '10')
  .action(async (action, query, options) => {
    const yt = new YouTubeManager();
    
    try {
      switch (action) {
        case 'search':
          if (!query) {
            console.log(chalk.red('✗ Please provide a search query'));
            return;
          }
          const results = await yt.search(query, parseInt(options.limit));
          console.log(chalk.cyan(`\n🔍 Search Results for "${query}":\n`));
          results.forEach((result, index) => {
            console.log(chalk.white(`${index + 1}. ${result.title}`));
            console.log(chalk.gray(`   Channel: ${result.channel}`));
            console.log(chalk.gray(`   Duration: ${result.duration}`));
            console.log(chalk.gray(`   URL: ${result.url}\n`));
          });
          break;

        case 'download':
          if (!query) {
            console.log(chalk.red('✗ Please provide a YouTube URL'));
            return;
          }
          console.log(chalk.blue('⏬ Downloading audio...'));
          const download = await yt.downloadAudio(query);
          if (download.cached) {
            console.log(chalk.green(`✓ Using cached: ${download.title}`));
          } else {
            console.log(chalk.green(`✓ Downloaded: ${download.title}`));
          }
          console.log(chalk.gray(`  Path: ${download.path}`));
          break;

        case 'import':
          if (!query) {
            console.log(chalk.red('✗ Please provide a YouTube playlist URL'));
            return;
          }
          console.log(chalk.blue('📥 Importing playlist...'));
          const playlist = await yt.importPlaylist(query);
          console.log(chalk.green(`✓ Imported playlist: ${playlist.title}`));
          console.log(chalk.gray(`  Videos: ${playlist.items.length}\n`));
          playlist.items.slice(0, 5).forEach((item, index) => {
            console.log(chalk.white(`${index + 1}. ${item.title}`));
          });
          if (playlist.items.length > 5) {
            console.log(chalk.gray(`  ... and ${playlist.items.length - 5} more`));
          }
          console.log(chalk.cyan('\n💡 To play these tracks:'));
          console.log(chalk.gray('  Use the URLs shown above with: terminal-tunes play <url>'));
          break;

        case 'cache':
          const size = await yt.getCacheSize();
          console.log(chalk.cyan(`\n💾 Cache Size: ${(size / 1024 / 1024).toFixed(2)} MB\n`));
          break;

        case 'clear':
          await yt.clearCache();
          console.log(chalk.green('✓ Cache cleared'));
          break;

        default:
          console.log(chalk.red(`✗ Unknown action: ${action}`));
          console.log(chalk.gray('Available actions: search, download, import, cache, clear'));
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

// Curated Playlists command
program
  .command('curated <action> [id]')
  .description('Browse ad-free curated playlists')
  .option('-c, --category <category>', 'Filter by category')
  .action(async (action, id, options) => {
    const curated = new CuratedPlaylists();
    
    try {
      switch (action) {
        case 'list':
          const playlists = options.category 
            ? await curated.getByCategory(options.category)
            : await curated.list();
          
          console.log(chalk.cyan('\n🎵 Curated Playlists (Ad-Free):\n'));
          playlists.forEach(pl => {
            console.log(chalk.white(`  ${pl.id}`));
            console.log(chalk.green(`    ${pl.name}`));
            console.log(chalk.gray(`    ${pl.description}`));
            console.log(chalk.blue(`    Category: ${pl.category} | Tracks: ${pl.trackCount}\n`));
          });
          break;

        case 'categories':
          const categories = await curated.getCategories();
          console.log(chalk.cyan('\n📁 Categories:\n'));
          categories.forEach(cat => console.log(chalk.white(`  • ${cat}`)));
          console.log();
          break;

        default:
          console.log(chalk.red(`✗ Unknown action: ${action}`));
          console.log(chalk.gray('Available actions: list, categories'));
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
  
  console.log(chalk.cyan('\nQuick Start:'));
  console.log(chalk.gray('  $ terminal-tunes play song.mp3'));
  console.log(chalk.gray('  $ terminal-tunes curated list'));
  console.log(chalk.gray('  $ terminal-tunes youtube search "lofi beats"'));
}
