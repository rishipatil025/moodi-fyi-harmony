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
    <div className="fade-in-up">
      <div className="text-center mb-8">
        <span className="text-gold-soft font-calligraphy text-3xl">KP's</span>
        <h2 className="text-3xl font-bold font-japanese mt-2 text-primary-glow">Mood Collection</h2>
        <p className="text-foreground-secondary font-elegant mt-2">あなたの気分を選んでください</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
        {moods.map((mood) => (
          <div
            key={mood.id}
            onClick={() => onMoodSelect(mood)}
            onMouseEnter={() => setHoveredMood(mood.id)}
            onMouseLeave={() => setHoveredMood(null)}
            className="mood-tile glass-card group relative h-80 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-neon hover:rotate-1"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-125 group-hover:brightness-110"
              style={{
                backgroundImage: `url(${mood.bgImage})`,
              }}
            />
            
            {/* Animated Gradient Overlay */}
            <div 
              className="absolute inset-0 opacity-80 group-hover:opacity-90 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${mood.color}40 0%, ${mood.color}20 50%, transparent 100%)`,
              }}
            />
            
            {/* Glow Effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                boxShadow: `inset 0 0 60px ${mood.color}60`,
              }}
            />
            
            {/* Content */}
            <div className="relative h-full p-8 flex flex-col justify-end z-10">
              <div className="text-7xl mb-4 transform transition-all duration-500 group-hover:scale-125 group-hover:-rotate-12 breathe">
                {mood.emoji}
              </div>
              <h3 className="text-3xl font-bold font-japanese text-white mb-3 transform transition-all duration-500 group-hover:translate-x-3 neon-text">
                {mood.name}
              </h3>
              <p className="text-sm text-gray-200 font-elegant opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 delay-75">
                {mood.description}
              </p>
            </div>
            
            {/* Enhanced Hover Effect Particles */}
            {hoveredMood === mood.id && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${Math.random() * 8 + 4}px`,
                      height: `${Math.random() * 8 + 4}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      background: `radial-gradient(circle, ${mood.color} 0%, transparent 70%)`,
                      animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                      opacity: Math.random() * 0.8 + 0.2,
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Corner Accent */}
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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