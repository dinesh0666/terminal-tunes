---
title: Terminal Tunes - A Beautiful CLI Music Player with YouTube Streaming
published: false
tags: devchallenge, githubchallenge, cli, githubcopilot
---

*This is a submission for the [GitHub Copilot CLI Challenge](https://dev.to/challenges/github-2026-01-21)*

## What I Built

**Terminal Tunes** - A feature-rich CLI music player that brings the joy of music to your terminal with:

- 🎨 **Real-time Audio Spectrum Visualizer** - Colorful frequency bars that dance to your music
- 🎬 **YouTube Streaming** - Stream music directly from YouTube URLs and playlists with smart loading animations
- 📁 **Local File Playback** - Play MP3, M4A, WAV, FLAC files and entire folders
- 💾 **Smart Playlists** - Create custom playlists mixing local files and YouTube URLs
- 📊 **Live Progress Tracking** - Real-time progress bars with actual duration
- 🎚️ **Dynamic Volume Control** - Adjust volume instantly using mpv IPC without interrupting playback
- 🔀 **Shuffle & Repeat** - Full playback control with keyboard shortcuts
- 🌐 **Network Error Handling** - 15-second timeout with animated error displays for offline/connectivity issues

The player features a beautiful terminal UI built with blessed and blessed-contrib, providing a Spotify-like experience right in your terminal.

## Demo

**GitHub Repository:** [https://github.com/dinesh0666/terminal-tunes](https://github.com/dinesh0666/terminal-tunes)

### Video Demo

![Terminal Tunes Demo](https://github.com/dinesh0666/terminal-tunes/raw/main/demo.gif)

<!-- Or for MP4 video: -->
<!-- 
https://github.com/dinesh0666/terminal-tunes/assets/YOUR_USER_ID/YOUR_ASSET_ID.mp4
-->

### Screenshots

**Main Player Interface:**
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
```

### Quick Start

```bash
# Install globally
npm install -g terminal-tunes

# Play local music
tt play ~/Music/ --shuffle

# Stream from YouTube
tt play "https://www.youtube.com/watch?v=VIDEO_ID"

# Create custom playlist
tt playlist create my-mix
# Mix local files and YouTube URLs interactively

# Import YouTube playlist
tt youtube import "PLAYLIST_URL"
```

### Key Features Demo

**1. YouTube Streaming with Loading Animation:**
- Detects YouTube URLs automatically
- Fetches video metadata (title, duration) using yt-dlp
- Shows beautiful loading animation while buffering
- Displays real-time progress tracking

**2. Custom Mixed Playlists:**
- Create playlists combining local MP3s and YouTube URLs
- Interactive track addition with metadata validation
- Save, load, and manage playlists easily

**3. Real-time Audio Visualization:**
- 32-bar spectrum analyzer with color gradients
- Smooth animations synced with playback
- Modern Spotify-inspired design

## My Experience with GitHub Copilot CLI

Building Terminal Tunes with GitHub Copilot CLI was transformative. Here's how it impacted my development:

### 🚀 Rapid Prototyping
Copilot helped me quickly scaffold the project structure, suggesting the perfect libraries (blessed, blessed-contrib) for terminal UI. It understood my intent to build a "CLI music player with visualizations" and recommended the entire tech stack including mpv for streaming and yt-dlp for YouTube metadata.

### 🐛 Problem-Solving Challenges
One of the biggest challenges was **process management** - preventing zombie processes when users pause/resume or change tracks. Copilot suggested multiple killing strategies:
- PID-based termination
- Process group killing
- Synchronous cleanup with `execSync`
- Fallback commands (killall, pkill, ps+awk)

This multi-layered approach solved audio playback conflicts that would have taken hours to debug manually.

### 💡 Smart Suggestions
When implementing YouTube streaming, Copilot:
- Recommended using `yt-dlp` for metadata fetching (actual duration, not static)
- Suggested process spawning with `afplay` for local files vs `mpv` for streams
- Helped implement loading animations and error handling for network issues

### 🎨 UI/UX Enhancements
Copilot suggested adding:
- Volume percentage labels on gauge widgets
- Loading animations using braille characters (⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏)
- Network error displays with pulsing borders
- Force-clearing trackInfo content to prevent UI state bugs

### 📚 Code Organization
It helped restructure 500+ lines of player logic into clean sections:
- Process Management
- Playback Control  
- Visualization & Progress
- Playlist Management

With private methods (`_initializeState`, `_cleanupZombieProcesses`) and comprehensive JSDoc comments.

### ⚡ Time Saved
What would have taken 2-3 weeks of research and trial-and-error was completed in days. Copilot's context-aware suggestions meant:
- Less time reading documentation
- Fewer bugs to debug
- More time on features, not boilerplate

### 🎯 Workflow Impact
My typical workflow became:
1. Write a comment describing what I want
2. Copilot suggests implementation
3. Accept or modify suggestion
4. Test and iterate

This conversational coding style felt natural and productive. I could focus on **what** to build, while Copilot helped with **how** to build it.

### 🔧 Technical Deep Dive
Some impressive moments:
- Suggested using `music-metadata` for parsing MP3 duration
- Recommended EventEmitter pattern for player state management
- Proposed request IDs to prevent race conditions in async playback
- Helped implement YouTube playlist import with ytdl-core

### 📈 Learning Opportunity
Beyond just code generation, Copilot became a learning tool. It exposed me to:
- Better Node.js process management techniques
- Terminal UI best practices with blessed
- YouTube metadata extraction patterns
- Efficient error handling for network operations

## Technical Stack

- **Runtime:** Node.js
- **UI Framework:** blessed, blessed-contrib
- **Audio Players:** afplay (macOS local), mpv (streaming)
- **YouTube Integration:** yt-dlp, ytdl-core, youtube-search-api
- **Metadata Parsing:** music-metadata
- **CLI Framework:** Commander.js

## Installation

```bash
# Clone repository
git clone https://github.com/dinesh0666/terminal-tunes.git
cd terminal-tunes

# Install dependencies
npm install

# Install system dependencies
brew install mpv yt-dlp  # macOS

# Run
npm start play ~/Music/ --shuffle
```

## Impact & Future

Terminal Tunes demonstrates that CLI tools don't have to be boring. With proper UI design and modern features like streaming, they can compete with GUI applications.

### Future Enhancements:
- Real FFT audio analysis (currently simulated)
- Seek/scrubbing functionality
- Lyrics display integration
- Last.fm scrobbling support
- Cross-platform audio engine

## Conclusion

GitHub Copilot CLI transformed how I approach development. It's not just an autocomplete tool—it's a pair programming partner that understands context, suggests best practices, and helps solve complex problems. Building Terminal Tunes showed me that with the right tools, ambitious projects become achievable in record time.

**Try it yourself:**
```bash
npm install -g terminal-tunes
tt play "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

---

Made with ❤️ for music lovers who live in the terminal

**Repository:** [github.com/dinesh0666/terminal-tunes](https://github.com/dinesh0666/terminal-tunes)  
**Tags:** #cli #music #nodejs #githubcopilot #terminal
