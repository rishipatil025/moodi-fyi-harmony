import { useState, useEffect, useRef, useCallback } from 'react';
import { Track } from '@/data/mockMusic';
import { getSongsByMood } from '@/services/jiosaavn';

interface MusicPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  queue: Track[];
  currentTrackIndex: number;
}

export const useMusicPlayer = () => {
  const [state, setState] = useState<MusicPlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    volume: 70,
    queue: [],
    currentTrackIndex: -1,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    // Set up audio event listeners
    const handleTimeUpdate = () => {
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const handleEnded = () => {
      setState(prev => {
        const nextIndex = prev.currentTrackIndex + 1;
        if (nextIndex < prev.queue.length) {
          return {
            ...prev,
            currentTrackIndex: nextIndex,
            currentTrack: prev.queue[nextIndex],
            currentTime: 0,
            isPlaying: true,
          };
        } else {
          return {
            ...prev,
            isPlaying: false,
            currentTime: 0,
          };
        }
      });
    };

    const handleLoadedData = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration || 0,
      }));
    };

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      setState(prev => ({
        ...prev,
        isPlaying: false,
      }));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Handle track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack?.url) return;

    audio.src = state.currentTrack.url;
    audio.currentTime = state.currentTime;
    
    if (state.isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [state.currentTrack?.url]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = state.volume / 100;
  }, [state.volume]);

  // Handle seek changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Only update if there's a significant difference to avoid feedback loops
    if (Math.abs(audio.currentTime - state.currentTime) > 1) {
      audio.currentTime = state.currentTime;
    }
  }, [state.currentTime]);

  const playTrack = useCallback((track: Track, queue: Track[] = [track]) => {
    const trackIndex = queue.findIndex(t => t.id === track.id);
    setState(prev => ({
      ...prev,
      currentTrack: track,
      queue,
      currentTrackIndex: trackIndex >= 0 ? trackIndex : 0,
      isPlaying: true,
      currentTime: 0,
    }));
  }, []);

  const loadMoodPlaylist = useCallback(async (mood: string) => {
    try {
      const tracks = await getSongsByMood(mood, 15);
      if (tracks.length > 0) {
        setState(prev => ({
          ...prev,
          currentTrack: tracks[0],
          queue: tracks,
          currentTrackIndex: 0,
          isPlaying: true,
          currentTime: 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load mood playlist:', error);
    }
  }, []);

  const playPlaylist = useCallback((tracks: Track[], startIndex: number = 0) => {
    if (tracks.length > 0 && startIndex < tracks.length) {
      setState(prev => ({
        ...prev,
        currentTrack: tracks[startIndex],
        queue: tracks,
        currentTrackIndex: startIndex,
        isPlaying: true,
        currentTime: 0,
      }));
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  const playNext = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentTrackIndex + 1;
      if (nextIndex < prev.queue.length) {
        return {
          ...prev,
          currentTrackIndex: nextIndex,
          currentTrack: prev.queue[nextIndex],
          currentTime: 0,
          isPlaying: true,
        };
      }
      return prev;
    });
  }, []);

  const playPrevious = useCallback(() => {
    setState(prev => {
      // If we're more than 3 seconds into the song, restart it
      if (prev.currentTime > 3) {
        return {
          ...prev,
          currentTime: 0,
        };
      }
      
      // Otherwise go to previous track
      const prevIndex = prev.currentTrackIndex - 1;
      if (prevIndex >= 0) {
        return {
          ...prev,
          currentTrackIndex: prevIndex,
          currentTrack: prev.queue[prevIndex],
          currentTime: 0,
          isPlaying: true,
        };
      }
      return prev;
    });
  }, []);

  const seekTo = useCallback((time: number) => {
    setState(prev => ({
      ...prev,
      currentTime: Math.max(0, Math.min(time, prev.currentTrack?.duration || 0)),
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({
      ...prev,
      volume: Math.max(0, Math.min(100, volume)),
    }));
  }, []);

  return {
    ...state,
    playTrack,
    playPlaylist,
    loadMoodPlaylist,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
  };
};
