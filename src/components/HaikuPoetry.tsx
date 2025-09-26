import { useState, useEffect } from 'react';

interface HaikuPoetryProps {
  mood?: string | null;
  isVisible?: boolean;
}

interface Haiku {
  lines: [string, string, string];
  mood: string;
  author: string;
}

const haikus: Haiku[] = [
  {
    lines: ["Gentle waves of sound", "Wash away the day's burden", "Peace flows through my soul"],
    mood: "chill",
    author: "KP"
  },
  {
    lines: ["Gray clouds drift above", "Silent tears meet autumn rain", "Beauty in sadness"],
    mood: "melancholy", 
    author: "KP"
  },
  {
    lines: ["Fire burns within", "Every beat ignites my soul", "Strength beyond all doubt"],
    mood: "workout",
    author: "KP"
  },
  {
    lines: ["Mind like crystal clear", "Thoughts align with perfect flow", "Focus sharp as steel"],
    mood: "focus",
    author: "KP"
  },
  {
    lines: ["Hearts dance in the light", "Two souls merge in harmony", "Love eternal flows"],
    mood: "love",
    author: "KP"
  },
  {
    lines: ["Stars explode in joy", "Laughter echoes through the night", "Life celebrates"],
    mood: "party",
    author: "KP"
  },
  {
    lines: ["Music speaks in waves", "Your essence flows through each note", "Soul finds its rhythm"],
    mood: "default",
    author: "KP"
  }
];

export const HaikuPoetry = ({ mood, isVisible = true }: HaikuPoetryProps) => {
  const [currentHaiku, setCurrentHaiku] = useState<Haiku | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setFadeIn(false);
      return;
    }

    const moodHaikus = haikus.filter(h => h.mood === mood || (!mood && h.mood === 'default'));
    const selectedHaiku = moodHaikus.length > 0 
      ? moodHaikus[Math.floor(Math.random() * moodHaikus.length)]
      : haikus.find(h => h.mood === 'default')!;

    setFadeIn(false);
    setTimeout(() => {
      setCurrentHaiku(selectedHaiku);
      setFadeIn(true);
    }, 300);
  }, [mood, isVisible]);

  if (!currentHaiku || !isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed top-20 left-8 z-20 transition-all duration-1000 ${
        fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="backdrop-blur-md bg-black/20 rounded-2xl p-6 border border-white/10">
        <div className="space-y-2">
          {currentHaiku.lines.map((line, index) => (
            <p 
              key={index}
              className={`text-white/90 font-crimson italic text-lg transition-all duration-500 ${
                fadeIn ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ 
                transitionDelay: `${index * 200}ms`,
                fontFamily: 'Crimson Text, serif'
              }}
            >
              {line}
            </p>
          ))}
          <div className="mt-4 pt-2 border-t border-white/20">
            <p className="text-white/60 text-sm font-dancing">
              — {currentHaiku.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};