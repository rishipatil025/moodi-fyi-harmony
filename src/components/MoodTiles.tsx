import { useState } from 'react';

// Import mood background images
import moodChillImg from '@/assets/mood-chill.jpg';
import moodMelancholyImg from '@/assets/mood-melancholy.jpg';
import moodWorkoutImg from '@/assets/mood-workout.jpg';
import moodFocusImg from '@/assets/mood-focus.jpg';
import moodLoveImg from '@/assets/mood-love.jpg';
import moodPartyImg from '@/assets/mood-party.jpg';

interface Mood {
  id: string;
  name: string;
  emoji: string;
  bgImage: string;
  color: string;
  description: string;
}

interface MoodTilesProps {
  onMoodSelect: (mood: Mood) => void;
}

const moods: Mood[] = [
  {
    id: 'chill',
    name: 'Chill',
    emoji: '🌸',
    bgImage: moodChillImg,
    color: 'mood-chill',
    description: 'Peaceful vibes for relaxation'
  },
  {
    id: 'melancholy',
    name: 'Melancholy',
    emoji: '☁️',
    bgImage: moodMelancholyImg,
    color: 'mood-melancholy',
    description: 'Reflective and contemplative'
  },
  {
    id: 'workout',
    name: 'Workout',
    emoji: '🔥',
    bgImage: moodWorkoutImg,
    color: 'mood-workout',
    description: 'High energy for motivation'
  },
  {
    id: 'focus',
    name: 'Focus',
    emoji: '🚀',
    bgImage: moodFocusImg,
    color: 'mood-focus',
    description: 'Deep concentration mode'
  },
  {
    id: 'love',
    name: 'Love',
    emoji: '❤️',
    bgImage: moodLoveImg,
    color: 'mood-love',
    description: 'Romantic and heartfelt'
  },
  {
    id: 'party',
    name: 'Party',
    emoji: '🎉',
    bgImage: moodPartyImg,
    color: 'mood-party',
    description: 'Celebration and joy'
  },
];

const MoodTiles = ({ onMoodSelect }: MoodTilesProps) => {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-12 fade-in-up">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 font-japanese bg-gradient-primary bg-clip-text text-transparent">
          What's your mood today, KP?
        </h1>
        <p className="text-lg text-muted-foreground font-light">
          Select a vibe and let the music flow through your soul
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {moods.map((mood, index) => (
          <div
            key={mood.id}
            className={`mood-tile relative h-48 md:h-56 lg:h-64 rounded-2xl cursor-pointer transition-all duration-500 fade-in-up group ${
              hoveredMood === mood.id ? 'scale-105' : ''
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${mood.bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animationDelay: `${index * 0.1}s`,
            }}
            onClick={() => onMoodSelect(mood)}
            onMouseEnter={() => setHoveredMood(mood.id)}
            onMouseLeave={() => setHoveredMood(null)}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl" />
            
            {/* Glow Effect */}
            <div 
              className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
              style={{
                background: `radial-gradient(circle at center, hsl(var(--${mood.color})) 0%, transparent 70%)`,
              }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
              {/* Emoji */}
              <div className="self-end">
                <span className="text-4xl md:text-5xl opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                  {mood.emoji}
                </span>
              </div>

              {/* Mood Info */}
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-medium text-white font-japanese group-hover:text-white transition-colors">
                  {mood.name}
                </h3>
                <p className="text-white/70 text-sm md:text-base font-light group-hover:text-white/90 transition-colors">
                  {mood.description}
                </p>
              </div>
            </div>

            {/* Hover Particle Effect */}
            {hoveredMood === mood.id && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full opacity-60 animate-ping"
                    style={{
                      backgroundColor: `hsl(var(--${mood.color}))`,
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '2s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-12 fade-in-up" style={{ animationDelay: '0.6s' }}>
        <p className="text-sm text-muted-foreground/60 font-light">
          Each mood brings a unique sonic journey crafted just for you
        </p>
      </div>
    </div>
  );
};

export default MoodTiles;