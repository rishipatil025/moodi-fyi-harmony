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
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="kp-signature text-4xl float">KP</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light font-japanese neon-text">
            今日の気分は？
          </h1>
        </div>
        <p className="text-lg text-foreground-secondary font-elegant">
          あなたの魂に響く音楽を見つけてください
        </p>
        <p className="text-sm text-muted-foreground mt-2 font-light">
          Select your emotional wavelength and dive into sonic transcendence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {moods.map((mood, index) => (
          <div
            key={mood.id}
            className={`mood-tile power-glow sakura-effect relative h-56 md:h-64 lg:h-72 cursor-pointer transition-all duration-700 fade-in-up group ${
              hoveredMood === mood.id ? 'scale-105' : ''
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url(${mood.bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animationDelay: `${index * 0.15}s`,
            }}
            onClick={() => onMoodSelect(mood)}
            onMouseEnter={() => setHoveredMood(mood.id)}
            onMouseLeave={() => setHoveredMood(null)}
          >
            {/* Anime Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Dynamic Glow Effect */}
            <div 
              className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-700`}
              style={{
                background: `radial-gradient(circle at center, hsl(var(--${mood.color})) 0%, hsl(var(--${mood.color}), 0.3) 40%, transparent 70%)`,
              }}
            />
            
            {/* Energy Border */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                 style={{
                   border: `2px solid hsl(var(--${mood.color}))`,
                   boxShadow: `0 0 20px hsl(var(--${mood.color}), 0.5)`,
                 }}
            />

            {/* Anime Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 z-10">
              {/* Floating Emoji */}
              <div className="self-end">
                <span className="text-5xl md:text-6xl opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-125 float breathe">
                  {mood.emoji}
                </span>
              </div>

              {/* Mood Info with Japanese */}
              <div className="space-y-3">
                <h3 className="text-3xl md:text-4xl font-medium text-white font-japanese group-hover:text-white transition-all duration-300"
                    style={{ 
                      textShadow: `0 0 10px hsl(var(--${mood.color}), 0.8)`,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                    }}>
                  {mood.name}
                </h3>
                <p className="text-white/80 text-base md:text-lg font-elegant group-hover:text-white transition-all duration-300">
                  {mood.description}
                </p>
              </div>
            </div>

            {/* Enhanced Particle Effect */}
            {hoveredMood === mood.id && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full opacity-70 animate-ping"
                    style={{
                      backgroundColor: `hsl(var(--${mood.color}))`,
                      width: `${Math.random() * 6 + 2}px`,
                      height: `${Math.random() * 6 + 2}px`,
                      left: `${10 + Math.random() * 80}%`,
                      top: `${10 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: '1.8s',
                      boxShadow: `0 0 10px hsl(var(--${mood.color}))`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-16 fade-in-up" style={{ animationDelay: '0.8s' }}>
        <div className="kp-signature text-2xl mb-2">KP's</div>
        <p className="text-sm text-muted-foreground/60 font-elegant">
          Each mood unlocks a portal to transcendent musical dimensions
        </p>
        <div className="mt-4 h-px bg-gradient-gold opacity-30 max-w-xs mx-auto"></div>
      </div>
    </div>
  );
};

export default MoodTiles;