"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Slide = {
  id: number;
  image_url: string;
  title: string;
  description: string;
  link: string;
};

export function HeroSlider({ 
  locale, 
  dict, 
  slides = [] 
}: { 
  locale: string, 
  dict: Record<string, string>,
  slides?: Slide[]
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!slides || slides.length === 0) return null;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <section className="relative w-full h-[320px] overflow-hidden group cursor-pointer border-b border-slate-200/60 dark:border-slate-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      {/* Background Image transitions */}
      {slides.map((s, index) => (
        <img 
          key={s.id}
          alt={s.title} 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} 
          src={s.image_url}
        />
      ))}

      {/* Clickable Overlay Link */}
      <Link href={`${prefix}${slide.link}`} className="absolute inset-0 z-10 block">
        <span className="sr-only">Go to {slide.title}</span>
      </Link>

      {(slide.title || slide.description) && (
        <div className="absolute inset-0 z-0">
          <div className="max-w-[1536px] mx-auto px-10 h-full flex items-end pb-12 pointer-events-none">
            <div className="text-white max-w-2xl transform transition-all duration-500 translate-y-0">
              {slide.title && <h2 className="text-4xl font-extrabold tracking-tight mb-2 drop-shadow-md">{slide.title}</h2>}
              {slide.description && <p className="text-lg opacity-90 drop-shadow-sm">{slide.description}</p>}
            </div>
          </div>
        </div>
      )}
      
      {/* Dots Indicator */}
      <div className="absolute bottom-10 left-0 right-0 z-20 pointer-events-none">
        <div className="max-w-[1536px] mx-auto px-10 flex justify-center md:justify-start pointer-events-auto">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button 
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentSlide(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
