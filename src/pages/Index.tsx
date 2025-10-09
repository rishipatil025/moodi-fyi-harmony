import { useState, useRef } from "react";
import MoodTiles from "@/components/MoodTiles";
import PlaylistView from "@/components/PlaylistView";
import MusicPlayer from "@/components/MusicPlayer";
import FloatingParticles from "@/components/FloatingParticles";
import { SearchBar } from "@/components/SearchBar";
import { PlaylistManager } from "@/components/PlaylistManager";
import { QueueManager } from "@/components/QueueManager";
import { FavoritesView } from "@/components/FavoritesView";
import { HistoryView } from "@/components/HistoryView";
import { DiscoverView } from "@/components/DiscoverView";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { Button } from "@/components/ui/button";
import { Search, Music, Home, ListMusic, Heart, Clock, Sparkles, Upload, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const [currentView, setCurrentView] = useState<'moods' | 'search' | 'playlists' | 'queue' | 'favorites' | 'history' | 'discover'>('moods');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    currentTrackIndex,
    playlists,
    favorites,
    history,
    recentlyPlayed,
    shuffle,
    repeat,
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

  const handleImportPlaylist = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importPlaylist(file);
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
        <div className="space-y-4">
          <div className="flex gap-2 justify-end">
            <Button onClick={handleImportPlaylist} variant="outline" className="glass-button">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          <PlaylistManager
            playlists={playlists}
            onCreatePlaylist={createPlaylist}
            onDeletePlaylist={deletePlaylist}
            onRenamePlaylist={renamePlaylist}
            onRemoveFromPlaylist={removeFromPlaylist}
            onPlayPlaylist={playFromPlaylist}
            onExportPlaylist={exportPlaylist}
            currentTrack={currentTrack}
          />
        </div>
      );
    }

    if (currentView === 'queue') {
      return (
        <QueueManager
          queue={queue}
          currentTrackIndex={currentTrackIndex}
          onTrackSelect={(track, index) => {
            playTrack(track, queue);
          }}
          onRemoveFromQueue={removeFromQueue}
          onClearQueue={clearQueue}
        />
      );
    }

    if (currentView === 'favorites') {
      return (
        <FavoritesView
          favorites={favorites}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTrackSelect={(track, tracks) => playTrack(track, tracks)}
          onRemoveFavorite={toggleFavorite}
          onPlayAll={() => playPlaylist(favorites)}
        />
      );
    }

    if (currentView === 'history') {
      return (
        <HistoryView
          history={history}
          onTrackSelect={handleTrackSelect}
          onClearHistory={clearHistory}
        />
      );
    }

    if (currentView === 'discover') {
      return (
        <DiscoverView
          recentlyPlayed={recentlyPlayed}
          favorites={favorites}
          onTrackSelect={(track, tracks) => playTrack(track, tracks)}
          onToggleFavorite={toggleFavorite}
          onAddToQueue={addToQueue}
          isFavorite={isFavorite}
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              MoodiFy KP
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
              Experience music through your emotions. Choose your current mood and let us curate the perfect soundtrack for your soul.
            </p>
            
            {/* Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Button
                variant={currentView === 'moods' ? 'default' : 'outline'}
                onClick={() => {
                  setCurrentView('moods');
                  setShowPlaylist(false);
                  setSelectedMood(null);
                }}
                className="glass-button"
              >
                <Home className="h-4 w-4 mr-2" />
                Moods
              </Button>
              <Button
                variant={currentView === 'search' ? 'default' : 'outline'}
                onClick={() => setCurrentView('search')}
                className="glass-button"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                variant={currentView === 'playlists' ? 'default' : 'outline'}
                onClick={() => setCurrentView('playlists')}
                className="glass-button"
              >
                <Music className="h-4 w-4 mr-2" />
                Playlists ({playlists.length})
              </Button>
              <Button
                variant={currentView === 'queue' ? 'default' : 'outline'}
                onClick={() => setCurrentView('queue')}
                className="glass-button"
              >
                <ListMusic className="h-4 w-4 mr-2" />
                Queue ({queue.length})
              </Button>
              <Button
                variant={currentView === 'favorites' ? 'default' : 'outline'}
                onClick={() => setCurrentView('favorites')}
                className="glass-button"
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorites ({favorites.length})
              </Button>
              <Button
                variant={currentView === 'history' ? 'default' : 'outline'}
                onClick={() => setCurrentView('history')}
                className="glass-button"
              >
                <Clock className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button
                variant={currentView === 'discover' ? 'default' : 'outline'}
                onClick={() => setCurrentView('discover')}
                className="glass-button"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Discover
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
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
        shuffle={shuffle}
        repeat={repeat}
        isFavorite={currentTrack ? isFavorite(currentTrack.id) : false}
        onPlayPause={togglePlayPause}
        onNext={playNext}
        onPrevious={playPrevious}
        onSeek={seekTo}
        onVolumeChange={setVolume}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
        onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack)}
      />
    </div>
  );
};

export default Index;
