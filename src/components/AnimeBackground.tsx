import { useEffect, useState } from 'react';
import animeSky1 from '@/assets/anime-sky-1.jpg';
import animeSky2 from '@/assets/anime-sky-2.jpg';
import animeSky3 from '@/assets/anime-sky-3.jpg';

const backgrounds = [animeSky1, animeSky2, animeSky3];

const AnimeBackground = () => {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 15000); // Change every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Anime Background Images with Ken Burns Effect */}
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-2000 ${
            index === currentBg ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="w-full h-full ken-burns bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url(${bg})`,
            }}
          />
        </div>
      ))}

      {/* Dark Gradient Overlay for UI Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(45,27,105,0.3)] via-[rgba(0,0,0,0.4)] to-[rgba(0,0,0,0.6)]" />

      {/* Subtle Cloud Illustrations */}
      <div className="absolute top-0 left-0 w-64 h-32 opacity-10">
        <svg viewBox="0 0 200 100" className="w-full h-full animate-[float_120s_linear_infinite]">
          <ellipse cx="50" cy="50" rx="50" ry="30" fill="white" opacity="0.3"/>
          <ellipse cx="90" cy="45" rx="60" ry="35" fill="white" opacity="0.25"/>
          <ellipse cx="130" cy="50" rx="50" ry="28" fill="white" opacity="0.3"/>
        </svg>
      </div>
      
      <div className="absolute top-10 right-0 w-64 h-32 opacity-10">
        <svg viewBox="0 0 200 100" className="w-full h-full animate-[float_100s_linear_infinite_reverse]">
          <ellipse cx="70" cy="55" rx="55" ry="32" fill="white" opacity="0.3"/>
          <ellipse cx="120" cy="50" rx="60" ry="33" fill="white" opacity="0.25"/>
        </svg>
      </div>
    </div>
  );
};

export default AnimeBackground;
