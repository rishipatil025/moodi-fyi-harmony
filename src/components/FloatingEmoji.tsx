import { useEffect, useState } from 'react';

export interface EmojiReaction {
  id: string;
  emoji: string;
  userId: string;
  color: string;
  timestamp: number;
}

interface FloatingEmojiProps {
  reactions: EmojiReaction[];
}

export const FloatingEmoji = ({ reactions }: FloatingEmojiProps) => {
  const [activeReactions, setActiveReactions] = useState<EmojiReaction[]>([]);

  useEffect(() => {
    if (reactions.length > 0) {
      const latestReaction = reactions[reactions.length - 1];
      setActiveReactions(prev => [...prev, latestReaction]);

      setTimeout(() => {
        setActiveReactions(prev => prev.filter(r => r.id !== latestReaction.id));
      }, 3000);
    }
  }, [reactions]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {activeReactions.map((reaction) => {
        const randomX = Math.random() * 80 + 10;
        const randomRotation = Math.random() * 40 - 20;
        
        return (
          <div
            key={reaction.id}
            className="absolute animate-float-up"
            style={{
              left: `${randomX}%`,
              bottom: '20%',
              animation: 'float-up 3s ease-out forwards',
            }}
          >
            <div
              className="text-5xl drop-shadow-lg"
              style={{
                transform: `rotate(${randomRotation}deg)`,
                filter: `drop-shadow(0 0 8px ${reaction.color})`,
              }}
            >
              {reaction.emoji}
            </div>
          </div>
        );
      })}
    </div>
  );
};
