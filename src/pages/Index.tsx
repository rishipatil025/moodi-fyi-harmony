import { useState } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MoodTiles from "@/components/MoodTiles";
import PlaylistView from "@/components/PlaylistView";
import MusicPlayer from "@/components/MusicPlayer";
import FloatingParticles from "@/components/FloatingParticles";
import { SearchBar } from "@/components/SearchBar";
import { PlaylistManager } from "@/components/PlaylistManager";
import { HaikuPoetry } from "@/components/HaikuPoetry";
import { MoodBlender } from "@/components/MoodBlender";
import { PersonalAvatar } from "@/components/PersonalAvatar";
import { NostalgicChamber } from "@/components/NostalgicChamber";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { Button } from "@/components/ui/button";
import { Search, Music, Home, Sparkles } from "lucide-react";

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
  const [currentView, setCurrentView] = useState<'moods' | 'search' | 'playlists' | 'blender'>('moods');
  const [showMoodBlender, setShowMoodBlender] = useState(false);
  
  const moods: Mood[] = [
    { id: 'chill', name: 'Chill', emoji: '🌸', color: 'mood-chill', description: 'Peaceful vibes for relaxation' },
    { id: 'melancholy', name: 'Melancholy', emoji: '☁️', color: 'mood-melancholy', description: 'Reflective and contemplative' },
    { id: 'workout', name: 'Workout', emoji: '🔥', color: 'mood-workout', description: 'High energy for motivation' },
    { id: 'focus', name: 'Focus', emoji: '🚀', color: 'mood-focus', description: 'Deep concentration mode' },
    { id: 'love', name: 'Love', emoji: '❤️', color: 'mood-love', description: 'Romantic and heartfelt' },
    { id: 'party', name: 'Party', emoji: '🎉', color: 'mood-party', description: 'Celebration and joy' },
  ];
  
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

  const handleBlendMoods = async (mood1: Mood, mood2: Mood) => {
    // Create fusion playlist by combining both moods
    const fusionMood = {
      id: `fusion-${mood1.id}-${mood2.id}`,
      name: `${mood1.name} × ${mood2.name}`,
      emoji: `${mood1.emoji}${mood2.emoji}`,
      color: mood1.color, // Could blend colors in future
      description: `A fusion of ${mood1.name.toLowerCase()} and ${mood2.name.toLowerCase()} energies`
    };
    
    // Load tracks from both moods (simplified - in real app would blend intelligently)
    await loadMoodPlaylist(mood1.id);
    setSelectedMood(fusionMood);
    setShowPlaylist(true);
    setShowMoodBlender(false);
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
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <FloatingParticles />
        
        {/* Haiku Poetry Component */}
        <HaikuPoetry mood={selectedMood?.id} isVisible={currentView === 'moods'} />
        
        {/* Nostalgic Chamber */}
        <NostalgicChamber 
          currentMood={selectedMood?.id} 
          isVisible={currentView === 'moods' && showPlaylist} 
        />
        
        <div className="relative z-10 p-8">
          <div className="max-w-6xl mx-auto">
            <header className="text-center mb-8 relative">
              {/* Personal Avatar */}
              <div className="absolute top-4 right-4 z-10">
                <PersonalAvatar 
                  listeningStats={{
                    totalListened: queue.length,
                    favoriteGenre: selectedMood?.name || 'Various',
                    mood: selectedMood?.id || 'chill'
                  }}
                />
              </div>

              {/* KP Signature Header */}
              <div className="relative mb-6">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                  MoodiFy
                </h1>
                <div className="font-dancing text-3xl md:text-4xl text-gold absolute -top-2 right-1/4 transform translate-x-1/2 opacity-80 calligraphy-glow">
                  KP
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
              </div>
              
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6 font-noto">
                Experience music through your emotions. Choose your current mood and let us curate the perfect soundtrack for your soul.
              </p>
              
              {/* Enhanced Navigation */}
              <div className="flex justify-center gap-4 mb-8">
                <Button
                  variant={currentView === 'moods' ? 'default' : 'outline'}
                  onClick={() => {
                    setCurrentView('moods');
                    setShowPlaylist(false);
                    setSelectedMood(null);
                  }}
                  className="flex items-center gap-2 font-noto"
                >
                  <Home className="h-4 w-4" />
                  Moods
                </Button>
                <Button
                  variant={currentView === 'search' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('search')}
                  className="flex items-center gap-2 font-noto"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                <Button
                  variant={currentView === 'playlists' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('playlists')}
                  className="flex items-center gap-2 font-noto"
                >
                  <Music className="h-4 w-4" />
                  Playlists ({playlists.length})
                </Button>
                <Button
                  onClick={() => setShowMoodBlender(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-gold to-amber-400 text-black hover:scale-105 transition-transform font-noto"
                >
                  <Sparkles className="h-4 w-4" />
                  Blend Moods
                </Button>
              </div>
            </header>

            {renderContent()}
          </div>
        </div>

        {/* Mood Blender Modal */}
        {showMoodBlender && (
          <MoodBlender
            moods={moods}
            onBlendMoods={handleBlendMoods}
            onClose={() => setShowMoodBlender(false)}
          />
        )}

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
    </DndProvider>
  );
};

export default Index;
