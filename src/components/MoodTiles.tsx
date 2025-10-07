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
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-rounded font-bold mb-4 pulse-glow">
          What's your mood today, KP? ✨
        </h2>
        <p className="text-white/65 text-lg italic" style={{ textShadow: '0 0 8px rgba(255,255,255,0.3)' }}>
          Choose a vibe and let the music take you there
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {moods.map((mood) => {
          const moodClass = `mood-${mood.id}`;
          
          return (
            <div
              key={mood.id}
              onClick={() => onMoodSelect(mood)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              className={`mood-tile ${moodClass} group relative h-72 cursor-pointer`}
            >
              {/* Background Image */}
              <div 
                className="mood-bg-image absolute inset-0 bg-cover bg-center transition-transform duration-700"
                style={{ 
                  backgroundImage: `url(${mood.bgImage})`,
                }}
              />
              
              {/* Gradient Overlay */}
              <div 
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--${mood.color})) / 0.5, hsl(var(--${mood.color})) / 0.2)`,
                  opacity: hoveredMood === mood.id ? 0.9 : 0.6
                }}
              />
              
              {/* Content */}
              <div className="relative h-full p-8 flex flex-col justify-between z-10">
                <div className="mood-emoji text-7xl transition-transform duration-300" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                  {mood.emoji}
                </div>
                
                <div>
                  <h3 className="text-3xl font-rounded font-bold mb-2 text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)' }}>
                    {mood.name}
                  </h3>
                  <p className="text-white/95 text-sm leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                    {mood.description}
                  </p>
                </div>
              </div>

              {/* Inner Light Reflection */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodTiles;