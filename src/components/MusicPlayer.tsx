import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number;
}

interface MusicPlayerProps {
  currentTrack?: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentTime: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const MusicPlayer = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  currentTime,
  onSeek,
  volume,
  onVolumeChange,
}: MusicPlayerProps) => {
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isLiked, setIsLiked] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio visualizer bars
  const visualizerBars = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className={`visualizer-bar w-1 bg-gradient-primary rounded-full transition-all duration-300 ${
        isPlaying ? 'animate-pulse' : 'h-1'
      }`}
      style={{
        animationDelay: `${i * 0.1}s`,
        height: isPlaying ? `${Math.random() * 16 + 4}px` : '4px',
      }}
    />
  ));

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-card border-t-2 border-primary/30 p-6 z-50 shadow-intense">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Track Info */}
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className="relative group">
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.album}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-neon breathe"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold font-japanese text-xl text-white truncate neon-text">{currentTrack.title}</h3>
              <p className="text-sm text-foreground-secondary truncate font-elegant mt-1">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <Button
              size="sm"
              variant="ghost"
              onClick={onPrevious}
              className="text-white hover:text-primary-glow hover:scale-110 transition-all duration-300"
            >
              <SkipBack className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              onClick={onPlayPause}
              className="w-16 h-16 rounded-full bg-gradient-primary shadow-neon hover:shadow-intense hover:scale-110 transition-all duration-300"
            >
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onNext}
              className="text-white hover:text-primary-glow hover:scale-110 transition-all duration-300"
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          {/* Volume & Progress */}
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <Slider
                value={[currentTime]}
                max={currentTrack.duration}
                step={1}
                onValueChange={([value]) => onSeek(value)}
                className="cursor-pointer progress-bar"
              />
              <div className="flex justify-between text-xs text-foreground-secondary font-japanese mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-[140px]">
              <Volume2 className="h-5 w-5 text-primary-soft" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={([value]) => onVolumeChange(value)}
                className="w-28 cursor-pointer"
              />
            </div>
          </div>

          {/* Enhanced Audio Visualizer */}
          <div className="flex items-end gap-1.5 h-12">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 bg-gradient-primary rounded-full transition-all duration-300 shadow-glow ${
                  isPlaying ? 'visualizer-bar' : 'h-3'
                }`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;