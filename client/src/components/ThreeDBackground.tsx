import React, { useEffect, useRef, useState } from 'react';

interface FloatingBook {
  id: number;
  x: number;
  y: number;
  size: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  speedX: number;
  speedY: number;
  speedRot: number;
  color: string;
  icon: string;
  depth: number;
  opacity: number;
}

export const ThreeDBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [books, setBooks] = useState<FloatingBook[]>([]);

  useEffect(() => {
    // Generate randomized floating 3D books in ambient space
    const palette = [
      '#3b82f6', // blue
      '#6366f1', // indigo
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#10b981', // emerald
      '#f59e0b', // amber
      '#06b6d4', // cyan
    ];

    const icons = ['📖', '📘', '📕', '📗', '📙', '✨', '🧠', '📜', '💡'];

    const initialBooks: FloatingBook[] = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 30 + 35, // 35px - 65px
      rotationX: Math.random() * 40 - 20,
      rotationY: Math.random() * 60 - 30,
      rotationZ: Math.random() * 360,
      speedX: (Math.random() - 0.5) * 0.04,
      speedY: (Math.random() - 0.5) * 0.04,
      speedRot: (Math.random() - 0.5) * 0.2,
      color: palette[i % palette.length],
      icon: icons[i % icons.length],
      depth: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
      opacity: Math.random() * 0.25 + 0.12, // subtle background presence
    }));

    setBooks(initialBooks);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{ perspective: '1200px' }}
      aria-hidden="true"
    >
      {/* Dynamic 3D Ambient Glowing Light Orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 dark:opacity-15 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, #3b82f6 50%, transparent 70%)',
          top: '5%',
          left: '10%',
          transform: `translate3d(${mousePos.x * 40}px, ${mousePos.y * 30}px, 0)`,
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[160px] opacity-15 dark:opacity-10 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, #ec4899 0%, #8b5cf6 50%, transparent 70%)',
          bottom: '10%',
          right: '5%',
          transform: `translate3d(${mousePos.x * -50}px, ${mousePos.y * -40}px, 0)`,
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[130px] opacity-15 dark:opacity-10 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, #10b981 0%, #06b6d4 50%, transparent 70%)',
          top: '40%',
          right: '35%',
          transform: `translate3d(${mousePos.x * 25}px, ${mousePos.y * -25}px, 0)`,
        }}
      />

      {/* Subtle Architectural Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)`,
          transition: 'transform 0.4s ease-out'
        }}
      />

      {/* Floating 3D Books & Knowledge Elements in Parallax Depth */}
      {books.map((b) => {
        const parallaxX = mousePos.x * 35 * b.depth;
        const parallaxY = mousePos.y * 35 * b.depth;
        const rotY = b.rotationY + mousePos.x * 15 * b.depth;
        const rotX = b.rotationX - mousePos.y * 15 * b.depth;

        return (
          <div
            key={b.id}
            className="absolute transition-transform duration-500 ease-out"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size * 1.35}px`,
              transform: `
                translate3d(${parallaxX}px, ${parallaxY}px, ${b.depth * 50}px)
                rotateX(${rotX}deg)
                rotateY(${rotY}deg)
                rotateZ(${b.rotationZ}deg)
              `,
              transformStyle: 'preserve-3d',
              opacity: b.opacity,
            }}
          >
            {/* 3D Book Object in Space */}
            <div
              className="w-full h-full rounded-md shadow-2xl relative flex flex-col justify-between p-1.5 overflow-hidden border border-white/20 dark:border-white/10"
              style={{
                background: `linear-gradient(135deg, ${b.color}cc, ${b.color}88)`,
                boxShadow: `0 12px 28px -6px ${b.color}66, inset 3px 0 5px rgba(0,0,0,0.35)`,
              }}
            >
              {/* Spine Crease Line */}
              <div className="absolute left-2 top-0 bottom-0 w-[1.5px] bg-black/20 dark:bg-black/40" />

              {/* Gold/Silver Accent Foil line */}
              <div className="w-full flex justify-end">
                <span className="text-[10px] drop-shadow-sm opacity-90">{b.icon}</span>
              </div>

              {/* Book Spine Ribs */}
              <div className="space-y-1 my-auto pl-2">
                <div className="h-0.5 w-3/4 bg-white/40 rounded-full" />
                <div className="h-0.5 w-1/2 bg-white/25 rounded-full" />
              </div>

              {/* 3D Paper Page Edge Simulation on right */}
              <div
                className="absolute right-0 top-1 bottom-1 w-1 bg-white/80 dark:bg-stone-300 rounded-r-xs shadow-inner"
                style={{
                  background: 'repeating-linear-gradient(to bottom, #fff, #fff 1px, #ddd 2px)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
