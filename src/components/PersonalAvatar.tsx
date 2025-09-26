import { useState, useEffect } from 'react';
import { Music2, Heart, Zap, Coffee, Star, Moon } from 'lucide-react';

interface PersonalAvatarProps {
  listeningStats?: {
    totalListened: number;
    favoriteGenre: string;
    mood: string;
  };
  className?: string;
}

const avatarEvolutions = [
  { threshold: 0, icon: Music2, color: 'text-white', description: 'Music Novice' },
  { threshold: 10, icon: Heart, color: 'text-pink-400', description: 'Melody Lover' },
  { threshold: 50, icon: Zap, color: 'text-yellow-400', description: 'Beat Master' },
  { threshold: 100, icon: Coffee, color: 'text-amber-400', description: 'Vibe Curator' },
  { threshold: 200, icon: Star, color: 'text-purple-400', description: 'Audio Sage' },
  { threshold: 500, icon: Moon, color: 'text-blue-400', description: 'Sonic Mystic' },
];

export const PersonalAvatar = ({ 
  listeningStats = { totalListened: 0, favoriteGenre: 'Unknown', mood: 'chill' }, 
  className = '' 
}: PersonalAvatarProps) => {
  const [currentEvolution, setCurrentEvolution] = useState(avatarEvolutions[0]);
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    const evolution = avatarEvolutions
      .slice()
      .reverse()
      .find(evo => listeningStats.totalListened >= evo.threshold) || avatarEvolutions[0];
    
    setCurrentEvolution(evolution);
  }, [listeningStats.totalListened]);

  useEffect(() => {
    const glowInterval = setInterval(() => {
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 1500);
    }, 4000);

    return () => clearInterval(glowInterval);
  }, []);

  const IconComponent = currentEvolution.icon;

  return (
    <div className={`relative group ${className}`}>
      {/* Avatar Container */}
      <div 
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md
          border border-white/20 transition-all duration-500
          ${isGlowing ? 'animate-pulse shadow-lg' : ''}
        `}
        style={{
          boxShadow: isGlowing 
            ? `0 0 30px hsl(var(--mood-${listeningStats.mood}) / 0.6)`
            : '0 0 15px rgba(255,255,255,0.1)'
        }}
      >
        {/* Avatar Icon */}
        <IconComponent 
          className={`w-8 h-8 ${currentEvolution.color} transition-all duration-300 group-hover:scale-110`}
        />
        
        {/* Evolution Indicator */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gold/90 flex items-center justify-center border border-white/30">
          <span className="text-xs font-bold text-black">
            {avatarEvolutions.indexOf(currentEvolution) + 1}
          </span>
        </div>
        
        {/* Listening Pulse */}
        {listeningStats.totalListened > 0 && (
          <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping"></div>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-white font-noto whitespace-nowrap">
          <div className="font-medium text-gold">{currentEvolution.description}</div>
          <div className="text-white/70">{listeningStats.totalListened} tracks played</div>
        </div>
        <div className="w-2 h-2 bg-black/80 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
      </div>

      {/* KP Signature */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <span className="font-dancing text-sm text-gold/60">KP</span>
      </div>
    </div>
  );
};