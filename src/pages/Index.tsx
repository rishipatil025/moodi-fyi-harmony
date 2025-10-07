import { useState } from "react";
import MoodTiles from "@/components/MoodTiles";
import PlaylistView from "@/components/PlaylistView";
import MusicPlayer from "@/components/MusicPlayer";
import AnimeBackground from "@/components/AnimeBackground";
import FloatingElements from "@/components/FloatingElements";
import { SearchBar } from "@/components/SearchBar";
import { PlaylistManager } from "@/components/PlaylistManager";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { Music2, Search, ListMusic } from "lucide-react";

interface Mood {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentView, setCurrentView] = useState<'moods' | 'search' | 'playlists'>('moods');
  
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    currentTrackIndex,
    playlists,
    playTrack,
    playPlaylist,
    loadMoodPlaylist,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    playFromPlaylist,
  } = useMusicPlayer();

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);
    await loadMoodPlaylist(mood.id);
    setShowPlaylist(true);
  };

  const handleTrackSelect = (track: any) => {
    playTrack(track, [track]);
  };

  const handleAddToPlaylist = (track: any) => {
    if (playlists.length === 0) {
      createPlaylist('My Playlist');
      setTimeout(() => {
        addToPlaylist(Date.now().toString(), track);
      }, 100);
    } else {
      // Add to first playlist for now, could be improved with playlist selection
      addToPlaylist(playlists[0].id, track);
    }
  };

  const renderContent = () => {
    if (currentView === 'search') {
      return (
        <SearchBar 
          onTrackSelect={handleTrackSelect}
          onAddToPlaylist={handleAddToPlaylist}
        />
      );
    }
    
    if (currentView === 'playlists') {
      return (
        <PlaylistManager
          playlists={playlists}
          onCreatePlaylist={createPlaylist}
          onDeletePlaylist={deletePlaylist}
          onRenamePlaylist={renamePlaylist}
          onRemoveFromPlaylist={removeFromPlaylist}
          onPlayPlaylist={playFromPlaylist}
          currentTrack={currentTrack}
        />
      );
    }

    if (showPlaylist && selectedMood) {
      const moodPlaylist = {
        id: selectedMood.id,
        name: selectedMood.name,
        description: selectedMood.description,
        tracks: queue,
        moodId: selectedMood.id
      };
      
      return (
        <PlaylistView 
          playlist={moodPlaylist}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTrackSelect={(track, tracks) => playTrack(track, tracks)}
          onPlayPause={togglePlayPause}
        />
      );
    }

    return <MoodTiles onMoodSelect={handleMoodSelect} />;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Anime Background Layer */}
      <AnimeBackground />
      
      {/* Floating Elements (particles, stars, petals) */}
      <FloatingElements />
      
      <div className="container mx-auto px-4 py-8 pb-32 relative z-20">
        {/* Header */}
        <header className="text-center mb-12 fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg className="w-6 h-6 text-accent animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z"/>
            </svg>
            <h1 className="text-6xl font-rounded font-bold logo-gradient breathe">
              MoodiFy KP
            </h1>
            <svg className="w-6 h-6 text-accent animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z"/>
            </svg>
          </div>
          <p className="text-sm font-japanese opacity-70 mb-4 tracking-wider" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
            ムーディファイ
          </p>
          <p className="text-white/85 text-lg pulse-glow" style={{ textShadow: '0 0 15px rgba(255,255,255,0.6)' }}>
            Your personal music sanctuary ✨
          </p>
        </header>
        
        {/* Navigation */}
        <nav className="flex justify-center gap-6 mb-10 flex-wrap">
          <button
            onClick={() => {
              setCurrentView('moods');
              setShowPlaylist(false);
              setSelectedMood(null);
            }}
            className={`glass-button flex items-center gap-3 px-8 py-4 font-medium transition-all ${
              currentView === 'moods'
                ? "ring-2 ring-primary shadow-lg shadow-primary/50"
                : ""
            }`}
          >
            <Music2 className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
            <span>Moods</span>
          </button>
          <button
            onClick={() => setCurrentView('search')}
            className={`glass-button flex items-center gap-3 px-8 py-4 font-medium transition-all ${
              currentView === 'search'
                ? "ring-2 ring-primary shadow-lg shadow-primary/50"
                : ""
            }`}
          >
            <Search className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
            <span>Search</span>
          </button>
          <button
            onClick={() => setCurrentView('playlists')}
            className={`glass-button flex items-center gap-3 px-8 py-4 font-medium transition-all ${
              currentView === 'playlists'
                ? "ring-2 ring-primary shadow-lg shadow-primary/50"
                : ""
            }`}
          >
            <ListMusic className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
            <span>Playlists ({playlists.length})</span>
          </button>
        </nav>

        {renderContent()}
      </div>

      {/* Music Player */}
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        volume={volume}
        onPlayPause={togglePlayPause}
        onNext={playNext}
        onPrevious={playPrevious}
        onSeek={seekTo}
        onVolumeChange={setVolume}
      />
    </div>
  );
};

export default Index;
