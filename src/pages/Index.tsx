import { useState } from "react";
import FloatingParticles from "@/components/FloatingParticles";
import MoodTiles from "@/components/MoodTiles";
import MusicPlayer from "@/components/MusicPlayer";
import PlaylistView from "@/components/PlaylistView";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { mockPlaylists } from "@/data/mockMusic";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface Mood {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

const Index = () => {
  const musicPlayer = useMusicPlayer();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);
    // Load real music from JioSaavn based on mood
    await musicPlayer.loadMoodPlaylist(mood.id);
    // Auto show playlist after a brief moment
    setTimeout(() => setShowPlaylist(true), 2000);
  };

  const currentPlaylist = selectedMood ? mockPlaylists[selectedMood.id] : null;

  return (
    <div className="min-h-screen bg-gradient-bg relative overflow-hidden">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-7xl mx-auto">
          {!selectedMood ? (
            <MoodTiles onMoodSelect={handleMoodSelect} />
          ) : showPlaylist && currentPlaylist ? (
            <div className="space-y-8">
              {/* Back Button */}
              <div className="flex items-center gap-4 fade-in-up">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setShowPlaylist(false)}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Mood
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedMood(null);
                    setShowPlaylist(false);
                  }}
                  className="rounded-full opacity-70 hover:opacity-100"
                >
                  Choose Different Mood
                </Button>
              </div>
              
              <PlaylistView
                playlist={currentPlaylist}
                currentTrack={musicPlayer.currentTrack}
                isPlaying={musicPlayer.isPlaying}
                onTrackSelect={musicPlayer.playTrack}
                onPlayPause={musicPlayer.togglePlayPause}
              />
            </div>
          ) : (
            <div className="text-center space-y-8 fade-in-up">
              <div className="glass-card p-8 rounded-3xl max-w-2xl mx-auto">
                <div className="text-6xl mb-4 breathe">{selectedMood.emoji}</div>
                <h1 className="text-4xl font-light font-japanese mb-2">
                  {selectedMood.name}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {selectedMood.description}
                </p>
                <p className="text-sm text-muted-foreground/70 mb-8">
                  Now playing your {selectedMood.name.toLowerCase()} playlist
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="hero"
                    onClick={() => setShowPlaylist(true)}
                    className="rounded-full font-japanese"
                  >
                    View Playlist
                  </Button>
                  <Button
                    variant="glass"
                    onClick={() => setSelectedMood(null)}
                    className="rounded-full font-japanese"
                  >
                    Choose Another Mood
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Persistent Music Player */}
      {musicPlayer.currentTrack && (
        <MusicPlayer
          currentTrack={musicPlayer.currentTrack}
          isPlaying={musicPlayer.isPlaying}
          onPlayPause={musicPlayer.togglePlayPause}
          onNext={musicPlayer.playNext}
          onPrevious={musicPlayer.playPrevious}
          currentTime={musicPlayer.currentTime}
          onSeek={musicPlayer.seekTo}
          volume={musicPlayer.volume}
          onVolumeChange={musicPlayer.setVolume}
        />
      )}
    </div>
  );
};

export default Index;
