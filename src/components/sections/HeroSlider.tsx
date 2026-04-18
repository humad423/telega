"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const mockBanners = [
  { id: 1, img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200', title: 'Start your Web3 Journey with Top Channels' },
  { id: 2, img: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=1200', title: 'The Ultimate AI Directory' },
];

export function HeroSlider({ locale }: { locale: string }) {
  const [current, setCurrent] = useState(0);

  // Auto slide mock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % mockBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (mockBanners.length === 0) return null; // Only show if data exists (per requirements)

  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-surface-container overflow-hidden">
      {mockBanners.map((b, i) => (
        <div 
          key={b.id} 
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          style={{ backgroundImage: `url(${b.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {/* Gradients to merge image with the dark mode/light mode background */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent"></div>
          
          <div className="absolute bottom-10 left-10 md:left-20 text-white z-20">
            <h2 className="text-3xl md:text-5xl font-extrabold max-w-lg mb-4 drop-shadow-md">
              {b.title}
            </h2>
            <button className="px-6 py-2 bg-primary hover:bg-primary-container transition-colors rounded-full font-bold">
               Explore
            </button>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button 
        onClick={() => setCurrent((current - 1 + mockBanners.length) % mockBanners.length)}
        className="absolute top-1/2 left-4 z-20 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={() => setCurrent((current + 1) % mockBanners.length)}
        className="absolute top-1/2 right-4 z-20 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
