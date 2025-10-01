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
    <div className="min-h-screen relative overflow-hidden">
      <AnimeBackground />
      <FloatingParticles />
      
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <div className="mb-6">
              <span className="text-gold font-calligraphy text-5xl md:text-6xl neon-text">KP</span>
              <h1 className="text-5xl md:text-7xl font-bold font-japanese mt-2 neon-text bg-gradient-primary bg-clip-text text-transparent">
                MoodiFy
              </h1>
              <p className="text-sm text-foreground-secondary font-japanese mt-1">ムードで音楽を</p>
            </div>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto mb-8 font-elegant">
              Experience music through your emotions. Choose your current mood and let us curate the perfect soundtrack for your soul.
            </p>
            
            {/* Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Button
                variant={currentView === 'moods' ? 'default' : 'ghost'}
                onClick={() => {
                  setCurrentView('moods');
                  setShowPlaylist(false);
                  setSelectedMood(null);
                }}
                className="glass-button flex items-center gap-2 px-6 py-3 text-base"
              >
                <Home className="h-5 w-5" />
                <span className="font-japanese">Moods</span>
              </Button>
              <Button
                variant={currentView === 'search' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('search')}
                className="glass-button flex items-center gap-2 px-6 py-3 text-base"
              >
                <Search className="h-5 w-5" />
                <span className="font-japanese">Search</span>
              </Button>
              <Button
                variant={currentView === 'playlists' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('playlists')}
                className="glass-button flex items-center gap-2 px-6 py-3 text-base"
              >
                <Music className="h-5 w-5" />
                <span className="font-japanese">Playlists ({playlists.length})</span>
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
