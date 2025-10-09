import { Track } from "@/data/mockMusic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Music, Trash2 } from "lucide-react";

interface QueueManagerProps {
  queue: Track[];
  currentTrackIndex: number;
  onTrackSelect: (track: Track, index: number) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
}

export const QueueManager = ({
  queue,
  currentTrackIndex,
  onTrackSelect,
  onRemoveFromQueue,
  onClearQueue,
}: QueueManagerProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = queue.reduce((acc, track) => acc + (track.duration || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Up Next</h2>
            <p className="text-white/60">
              {queue.length} {queue.length === 1 ? 'song' : 'songs'} • {formatDuration(totalDuration)}
            </p>
          </div>
          {queue.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearQueue}
              className="glass-button"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Queue
            </Button>
          )}
        </div>

        <ScrollArea className="h-[500px]">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/60">
              <Music className="h-16 w-16 mb-4 opacity-40" />
              <p className="text-lg">Queue is empty</p>
              <p className="text-sm mt-2">Add songs to start playing</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map((track, index) => (
                <div
                  key={`${track.id}-${index}`}
                  className={`glass-card p-4 flex items-center gap-4 transition-all hover:bg-white/10 group cursor-pointer ${
                    index === currentTrackIndex ? 'ring-2 ring-accent' : ''
                  }`}
                  onClick={() => onTrackSelect(track, index)}
                >
                  <div className="flex-shrink-0 w-8 text-center">
                    {index === currentTrackIndex ? (
                      <div className="flex items-center justify-center">
                        <div className="w-1 h-1 bg-accent rounded-full animate-pulse mx-0.5" />
                        <div className="w-1 h-2 bg-accent rounded-full animate-pulse mx-0.5" />
                        <div className="w-1 h-1 bg-accent rounded-full animate-pulse mx-0.5" />
                      </div>
                    ) : (
                      <span className="text-white/60 text-sm">{index + 1}</span>
                    )}
                  </div>

                  {track.albumArt && (
                    <img
                      src={track.albumArt}
                      alt={track.album}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {track.title}
                    </p>
                    <p className="text-sm text-white/60 truncate">
                      {track.artist}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60">
                      {formatDuration(track.duration || 0)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromQueue(index);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};