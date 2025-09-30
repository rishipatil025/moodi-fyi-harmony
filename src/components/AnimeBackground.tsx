import { useEffect, useRef } from 'react';

const AnimeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Anime-style floating sakura petals
    const petals: Array<{
      x: number;
      y: number;
      rotation: number;
      rotationSpeed: number;
      speed: number;
      size: number;
      opacity: number;
      hue: number;
    }> = [];

    // Initialize petals
    for (let i = 0; i < 50; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        speed: Math.random() * 2 + 0.5,
        size: Math.random() * 8 + 4,
        opacity: Math.random() * 0.6 + 0.2,
        hue: Math.random() * 60 + 300, // Pink to purple range
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach((petal) => {
        // Update position
        petal.y += petal.speed;
        petal.x += Math.sin(petal.y * 0.01) * 0.5;
        petal.rotation += petal.rotationSpeed;

        // Reset petal when it goes off screen
        if (petal.y > canvas.height + 20) {
          petal.y = -20;
          petal.x = Math.random() * canvas.width;
        }

        // Draw petal
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate((petal.rotation * Math.PI) / 180);
        
        // Create gradient for petal
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, petal.size);
        gradient.addColorStop(0, `hsla(${petal.hue}, 70%, 80%, ${petal.opacity})`);
        gradient.addColorStop(1, `hsla(${petal.hue}, 70%, 60%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'linear-gradient(135deg, hsl(240, 20%, 5%) 0%, hsl(260, 25%, 8%) 25%, hsl(280, 30%, 6%) 50%, hsl(300, 25%, 8%) 75%, hsl(240, 20%, 5%) 100%)'
      }}
    />
  );
};

export default AnimeBackground;