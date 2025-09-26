import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

interface Mood {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

interface MoodBlenderProps {
  moods: Mood[];
  onBlendMoods: (mood1: Mood, mood2: Mood) => void;
  onClose: () => void;
}

interface DragItem {
  type: string;
  mood: Mood;
}

const MoodOrb = ({ mood, onDrag }: { mood: Mood; onDrag?: (mood: Mood) => void }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'mood',
    item: { type: 'mood', mood },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`
        mood-orb relative w-20 h-20 rounded-full cursor-grab active:cursor-grabbing
        transition-all duration-300 transform hover:scale-110
        ${isDragging ? 'opacity-50 scale-105' : 'opacity-100'}
        shadow-lg hover:shadow-2xl
      `}
      style={{
        background: `radial-gradient(circle at 30% 30%, hsl(var(--${mood.color})), hsl(var(--${mood.color}) / 0.7))`,
        boxShadow: `0 0 20px hsl(var(--${mood.color}) / 0.3)`,
      }}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl">{mood.emoji}</span>
      </div>
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <span className="text-xs text-white/80 font-noto whitespace-nowrap">
          {mood.name}
        </span>
      </div>
    </div>
  );
};

const FusionReactor = ({ mood1, mood2, onFuse }: { 
  mood1: Mood | null; 
  mood2: Mood | null; 
  onFuse: () => void;
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'mood',
    drop: (item: DragItem) => {
      // Handle drop logic here if needed
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`
        fusion-reactor relative w-48 h-48 rounded-full border-4 border-dashed
        transition-all duration-500 flex items-center justify-center
        ${isOver ? 'border-gold scale-105' : 'border-white/30'}
        ${mood1 && mood2 ? 'animate-pulse' : ''}
      `}
      style={{
        background: mood1 && mood2 
          ? `conic-gradient(hsl(var(--${mood1.color})), hsl(var(--${mood2.color})), hsl(var(--${mood1.color})))`
          : 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)'
      }}
    >
      <div className="absolute inset-4 rounded-full bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
        {mood1 && mood2 ? (
          <>
            <div className="flex gap-4">
              <span className="text-3xl animate-bounce">{mood1.emoji}</span>
              <Sparkles className="w-6 h-6 text-gold animate-spin" />
              <span className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>
                {mood2.emoji}
              </span>
            </div>
            <Button 
              onClick={onFuse}
              className="bg-gradient-to-r from-gold to-amber-400 text-black font-bold hover:scale-105 transition-transform"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Fuse Vibes
            </Button>
          </>
        ) : (
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-white/50 mx-auto mb-2" />
            <p className="text-white/60 text-sm font-noto">
              Drag two moods here to create
            </p>
            <p className="text-white/40 text-xs">
              your unique fusion playlist
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const MoodBlender = ({ moods, onBlendMoods, onClose }: MoodBlenderProps) => {
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    if (selectedMoods.length < 2 && !selectedMoods.find(m => m.id === mood.id)) {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  const handleFuse = async () => {
    if (selectedMoods.length === 2) {
      setIsAnimating(true);
      setTimeout(() => {
        onBlendMoods(selectedMoods[0], selectedMoods[1]);
        onClose();
      }, 2000);
    }
  };

  const clearSelection = () => {
    setSelectedMoods([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center">
      <div className="relative w-full max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <h2 className="text-5xl font-dancing bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent mb-4">
              Quantum Mood Fusion
            </h2>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 font-dancing text-xl text-white/60">
              ~ KP's Laboratory ~
            </div>
          </div>
          <p className="text-white/70 font-noto">
            Blend two emotions to create something entirely new
          </p>
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Mood Selection */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {moods.map((mood) => (
            <div
              key={mood.id}
              onClick={() => handleMoodSelect(mood)}
              className={`cursor-pointer transition-all duration-300 ${
                selectedMoods.find(m => m.id === mood.id) ? 'opacity-50' : 'hover:scale-110'
              }`}
            >
              <MoodOrb mood={mood} />
            </div>
          ))}
        </div>

        {/* Fusion Reactor */}
        <div className="flex justify-center mb-8">
          <FusionReactor 
            mood1={selectedMoods[0] || null}
            mood2={selectedMoods[1] || null}
            onFuse={handleFuse}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button 
            onClick={clearSelection} 
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            Clear Selection
          </Button>
        </div>

        {/* Fusion Animation Overlay */}
        {isAnimating && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-8 relative">
                <div className="absolute inset-0 border-4 border-gold rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-white/30 rounded-full animate-spin reverse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-gold animate-pulse" />
                </div>
              </div>
              <h3 className="text-3xl font-dancing text-gold mb-2">
                Fusing Vibes...
              </h3>
              <p className="text-white/70">Creating your unique sonic experience</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};