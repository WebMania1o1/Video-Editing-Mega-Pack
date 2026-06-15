import React, { useState, useRef, useEffect } from 'react';
import { Eye } from 'lucide-react';

interface BeforeAfterSliderProps {
  key?: string;
  beforeImg: string;
  afterImg: string;
  title: string;
  description: string;
}

export default function BeforeAfterSlider({ beforeImg, afterImg, title, description }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-850 bg-[#0c0c0e] overflow-hidden">
      {/* Interactive visual slider stage */}
      <div 
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative h-64 md:h-[400px] w-full select-none overflow-hidden cursor-ew-resize group"
      >
        {/* AFTER IMAGE (Background - Graded LUT Applied) */}
        <img
          src={afterImg}
          alt="Graded cinematic edit output"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />
        <div className="absolute right-4 top-4 z-20 rounded-md bg-violet-600 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold tracking-widest text-white uppercase shadow-md font-semibold select-none">
          CINEMATIC COLOR
        </div>

        {/* BEFORE IMAGE (Overlay - Cropped RAW Footage) */}
        <div 
          className="absolute inset-0 h-full overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImg}
            alt="Before ungraded RAW flat look"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover pointer-events-none max-w-none"
            style={{ width: containerRef.current ? containerRef.current.getBoundingClientRect().width : '100vw' }}
          />
        </div>
        <div className="absolute left-4 top-4 z-20 rounded-md bg-[#0c0c0e]/95 border border-zinc-800 backdrop-blur-sm px-2.5 py-1 text-[10px] font-mono tracking-widest text-[#a1a1aa] uppercase select-none">
          RAW FEEDS
        </div>

        {/* HORIZONTAL SWIPER DRAGGABLE BAR */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-violet-500 z-30 cursor-ew-resize flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Draggable Circle Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-violet-500 bg-zinc-950 text-white shadow-xl shadow-violet-500/10 transition-transform group-hover:scale-110 active:scale-95">
            <svg 
              className="h-4.5 w-4.5 text-white fill-none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m8 6-6 6 6 6M16 18l6-6-6-6" />
            </svg>
          </div>
        </div>

        {/* Swipe instructions helper banner overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none rounded-full bg-[#0c0c0e]/85 border border-[#1f1f23] backdrop-blur-md px-3.5 py-1.5 text-[10px] text-zinc-300 flex items-center gap-2 opacity-100 group-hover:opacity-75 transition-opacity py-1 shadow-lg">
          <Eye size={12} className="text-violet-400 animate-pulse" />
          <span className="font-medium tracking-wide">DRAG THE SLIDER TO GRADE</span>
        </div>
      </div>

      {/* Description text panel underneath slider */}
      <div className="p-5 border-t border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c0c0e]">
        <div>
          <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest block mb-1">
            REAL INTERACTIVE DEMO ACCENT
          </span>
          <h4 className="font-bold text-white tracking-tight">{title}</h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            {description}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setSliderPosition(20)}
            className="rounded bg-zinc-900 border border-zinc-850 hover:border-zinc-750 px-2.5 py-1 text-[10px] text-zinc-400 transition-colors hover:text-white hover:bg-zinc-800/80 cursor-pointer"
          >
            Show Before
          </button>
          <button
            onClick={() => setSliderPosition(50)}
            className="rounded bg-zinc-900 border border-zinc-850 hover:border-zinc-750 px-2.5 py-1 text-[10px] text-zinc-400 transition-colors hover:text-white hover:bg-zinc-800/80 cursor-pointer"
          >
            Symmetrical
          </button>
          <button
            onClick={() => setSliderPosition(80)}
            className="rounded bg-zinc-900 border border-zinc-850 hover:border-zinc-750 px-2.5 py-1 text-[10px] text-zinc-400 transition-colors hover:text-white hover:bg-zinc-800/80 cursor-pointer"
          >
            Show After
          </button>
        </div>
      </div>
    </div>
  );
}
