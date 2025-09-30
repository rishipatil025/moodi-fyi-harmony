import { useEffect, useState } from 'react';
import animeBg1 from '@/assets/anime-bg-1.jpg';
import animeBg2 from '@/assets/anime-bg-2.jpg';
import animeBg3 from '@/assets/anime-bg-3.jpg';
import animeBg4 from '@/assets/anime-bg-4.jpg';

const backgrounds = [animeBg1, animeBg2, animeBg3, animeBg4];

const AnimeBackground = () => {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 10000); // Change background every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-2000 ${
            currentBg === index ? 'opacity-30' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${bg})`,
          }}
        />
      ))}
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/95" />
    </div>
  );
};

export default AnimeBackground;
