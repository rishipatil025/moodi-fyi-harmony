import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  drift: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  pulseOffset: number;
  pulseDuration: number;
}

interface Petal {
  x: number;
  y: number;
  rotation: number;
  speed: number;
  drift: number;
  delay: number;
}

const FloatingElements = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const petalsRef = useRef<Petal[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(20, Math.floor(window.innerWidth / 60));
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 5 + 3,
          speed: Math.random() * 0.4 + 0.3,
          opacity: Math.random() * 0.3 + 0.6,
          color: '#FFFFFF',
          drift: Math.random() * 0.5 - 0.25,
        });
      }
    };

    const createStars = () => {
      starsRef.current = [];
      const starCount = Math.min(30, Math.floor(window.innerWidth / 40));
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height * 0.4), // Top 40%
          size: Math.random() * 2 + 2,
          pulseOffset: Math.random() * Math.PI * 2,
          pulseDuration: Math.random() * 2 + 2,
        });
      }
    };

    const createPetals = () => {
      petalsRef.current = [];
      const petalCount = Math.min(10, Math.floor(window.innerWidth / 120));
      
      for (let i = 0; i < petalCount; i++) {
        petalsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          rotation: Math.random() * 360,
          speed: Math.random() * 0.3 + 0.2,
          drift: Math.random() * 0.8 - 0.4,
          delay: Math.random() * 5000,
        });
      }
    };

    const animate = () => {
      timeRef.current += 0.016; // ~60fps
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw glowing particles (fireflies/wisps)
      particlesRef.current.forEach((particle) => {
        particle.y -= particle.speed;
        particle.x += particle.drift;
        
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }
        
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner bright core
        ctx.globalAlpha = particle.opacity * 0.9;
        ctx.fillStyle = particle.color;
        ctx.filter = 'blur(2px)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';
        
        ctx.restore();
      });

      // Draw twinkling stars
      starsRef.current.forEach((star) => {
        const pulse = Math.sin(timeRef.current * (2 / star.pulseDuration) + star.pulseOffset);
        const opacity = 0.2 + (pulse + 1) / 2 * 0.6; // 0.2 to 0.8
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw sakura petals
      petalsRef.current.forEach((petal) => {
        petal.y += petal.speed;
        petal.x += petal.drift * Math.sin(petal.y * 0.01);
        petal.rotation += 1;
        
        if (petal.y > canvas.height + 20) {
          petal.y = -20;
          petal.x = Math.random() * canvas.width;
        }
        
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate((petal.rotation * Math.PI) / 180);
        ctx.globalAlpha = 0.7;
        ctx.filter = 'blur(1px)';
        
        // Draw petal shape
        ctx.fillStyle = '#FFB7C5';
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Petal detail
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-1, -1, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.filter = 'none';
        ctx.restore();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    createStars();
    createPetals();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
      createStars();
      createPetals();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ background: 'transparent' }}
    />
  );
};

export default FloatingElements;
