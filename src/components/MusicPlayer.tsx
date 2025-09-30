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
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-glow/20 p-6 energy-aura">
      <div className="max-w-7xl mx-auto flex items-center gap-6">
        {/* Anime Track Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1 max-w-sm">
          <div className="relative group power-glow">
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.album}
              className="w-16 h-16 rounded-xl object-cover shadow-neon transition-all duration-500 group-hover:scale-110 breathe"
            />
            <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300" />
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-foreground truncate font-japanese text-lg neon-text">
              {currentTrack.title}
            </h4>
            <p className="text-sm text-foreground-secondary truncate font-elegant">
              {currentTrack.artist}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className={`opacity-70 hover:opacity-100 transition-all ${
              isLiked ? 'text-mood-love' : 'text-muted-foreground'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Main Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShuffled(!isShuffled)}
              className={`opacity-70 hover:opacity-100 transition-all ${
                isShuffled ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="opacity-70 hover:opacity-100 transition-all"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={onPlayPause}
              className="w-14 h-14 rounded-full bg-gradient-hero shadow-neon hover:shadow-intense transition-all duration-500 hover:scale-110 power-glow energy-aura"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-background" />
              ) : (
                <Play className="w-6 h-6 text-background ml-1" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              className="opacity-70 hover:opacity-100 transition-all"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
                const currentIndex = modes.indexOf(repeatMode);
                setRepeatMode(modes[(currentIndex + 1) % modes.length]);
              }}
              className={`opacity-70 hover:opacity-100 transition-all ${
                repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3 w-full max-w-md">
            <span className="text-xs text-muted-foreground font-mono">
              {formatTime(currentTime)}
            </span>
            
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={currentTrack.duration}
                step={1}
                onValueChange={([value]) => onSeek(value)}
                className="w-full"
              />
            </div>
            
            <span className="text-xs text-muted-foreground font-mono">
              {formatTime(currentTrack.duration)}
            </span>
          </div>
        </div>

        {/* Anime Audio Visualizer & Volume */}
        <div className="flex items-center gap-6 min-w-0 flex-1 max-w-sm justify-end">
          {/* Enhanced Audio Visualizer */}
          <div className="hidden md:flex items-end gap-1 h-8 power-glow">
            {visualizerBars}
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <div className="w-20">
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={([value]) => onVolumeChange(value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;