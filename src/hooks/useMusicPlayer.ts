import { useState, useEffect, useRef, useCallback } from 'react';
import { Track } from '@/data/mockMusic';

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

  const intervalRef = useRef<NodeJS.Timeout>();

  // Simulate audio playback with timer
  useEffect(() => {
    if (state.isPlaying && state.currentTrack) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const newTime = prev.currentTime + 1;
          
          // Auto advance to next track when current track ends
          if (newTime >= prev.currentTrack!.duration) {
            if (prev.currentTrackIndex < prev.queue.length - 1) {
              return {
                ...prev,
                currentTrackIndex: prev.currentTrackIndex + 1,
                currentTrack: prev.queue[prev.currentTrackIndex + 1],
                currentTime: 0,
              };
            } else {
              // End of playlist
              return {
                ...prev,
                isPlaying: false,
                currentTime: 0,
              };
            }
          }
          
          return {
            ...prev,
            currentTime: newTime,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isPlaying, state.currentTrack]);

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
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
  };
};
