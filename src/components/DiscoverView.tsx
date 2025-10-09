import { useState, useEffect } from "react";
import { Track } from "@/data/mockMusic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Play, Heart, Plus } from "lucide-react";
import { getAllTracks } from "@/data/mockMusic";

interface DiscoverViewProps {
  recentlyPlayed: Track[];
  favorites: Track[];
  onTrackSelect: (track: Track, tracks: Track[]) => void;
  onToggleFavorite: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
}

export const DiscoverView = ({
  recentlyPlayed,
  favorites,
  onTrackSelect,
  onToggleFavorite,
  onAddToQueue,
  isFavorite,
}: DiscoverViewProps) => {
  const [recommendations, setRecommendations] = useState<Track[]>([]);

  useEffect(() => {
    // Simple recommendation engine based on recently played and favorites
    const allTracks = getAllTracks();
    const listenedTrackIds = new Set([
      ...recentlyPlayed.map(t => t.id),
      ...favorites.map(t => t.id),
    ]);

    // Filter out already listened tracks
    const unlistened = allTracks.filter(t => !listenedTrackIds.has(t.id));
    
    // Shuffle and pick random recommendations
    const shuffled = [...unlistened].sort(() => Math.random() - 0.5);
    setRecommendations(shuffled.slice(0, 12));
  }, [recentlyPlayed, favorites]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <Card className="glass-card p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Recently Played
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyPlayed.slice(0, 4).map((track) => (
              <div
                key={track.id}
                className="glass-card p-3 cursor-pointer transition-all hover:scale-105 group"
                onClick={() => onTrackSelect(track, [track])}
              >
                {track.albumArt && (
                  <img
                    src={track.albumArt}
                    alt={track.album}
                    className="w-full aspect-square rounded mb-2 object-cover"
                  />
                )}
                <p className="font-medium text-white text-sm truncate">{track.title}</p>
                <p className="text-xs text-white/60 truncate">{track.artist}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          Discover New Music
        </h2>
        
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/60">
            <Sparkles className="h-16 w-16 mb-4 opacity-40" />
            <p className="text-lg">Start listening to get recommendations</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((track) => (
                <div
                  key={track.id}
                  className="glass-card p-4 flex items-center gap-4 transition-all hover:bg-white/10 group"
                >
                  {track.albumArt && (
                    <img
                      src={track.albumArt}
                      alt={track.album}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{track.title}</p>
                    <p className="text-sm text-white/60 truncate">{track.artist}</p>
                    <p className="text-xs text-white/40">{formatDuration(track.duration || 0)}</p>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onTrackSelect(track, recommendations)}
                      className="text-white hover:text-accent"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleFavorite(track)}
                      className={isFavorite(track.id) ? "text-accent" : "text-white hover:text-accent"}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(track.id) ? 'fill-accent' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAddToQueue(track)}
                      className="text-white hover:text-accent"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
};

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);