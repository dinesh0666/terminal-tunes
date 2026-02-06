class TerminalTunes < Formula
  desc "Beautiful CLI music player with visualizations and YouTube integration"
  homepage "https://github.com/yourusername/terminal-tunes"
  url "https://github.com/yourusername/terminal-tunes/archive/v1.0.0.tar.gz"
  sha256 "REPLACE_WITH_ACTUAL_SHA256"
  license "MIT"

  depends_on "node"
  depends_on "ffmpeg" => :optional

  def install
    system "npm", "install", "--production"
    libexec.install Dir["*"]
    bin.write_exec_script libexec/"bin/terminal-tunes.js"
  end

  def caveats
    <<~EOS
      TerminalTunes has been installed!

      Quick start:
        terminal-tunes play song.mp3
        terminal-tunes curated list

      For YouTube features:
        brew install ffmpeg
    EOS
  end

  test do
    system bin/"terminal-tunes", "--version"
  end
end
