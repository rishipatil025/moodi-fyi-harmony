import { useState, useEffect, useRef, useCallback } from 'react';
import { Track } from '@/data/mockMusic';
import { getSongsByMood } from '@/services/jiosaavn';
import { toast } from '@/hooks/use-toast';

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: Date;
}

export interface HistoryItem {
  track: Track;
  playedAt: Date;
  duration: number;
}

interface MusicPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  currentTrackIndex: number;
  playlists: Playlist[];
  favorites: Track[];
  history: HistoryItem[];
  recentlyPlayed: Track[];
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  originalQueue: Track[];
}

const STORAGE_KEYS = {
  PLAYLISTS: 'moodify_playlists',
  FAVORITES: 'moodify_favorites',
  HISTORY: 'moodify_history',
  RECENTLY_PLAYED: 'moodify_recently_played',
  VOLUME: 'moodify_volume',
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};

export const useMusicPlayer = () => {
  const [state, setState] = useState<MusicPlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: loadFromStorage(STORAGE_KEYS.VOLUME, 70),
    queue: [],
    currentTrackIndex: -1,
    playlists: loadFromStorage<Playlist[]>(STORAGE_KEYS.PLAYLISTS, []),
    favorites: loadFromStorage<Track[]>(STORAGE_KEYS.FAVORITES, []),
    history: loadFromStorage<HistoryItem[]>(STORAGE_KEYS.HISTORY, []),
    recentlyPlayed: loadFromStorage<Track[]>(STORAGE_KEYS.RECENTLY_PLAYED, []),
    shuffle: false,
    repeat: 'off',
    originalQueue: [],
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playStartTimeRef = useRef<number>(0);

  // Save to localStorage when state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PLAYLISTS, state.playlists);
  }, [state.playlists]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FAVORITES, state.favorites);
  }, [state.favorites]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HISTORY, state.history);
  }, [state.history]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECENTLY_PLAYED, state.recentlyPlayed);
  }, [state.recentlyPlayed]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.VOLUME, state.volume);
  }, [state.volume]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    if (audio) {
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
    }
    
    const handleTimeUpdate = () => {
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const handleEnded = () => {
      // Save to history
      if (state.currentTrack) {
        const listenDuration = Date.now() - playStartTimeRef.current;
        addToHistory(state.currentTrack, listenDuration);
      }

      setState(prev => {
        if (prev.repeat === 'one') {
          return {
            ...prev,
            currentTime: 0,
            isPlaying: true,
          };
        }

        const nextIndex = prev.currentTrackIndex + 1;
        if (nextIndex < prev.queue.length) {
          return {
            ...prev,
            currentTrackIndex: nextIndex,
            currentTrack: prev.queue[nextIndex],
            currentTime: 0,
            isPlaying: true,
          };
        } else if (prev.repeat === 'all' && prev.queue.length > 0) {
          return {
            ...prev,
            currentTrackIndex: 0,
            currentTrack: prev.queue[0],
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
  }, [state.currentTrack, state.repeat]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          if (e.shiftKey) {
            playNext();
          } else {
            seekTo(state.currentTime + 10);
          }
          break;
        case 'ArrowLeft':
          if (e.shiftKey) {
            playPrevious();
          } else {
            seekTo(state.currentTime - 10);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(100, state.volume + 5));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, state.volume - 5));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.currentTime, state.volume]);

  // Handle track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack?.url) return;

    audio.src = state.currentTrack.url;
    audio.currentTime = state.currentTime;
    playStartTimeRef.current = Date.now();
    
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
    
    if (Math.abs(audio.currentTime - state.currentTime) > 1) {
      audio.currentTime = state.currentTime;
    }
  }, [state.currentTime]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const addToHistory = useCallback((track: Track, duration: number) => {
    setState(prev => {
      const newHistoryItem: HistoryItem = {
        track,
        playedAt: new Date(),
        duration,
      };
      const newHistory = [newHistoryItem, ...prev.history].slice(0, 100);
      return { ...prev, history: newHistory };
    });
  }, []);

  const addToRecentlyPlayed = useCallback((track: Track) => {
    setState(prev => {
      const filtered = prev.recentlyPlayed.filter(t => t.id !== track.id);
      const newRecentlyPlayed = [track, ...filtered].slice(0, 20);
      return { ...prev, recentlyPlayed: newRecentlyPlayed };
    });
  }, []);

  const playTrack = useCallback((track: Track, queue: Track[] = [track]) => {
    const trackIndex = queue.findIndex(t => t.id === track.id);
    addToRecentlyPlayed(track);
    setState(prev => ({
      ...prev,
      currentTrack: track,
      queue: prev.shuffle ? shuffleArray(queue) : queue,
      originalQueue: queue,
      currentTrackIndex: trackIndex >= 0 ? trackIndex : 0,
      isPlaying: true,
      currentTime: 0,
    }));
  }, [addToRecentlyPlayed]);

  const loadMoodPlaylist = useCallback(async (mood: string) => {
    try {
      const tracks = await getSongsByMood(mood, 15);
      if (tracks.length > 0) {
        addToRecentlyPlayed(tracks[0]);
        setState(prev => ({
          ...prev,
          currentTrack: tracks[0],
          queue: prev.shuffle ? shuffleArray(tracks) : tracks,
          originalQueue: tracks,
          currentTrackIndex: 0,
          isPlaying: true,
          currentTime: 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load mood playlist:', error);
      toast({ title: "Error", description: "Failed to load playlist", variant: "destructive" });
    }
  }, [addToRecentlyPlayed]);

  const playPlaylist = useCallback((tracks: Track[], startIndex: number = 0) => {
    if (tracks.length > 0 && startIndex < tracks.length) {
      addToRecentlyPlayed(tracks[startIndex]);
      setState(prev => ({
        ...prev,
        currentTrack: tracks[startIndex],
        queue: prev.shuffle ? shuffleArray(tracks) : tracks,
        originalQueue: tracks,
        currentTrackIndex: startIndex,
        isPlaying: true,
        currentTime: 0,
      }));
    }
  }, [addToRecentlyPlayed]);

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
        addToRecentlyPlayed(prev.queue[nextIndex]);
        return {
          ...prev,
          currentTrackIndex: nextIndex,
          currentTrack: prev.queue[nextIndex],
          currentTime: 0,
          isPlaying: true,
        };
      } else if (prev.repeat === 'all' && prev.queue.length > 0) {
        addToRecentlyPlayed(prev.queue[0]);
        return {
          ...prev,
          currentTrackIndex: 0,
          currentTrack: prev.queue[0],
          currentTime: 0,
          isPlaying: true,
        };
      }
      return prev;
    });
  }, [addToRecentlyPlayed]);

  const playPrevious = useCallback(() => {
    setState(prev => {
      if (prev.currentTime > 3) {
        return {
          ...prev,
          currentTime: 0,
        };
      }
      
      const prevIndex = prev.currentTrackIndex - 1;
      if (prevIndex >= 0) {
        addToRecentlyPlayed(prev.queue[prevIndex]);
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
  }, [addToRecentlyPlayed]);

  const seekTo = useCallback((time: number) => {
    setState(prev => ({
      ...prev,
      currentTime: Math.max(0, Math.min(time, prev.duration)),
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({
      ...prev,
      volume: Math.max(0, Math.min(100, volume)),
    }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState(prev => {
      const newShuffle = !prev.shuffle;
      let newQueue = prev.queue;
      
      if (newShuffle) {
        const currentTrack = prev.currentTrack;
        const otherTracks = prev.originalQueue.filter(t => t.id !== currentTrack?.id);
        const shuffled = shuffleArray(otherTracks);
        newQueue = currentTrack ? [currentTrack, ...shuffled] : shuffled;
      } else {
        newQueue = prev.originalQueue;
      }

      return {
        ...prev,
        shuffle: newShuffle,
        queue: newQueue,
        currentTrackIndex: prev.currentTrack ? newQueue.findIndex(t => t.id === prev.currentTrack?.id) : 0,
      };
    });
    toast({ title: state.shuffle ? "Shuffle Off" : "Shuffle On" });
  }, [state.shuffle]);

  const toggleRepeat = useCallback(() => {
    setState(prev => {
      const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(prev.repeat);
      const nextRepeat = modes[(currentIndex + 1) % modes.length];
      return { ...prev, repeat: nextRepeat };
    });
    const repeatLabels = { off: 'Repeat Off', all: 'Repeat All', one: 'Repeat One' };
    const nextMode = ({ off: 'all', all: 'one', one: 'off' } as const)[state.repeat];
    toast({ title: repeatLabels[nextMode] });
  }, [state.repeat]);

  const toggleFavorite = useCallback((track: Track) => {
    setState(prev => {
      const isFavorite = prev.favorites.some(f => f.id === track.id);
      const newFavorites = isFavorite
        ? prev.favorites.filter(f => f.id !== track.id)
        : [...prev.favorites, track];
      
      toast({ 
        title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: track.title 
      });
      
      return { ...prev, favorites: newFavorites };
    });
  }, []);

  const isFavorite = useCallback((trackId: string) => {
    return state.favorites.some(f => f.id === trackId);
  }, [state.favorites]);

  const createPlaylist = useCallback((name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      tracks: [],
      createdAt: new Date(),
    };
    setState(prev => ({
      ...prev,
      playlists: [...prev.playlists, newPlaylist],
    }));
    toast({ title: "Playlist Created", description: name });
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setState(prev => ({
      ...prev,
      playlists: prev.playlists.filter(p => p.id !== playlistId),
    }));
    toast({ title: "Playlist Deleted" });
  }, []);

  const renamePlaylist = useCallback((playlistId: string, newName: string) => {
    setState(prev => ({
      ...prev,
      playlists: prev.playlists.map(p => 
        p.id === playlistId ? { ...p, name: newName } : p
      ),
    }));
    toast({ title: "Playlist Renamed", description: newName });
  }, []);

  const addToPlaylist = useCallback((playlistId: string, track: Track) => {
    setState(prev => ({
      ...prev,
      playlists: prev.playlists.map(p => 
        p.id === playlistId && !p.tracks.find(t => t.id === track.id)
          ? { ...p, tracks: [...p.tracks, track] }
          : p
      ),
    }));
    toast({ title: "Added to Playlist", description: track.title });
  }, []);

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setState(prev => ({
      ...prev,
      playlists: prev.playlists.map(p => 
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) }
          : p
      ),
    }));
    toast({ title: "Removed from Playlist" });
  }, []);

  const playFromPlaylist = useCallback((playlist: Playlist, startIndex: number = 0) => {
    if (playlist.tracks.length > 0 && startIndex < playlist.tracks.length) {
      playPlaylist(playlist.tracks, startIndex);
    }
  }, [playPlaylist]);

  const exportPlaylist = useCallback((playlistId: string) => {
    const playlist = state.playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const data = JSON.stringify(playlist, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Playlist Exported", description: playlist.name });
  }, [state.playlists]);

  const importPlaylist = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const playlist = JSON.parse(e.target?.result as string);
        const newPlaylist: Playlist = {
          ...playlist,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        setState(prev => ({
          ...prev,
          playlists: [...prev.playlists, newPlaylist],
        }));
        toast({ title: "Playlist Imported", description: newPlaylist.name });
      } catch (error) {
        toast({ title: "Import Failed", description: "Invalid playlist file", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
    toast({ title: "History Cleared" });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setState(prev => {
      const newQueue = [...prev.queue];
      newQueue.splice(index, 1);
      
      let newIndex = prev.currentTrackIndex;
      if (index < prev.currentTrackIndex) {
        newIndex--;
      } else if (index === prev.currentTrackIndex && newQueue.length > 0) {
        newIndex = Math.min(newIndex, newQueue.length - 1);
      }

      return {
        ...prev,
        queue: newQueue,
        currentTrackIndex: newIndex,
        currentTrack: newQueue[newIndex] || null,
      };
    });
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      queue: prev.currentTrack ? [prev.currentTrack] : [],
      currentTrackIndex: prev.currentTrack ? 0 : -1,
    }));
    toast({ title: "Queue Cleared" });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
    toast({ title: "Added to Queue", description: track.title });
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
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    isFavorite,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    playFromPlaylist,
    exportPlaylist,
    importPlaylist,
    clearHistory,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };
};