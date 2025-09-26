import { useState, useEffect } from 'react';
import { Clock, Calendar, Heart, Music } from 'lucide-react';

interface NostalgicChamberProps {
  currentMood?: string;
  isVisible?: boolean;
}

interface MemoryFragment {
  id: string;
  mood: string;
  timestamp: string;
  description: string;
  atmosphere: string;
  color: string;
}

const memoryFragments: MemoryFragment[] = [
  {
    id: '1',
    mood: 'chill',
    timestamp: 'Late Evening, December 2023',
    description: 'The first time you discovered the perfect chill playlist',
    atmosphere: 'Soft candlelight flickering against rain-streaked windows',
    color: 'from-purple-900/30 to-blue-800/30'
  },
  {
    id: '2', 
    mood: 'melancholy',
    timestamp: 'Autumn Afternoon, 2023',
    description: 'When melancholic melodies helped you process deep thoughts',
    atmosphere: 'Golden leaves falling outside, steaming tea on the windowsill',
    color: 'from-amber-900/30 to-gray-700/30'
  },
  {
    id: '3',
    mood: 'love',
    timestamp: 'Valentine\'s Night, 2024',
    description: 'The night you curated the perfect romantic ambiance',
    atmosphere: 'Rose petals and warm lighting, hearts synchronized',
    color: 'from-rose-900/30 to-pink-800/30'
  },
  {
    id: '4',
    mood: 'workout',
    timestamp: 'Morning Sessions, 2024',
    description: 'Every dawn you conquered with energetic beats',
    atmosphere: 'Sunrise through gym windows, determination in the air',
    color: 'from-orange-900/30 to-red-800/30'
  }
];

export const NostalgicChamber = ({ currentMood = 'chill', isVisible = true }: NostalgicChamberProps) => {
  const [activeMemory, setActiveMemory] = useState<MemoryFragment | null>(null);
  const [chamberOpacity, setChamberOpacity] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setChamberOpacity(0);
      setActiveMemory(null);
      return;
    }

    const moodMemories = memoryFragments.filter(m => m.mood === currentMood);
    if (moodMemories.length > 0) {
      const randomMemory = moodMemories[Math.floor(Math.random() * moodMemories.length)];
      
      setTimeout(() => {
        setActiveMemory(randomMemory);
        setChamberOpacity(1);
      }, 1000);

      // Auto-hide after some time
      setTimeout(() => {
        setChamberOpacity(0);
      }, 8000);
    }
  }, [currentMood, isVisible]);

  if (!activeMemory || !isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-8 right-8 z-30 transition-all duration-2000 ${
        chamberOpacity > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div 
        className={`
          relative w-80 backdrop-blur-xl rounded-2xl p-6 border border-white/10
          bg-gradient-to-br ${activeMemory.color}
          shadow-2xl
        `}
      >
        {/* Memory Chamber Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="text-white font-noto font-medium">Memory Chamber</h3>
            <p className="text-white/60 text-xs font-crimson italic">~ Nostalgic Atmosphere ~</p>
          </div>
        </div>

        {/* Memory Content */}
        <div className="space-y-4">
          {/* Timestamp */}
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Calendar className="w-4 h-4" />
            <span className="font-crimson italic">{activeMemory.timestamp}</span>
          </div>

          {/* Memory Description */}
          <div className="text-white/90 font-noto">
            <p className="mb-2">{activeMemory.description}</p>
          </div>

          {/* Atmospheric Description */}
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
              <p className="text-white/80 text-sm font-crimson italic leading-relaxed">
                {activeMemory.atmosphere}
              </p>
            </div>
          </div>

          {/* KP Signature */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-gold/60" />
              <span className="text-white/50 text-xs font-noto">Curated Memory</span>
            </div>
            <span className="font-dancing text-gold/80 text-lg">KP</span>
          </div>
        </div>

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-2xl">
          <div 
            className="absolute inset-0 rounded-2xl border border-gold/30 animate-pulse"
            style={{
              background: `conic-gradient(from 0deg, transparent 80%, hsl(var(--mood-${activeMemory.mood}) / 0.3) 100%)`
            }}
          />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gold/40 rounded-full animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};