#!/bin/bash

# TerminalTunes Installation & Demo Script

echo "🎵 TerminalTunes Setup Script"
echo "=============================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Error: Node.js 16 or higher is required"
    echo "   Current version: $(node -v)"
    exit 1
fi
echo "✓ Node.js $(node -v) detected"
echo ""

# Check for system audio player
echo "Checking for audio player..."
if command -v afplay &> /dev/null; then
    echo "✓ afplay found (macOS)"
    PLAYER="afplay"
elif command -v mpg123 &> /dev/null; then
    echo "✓ mpg123 found (Linux)"
    PLAYER="mpg123"
elif command -v aplay &> /dev/null; then
    echo "✓ aplay found (Linux)"
    PLAYER="aplay"
else
    echo "⚠️  Warning: No audio player found"
    echo "   Install one of: afplay (macOS), mpg123, or aplay (Linux)"
fi
echo ""

# Check for ffmpeg (optional but recommended)
echo "Checking for ffmpeg..."
if command -v ffmpeg &> /dev/null; then
    echo "✓ ffmpeg found"
else
    echo "⚠️  ffmpeg not found (optional, but recommended for YouTube features)"
    echo "   Install with:"
    echo "   - macOS: brew install ffmpeg"
    echo "   - Linux: sudo apt-get install ffmpeg"
fi
echo ""

# Install dependencies
echo "Installing dependencies..."
if npm install --quiet; then
    echo "✓ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Create necessary directories
echo "Creating directories..."
mkdir -p data/playlists
mkdir -p data/youtube
echo "✓ Directories created"
echo ""

# Make executable
echo "Making executable..."
chmod +x bin/terminal-tunes.js
echo "✓ Made executable"
echo ""

echo "=============================="
echo "✨ Setup Complete!"
echo "=============================="
echo ""
echo "Quick Start:"
echo "  ./bin/terminal-tunes.js --help"
echo "  ./bin/terminal-tunes.js play ./music"
echo ""
echo "Optional: Link globally with 'npm link'"
echo ""
