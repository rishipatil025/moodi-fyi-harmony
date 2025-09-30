import { useState } from "react";
import MoodTiles from "@/components/MoodTiles";
import PlaylistView from "@/components/PlaylistView";
import MusicPlayer from "@/components/MusicPlayer";
import FloatingParticles from "@/components/FloatingParticles";
import AnimeBackground from "@/components/AnimeBackground";
import { SearchBar } from "@/components/SearchBar";
import { PlaylistManager } from "@/components/PlaylistManager";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { Button } from "@/components/ui/button";
import { Search, Music, Home } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-cosmic relative overflow-hidden">
      <AnimeBackground />
      <FloatingParticles />
      
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8 fade-in-up">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="kp-signature text-6xl md:text-8xl animate-pulse">KP</div>
              <div className="h-16 w-px bg-gradient-gold opacity-60"></div>
              <h1 className="text-4xl md:text-6xl font-japanese font-light neon-text">
                MoodiFy
              </h1>
            </div>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto mb-6 font-elegant">
              Experience music through your soul's deepest emotions. Let the rhythm of your heart guide the symphony of your journey.
            </p>
            
            {/* Anime Navigation */}
            <div className="flex justify-center gap-6 mb-8 scale-in" style={{ animationDelay: '0.3s' }}>
              <Button
                variant={currentView === 'moods' ? 'default' : 'outline'}
                onClick={() => {
                  setCurrentView('moods');
                  setShowPlaylist(false);
                  setSelectedMood(null);
                }}
                className="glass-button energy-aura px-6 py-3 text-base font-japanese"
              >
                <Home className="h-5 w-5 mr-2" />
                心境 Moods
              </Button>
              <Button
                variant={currentView === 'search' ? 'default' : 'outline'}
                onClick={() => setCurrentView('search')}
                className="glass-button energy-aura px-6 py-3 text-base font-japanese"
              >
                <Search className="h-5 w-5 mr-2" />
                探索 Search
              </Button>
              <Button
                variant={currentView === 'playlists' ? 'default' : 'outline'}
                onClick={() => setCurrentView('playlists')}
                className="glass-button energy-aura px-6 py-3 text-base font-japanese"
              >
                <Music className="h-5 w-5 mr-2" />
                音楽 Playlists ({playlists.length})
              </Button>
            </div>
          </header>

          {renderContent()}
        </div>
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
