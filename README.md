# 🎵 Terminal Tunes

A beautiful CLI music player with real-time audio visualizations, YouTube streaming support, and ad-free curated playlists.

```
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
```

## 🎬 Demo

![Terminal Tunes Demo](https://github.com/dinesh0666/terminal-tunes/raw/main/demo.gif)

## ✨ Features

- 🎨 **Beautiful Spectrum Visualizer** - Real-time audio visualization with colorful bars
- 🎬 **YouTube Streaming** - Stream music directly from YouTube URLs with loading animations
- 📁 **Local Playback** - Play your local MP3 files and folders
- ⏯️  **Full Playback Control** - Play, pause, next, previous, volume control
- 📊 **Progress Tracking** - Real-time progress with duration display
- 🎯 **Curated Playlists** - Pre-built playlists for different moods
- 💾 **Custom Playlists** - Create playlists mixing local files and YouTube URLs
- 📝 **Playlist Management** - Save, load, and manage your playlists
- 🔀 **Shuffle & Repeat** - Shuffle and repeat modes
- 🎚️  **Dynamic Volume Control** - Adjust volume instantly without interrupting playback
- 🌐 **Network Error Handling** - Smart timeout and animated error displays for connectivity issues

## 📋 Requirements

### macOS
```bash
# Install mpv (for YouTube streaming)
brew install mpv

# Install yt-dlp (for YouTube metadata)
brew install yt-dlp
```

### Linux
```bash
# Ubuntu/Debian
sudo apt install mpv yt-dlp

# Fedora
sudo dnf install mpv yt-dlp

# Arch Linux
sudo pacman -S mpv yt-dlp
```

### Windows
- Install [mpv](https://mpv.io/installation/)
- Install [yt-dlp](https://github.com/yt-dlp/yt-dlp#installation)

## 🚀 Installation

### Option 1: Install from npm (Global)
```bash
npm install -g terminal-tunes
```

### Option 2: Clone and Install
```bash
# Clone the repository
git clone https://github.com/dinesh0666/terminal-tunes.git
cd terminal-tunes

# Install dependencies
npm install

# Link globally (optional)
npm link
```

## 🎮 Usage

### Basic Commands

#### Play a local music file
```bash
terminal-tunes play song.mp3
# or use short alias
tt play song.mp3
```

#### Play all music in a folder
```bash
terminal-tunes play ~/Music/
```

#### Stream from YouTube
```bash
terminal-tunes play "https://www.youtube.com/watch?v=VIDEO_ID"
# or short URL
terminal-tunes play "https://youtu.be/VIDEO_ID"
```

#### Play with options
```bash
# Shuffle playback
terminal-tunes play ~/Music/ --shuffle

# Repeat playlist
terminal-tunes play ~/Music/ --repeat

# Set volume (0-100)
terminal-tunes play song.mp3 --volume 50

# Combine options
terminal-tunes play ~/Music/ --shuffle --repeat --volume 80
```

### Keyboard Controls

Once the player is running, use these keyboard shortcuts:

| Key | Action |
|-----|--------|
| `Space` or `P` | Play/Pause |
| `N` | Next track |
| `B` | Previous track |
| `S` | Stop playback |
| `↑` or `+` | Increase volume |
| `↓` or `-` | Decrease volume |
| `Q` or `ESC` | Quit player |

## 📚 Command Reference

### Play Command
```bash
terminal-tunes play [file/folder/url] [options]

Options:
  -s, --shuffle          Shuffle playback
  -r, --repeat           Repeat playback
  -v, --volume <level>   Set volume (0-100, default: 80)
```

### Curated Playlists
```bash
# List available playlists
terminal-tunes curated list

# Play a curated playlist
terminal-tunes curated play <playlist-name>

Available playlists:
  - chill-vibes
  - workout-energy
  - focus-flow
  - sleep-sounds
```

### Playlist Management
```bash
# Create a custom playlist (mix local files and YouTube URLs)
terminal-tunes playlist create my-playlist
# Then add tracks interactively:
#   Track 1: ~/Music/song.mp3
#   Track 2: https://www.youtube.com/watch?v=VIDEO_ID
#   Track 3: ~/Music/another-song.mp3
#   done

# Save current playing playlist
terminal-tunes playlist save <name>

# Load a saved playlist
terminal-tunes playlist load <name>

# List all saved playlists
terminal-tunes playlist list

# Delete a playlist
terminal-tunes playlist delete <name>
```

### YouTube Integration
```bash
# Search YouTube
terminal-tunes youtube search "song name"

# Play from search results
terminal-tunes play "https://www.youtube.com/watch?v=VIDEO_ID"

# Import YouTube playlist
terminal-tunes youtube import "https://www.youtube.com/playlist?list=PLAYLIST_ID"

# This will show all videos in the playlist with their URLs
# Then play any video using:
terminal-tunes play "https://www.youtube.com/watch?v=VIDEO_ID"
```

## 🎨 Interface Overview

```
┌─Audio Spectrum───────────────────────────────────────────────────┐
│  ▉ ▉ ▉ ▉     ▉ ▉ ▉ ▉ ▉     ▉ ▉ ▉                                │
│  Now Playing: Artist - Song Title                                 │
└──────────────────────────────────────────────────────────────────┘

┌─♪ Now Playing──────┐  ┌─≡ Playlist──────────────────┐
│ Song Title          │  │ 1. First Song               │
│                     │  │ 2. Second Song ▶            │
│ Artist: Unknown     │  │ 3. Third Song               │
│ Album: Unknown      │  └─────────────────────────────┘
│ Format: stream      │
│                     │
│ Status: ▶ Playing   │
└─────────────────────┘

┌─Progress [0:45 / 3:30]──────────────┐  ┌─Vol 80%───┐
└─────────────────────────────────────┘  └───────────┘

┌─Controls────────────────────────────────────────────┐
│  [SPACE/P] Play/Pause   [N] Next   [B] Previous     │
│  [↑/↓ or +/-] Volume    [Q/ESC] Quit                │
└─────────────────────────────────────────────────────┘
```

## 🛠️ Examples

### Example 1: Play Local Music
```bash
# Play a single song
tt play ~/Music/favorite-song.mp3

# Play all MP3s in a folder with shuffle
tt play ~/Music/Rock/ --shuffle --repeat
```

### Example 2: YouTube Streaming
```bash
# Stream a music video
tt play "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# The player will:
# 1. Fetch video metadata (title, duration)
# 2. Show loading animation
# 3. Stream audio using mpv
# 4. Display real-time progress
```

### Example 3: Import and Play YouTube Playlist
```bash
# Import a YouTube playlist
tt youtube import "https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG"

# The command will display:
# ✓ Imported playlist: My Favorite Songs
#   Videos: 25
# 
# 1. Song Title 1
# 2. Song Title 2
# 3. Song Title 3
# ...

# Then play any song from the list using its URL
tt play "https://www.youtube.com/watch?v=VIDEO_ID"

# Or search and play
tt youtube search "lofi hip hop"
# Copy the URL from search results and play it
```

### Example 4: Create a Custom Mixed Playlist
```bash
# Create a playlist with both local and YouTube tracks
tt playlist create my-favorites

# Add tracks interactively:
Track 1 (path or URL): ~/Music/Jazz/cool-jazz.mp3
  ✓ Added: cool-jazz.mp3
Track 2 (path or URL): https://www.youtube.com/watch?v=jfKfPfyJRdk
  📡 Fetching YouTube metadata...
  ✓ Added: Lofi Hip Hop Mix
Track 3 (path or URL): ~/Music/Rock/epic-rock.mp3
  ✓ Added: epic-rock.mp3
Track 4 (path or URL): done

✓ Playlist "my-favorites" created with 3 tracks

# Load and play it
tt playlist load my-favorites
tt play
```

### Example 5: Save Currently Playing Playlist
```bash
# Play a folder and save it as a playlist
tt play ~/Music/Favorites/ --shuffle
# Then in another terminal:
tt playlist save my-favorites

# Later, load and play it
tt playlist load my-favorites
```

## 🐛 Troubleshooting

### Issue: "mpv not found"
**Solution:** Install mpv using your package manager
```bash
# macOS
brew install mpv

# Linux
sudo apt install mpv  # Ubuntu/Debian
```

### Issue: "yt-dlp not found" 
**Solution:** Install yt-dlp
```bash
# macOS
brew install yt-dlp

# Linux
sudo apt install yt-dlp
```

### Issue: YouTube streaming fails
**Solution:** Update yt-dlp to the latest version
```bash
# Using pip
pip install --upgrade yt-dlp

# Using Homebrew
brew upgrade yt-dlp
```

### Issue: No audio output on macOS
**Solution:** Terminal Tunes uses `afplay` for local files (built-in on macOS). Make sure your system audio is working and not muted.

### Issue: Volume changes restart the track
**Note:** This is expected behavior. Due to limitations with `afplay` and `mpv`, changing volume requires restarting playback. The track will resume from the same position for streams.

## 📝 Notes

- **Local Files**: Uses native `afplay` on macOS for best compatibility
- **Streaming**: Requires `mpv` and `yt-dlp` for YouTube support
- **Audio Formats**: Supports MP3, M4A, WAV, FLAC, and more
- **Visualization**: Simulated frequency data (real FFT analysis coming soon)
- **Progress Tracking**: Based on metadata duration for local files, actual duration for streams

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Credits

Built with:
- [blessed](https://github.com/chjj/blessed) - Terminal UI framework
- [blessed-contrib](https://github.com/yaronn/blessed-contrib) - Terminal charts and widgets
- [mpv](https://mpv.io/) - Media player for streaming
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube downloader
- [music-metadata](https://github.com/Borewit/music-metadata) - Audio metadata parser

## 📮 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with ❤️ for music lovers who live in the terminal
