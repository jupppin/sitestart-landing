'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  RestaurantMockup,
  ProfessionalMockup,
  HomeServicesMockup,
  RetailMockup,
} from './mockups';

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  description: string;
  mockup: React.ReactNode;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: 'Restaurant Website',
    category: 'Food & Dining',
    description: 'Menu display, online ordering, warm inviting design that brings customers through the door.',
    mockup: <RestaurantMockup />,
  },
  {
    id: 2,
    title: 'Professional Services',
    category: 'Business & Consulting',
    description: 'Clean corporate design with service showcases and professional credibility builders.',
    mockup: <ProfessionalMockup />,
  },
  {
    id: 3,
    title: 'Home Services',
    category: 'Trade & Contractors',
    description: 'Bold service presentation with trust badges, emergency booking, and clear call-to-actions.',
    mockup: <HomeServicesMockup />,
  },
  {
    id: 4,
    title: 'Retail Boutique',
    category: 'E-commerce & Retail',
    description: 'Modern product showcase with shopping features, sales banners, and easy navigation.',
    mockup: <RetailMockup />,
  },
];

function BrowserChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
      {/* Browser Title Bar */}
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="ml-2 flex-1">
          <div className="mx-auto max-w-[200px] rounded bg-white px-3 py-1">
            <div className="flex items-center justify-center gap-1">
              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
              <span className="text-[10px] text-gray-500">yoursite.com</span>
            </div>
          </div>
        </div>
      </div>
      {/* Browser Content */}
      <div className="overflow-hidden bg-gray-50">
        {children}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToIndex = useCallback((index: number) => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.scrollWidth / portfolioItems.length;
      carouselRef.current.scrollTo({
        left: scrollAmount * index,
        behavior: 'smooth',
      });
    }
    setCurrentIndex(index);
  }, []);

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % portfolioItems.length;
    scrollToIndex(nextIndex);
  }, [currentIndex, scrollToIndex]);

  const goToPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + portfolioItems.length) % portfolioItems.length;
    scrollToIndex(prevIndex);
  }, [currentIndex, scrollToIndex]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        goToNext();
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, goToNext]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Handle scroll to update dots
  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollPosition = carouselRef.current.scrollLeft;
      const itemWidth = carouselRef.current.scrollWidth / portfolioItems.length;
      const newIndex = Math.round(scrollPosition / itemWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < portfolioItems.length) {
        setCurrentIndex(newIndex);
      }
    }
  };

  return (
    <section id="examples" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            Portfolio
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            See What We&apos;ve Built
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Check out example websites we create for small businesses like yours.
            Each design is tailored to the specific industry and business needs.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative mt-12"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Portfolio Grid - Mobile: Stack, Tablet: 2 cols, Desktop: 4 cols */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex flex-col gap-8 md:flex-row md:gap-6 md:overflow-x-auto md:scroll-smooth md:pb-4 lg:overflow-visible"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
                  {/* Browser Mockup */}
                  <div className="overflow-hidden">
                    <BrowserChrome>
                      {item.mockup}
                    </BrowserChrome>
                  </div>

                  {/* Card Info */}
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators - Only visible on mobile/tablet */}
          <div className="mt-8 flex justify-center gap-2 lg:hidden">
            {portfolioItems.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  index === currentIndex
                    ? 'w-8 bg-blue-600'
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to example ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          {/* Mobile Navigation Arrows */}
          <div className="mt-6 flex justify-center gap-4 md:hidden">
            <button
              onClick={goToPrev}
              className="rounded-full bg-gray-100 p-3 transition-all hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous example"
            >
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="rounded-full bg-gray-100 p-3 transition-all hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next example"
            >
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-base text-gray-600">
            Want a website like these for your business?
          </p>
          <a
            href="#get-started"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
          >
            Get Started Today
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
