"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    <section className="relative w-full h-[250px] sm:h-[320px] md:h-[400px] lg:h-[450px] overflow-hidden group cursor-pointer border-b border-slate-200/60 dark:border-slate-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      {/* Background Image transitions */}
      {slides.map((s, index) => (
        <Image 
          key={s.id}
          alt={s.title} 
          className={`object-cover transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} 
          src={s.image_url}
          fill
          priority={index === 0}
          sizes="100vw"
        />
      ))}

      {/* Clickable Overlay Link */}
      <Link href={`${prefix}${slide.link}`} className="absolute inset-0 z-10 block">
        <span className="sr-only">Go to {slide.title}</span>
      </Link>

      {(slide.title || slide.description) && (
        <div className="absolute inset-0 z-0">
          {/* Add a subtle gradient overlay to ensure text is readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="relative max-w-[1536px] mx-auto px-6 md:px-10 h-full flex items-end pb-12 md:pb-16 pointer-events-none">
            <div className="text-white max-w-2xl transform transition-all duration-500 translate-y-0">
              {slide.title && <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight mb-1.5 md:mb-2 drop-shadow-md">{slide.title}</h2>}
              {slide.description && <p className="text-xs sm:text-sm md:text-lg opacity-90 drop-shadow-sm line-clamp-2 md:line-clamp-none">{slide.description}</p>}
            </div>
          </div>
        </div>
      )}
      
      {/* Dots Indicator */}
      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 z-20 pointer-events-none">
        <div className="max-w-[1536px] mx-auto px-6 md:px-10 flex justify-center md:justify-start pointer-events-auto">
          <div className="flex gap-1.5 md:gap-2">
            {slides.map((_, index) => (
              <button 
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentSlide(index);
                }}
                className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 md:w-8 bg-white' : 'w-1.5 md:w-2 bg-white/40 hover:bg-white/60'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
