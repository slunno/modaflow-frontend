'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Inline Icons (Zero external dependencies)
const ChevronLeftIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="13"
    height="13"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export interface CarouselItem {
  tag?: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  img: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface CoverFlowCarouselProps {
  items?: CarouselItem[];
  sectionLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CarouselItem) => void;
}

export function CoverFlowCarousel({
  items = [],
  sectionLabel = 'DESTAQUES',
  autoplay = true,
  autoplayDelay = 5000,
  className = '',
  onCtaClick,
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const touchStartX = useRef(0);
  const total = items.length;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    if (total <= 1) return;
    setCurrentIndex(idx % total);
  };

  useEffect(() => {
    if (!autoplay || reducedMotion || isHovered || isFocused || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, isFocused, nextSlide, reducedMotion, total]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartX.current = touch.clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const diff = touch.clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!items || items.length === 0) return null;

  const transitionDuration = reducedMotion ? '0ms' : '800ms';

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={sectionLabel || 'Carrossel de marcas em destaque'}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full min-h-[760px] flex items-center justify-center overflow-hidden py-12 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-camel/50 ${className}`}
      style={{
        backgroundColor: '#0c0a09',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src={items[currentIndex]?.img}
          alt=""
          aria-hidden="true"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.22) blur(32px)',
            transform: 'scale(1.15)',
            transition: reducedMotion ? 'none' : 'opacity 1000ms ease, filter 1000ms ease',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at center, rgba(12,10,9,0.3) 0%, rgba(12,10,9,0.92) 100%)',
          }}
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 z-10 flex flex-col items-center">
        {/* Eyebrow */}
        {sectionLabel && (
          <div className="flex items-center gap-3 mb-8">
            <span
              style={{
                width: '36px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #c5a880)',
              }}
            />
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#c5a880',
                margin: 0,
              }}
            >
              {sectionLabel}
            </h3>
            <span
              style={{
                width: '36px',
                height: '1px',
                background: 'linear-gradient(90deg, #c5a880, transparent)',
              }}
            />
          </div>
        )}

        {/* 3D Coverflow Stage */}
        <div
          className="relative w-full h-[520px] flex justify-center items-center mb-8"
          style={{ perspective: '1400px' }}
        >
          {items.map((item, idx) => {
            let diff = (idx - currentIndex) % total;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            let transform = 'translateX(0px) scale(0.4) rotateY(0deg)';
            let opacity = 0;
            let zIndex = 0;
            let filter = 'brightness(0.4) blur(2px)';
            let isCenter = false;

            if (diff === 0) {
              isCenter = true;
              transform = 'translateX(0px) scale(1) rotateY(0deg)';
              opacity = 1;
              zIndex = 30;
              filter = 'brightness(1)';
            } else if (diff === 1) {
              transform = 'translateX(285px) scale(0.84) rotateY(-24deg)';
              opacity = 0.65;
              zIndex = 20;
              filter = 'brightness(0.75)';
            } else if (diff === -1) {
              transform = 'translateX(-285px) scale(0.84) rotateY(24deg)';
              opacity = 0.65;
              zIndex = 20;
              filter = 'brightness(0.75)';
            } else if (diff === 2) {
              transform = 'translateX(510px) scale(0.68) rotateY(-38deg)';
              opacity = 0.38;
              zIndex = 10;
              filter = 'brightness(0.55) blur(1px)';
            } else if (diff === -2) {
              transform = 'translateX(-510px) scale(0.68) rotateY(38deg)';
              opacity = 0.38;
              zIndex = 10;
              filter = 'brightness(0.55) blur(1px)';
            }

            return (
              <div
                key={idx}
                role="group"
                aria-roledescription="slide"
                aria-label={`${idx + 1} de ${total}: ${item.titleLine1}`}
                aria-hidden={!isCenter}
                onClick={() => !isCenter && goToSlide(idx)}
                style={{
                  position: 'absolute',
                  width: '330px',
                  height: '500px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  backgroundColor: '#171311',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformOrigin: 'center center',
                  transition: `all ${transitionDuration} cubic-bezier(0.25, 1, 0.5, 1)`,
                  boxShadow: isCenter
                    ? '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(197,168,128,0.25)'
                    : '0 15px 35px rgba(0,0,0,0.5)',
                  cursor: isCenter ? 'default' : 'pointer',
                }}
              >
                {/* Photo */}
                <img
                  src={item.img}
                  alt={isCenter ? item.titleLine1 : ''}
                  aria-hidden={!isCenter}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.68) 60%, rgba(0,0,0,0.96) 100%)',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                />

                {/* Content Overlay */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    padding: '20px 18px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    zIndex: 20,
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? 'translateY(0px)' : 'translateY(16px)',
                    transition: reducedMotion ? 'none' : 'opacity 500ms ease, transform 500ms ease',
                    pointerEvents: isCenter ? 'auto' : 'none',
                  }}
                >
                  {/* Tag */}
                  <div style={{ textAlign: 'right', width: '100%', paddingRight: '4px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        color: 'rgba(255,255,255,0.9)',
                        textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      marginTop: 'auto',
                      paddingBottom: '4px',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '1.65rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: '#ffffff',
                        margin: 0,
                        lineHeight: 1.1,
                        textShadow: '0 3px 12px rgba(0,0,0,0.95)',
                      }}
                    >
                      {item.titleLine1}
                    </h2>

                    {item.titleLine2 && (
                      <span
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: '#f3f0ea',
                          lineHeight: 1.2,
                          textShadow: '0 3px 10px rgba(0,0,0,0.9)',
                        }}
                      >
                        {item.titleLine2}
                      </span>
                    )}

                    <div
                      style={{
                        width: '34px',
                        height: '2px',
                        backgroundColor: '#c5a880',
                        borderRadius: '2px',
                        margin: '5px auto 4px',
                        boxShadow: '0 0 8px rgba(197,168,128,0.7)',
                      }}
                    />

                    {item.desc && (
                      <p
                        style={{
                          fontSize: '0.82rem',
                          fontStyle: 'italic',
                          color: 'rgba(255,255,255,0.9)',
                          maxWidth: '280px',
                          margin: '0 0 10px',
                          lineHeight: 1.3,
                          textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                        }}
                      >
                        {item.desc}
                      </p>
                    )}

                    <a
                      href={item.ctaUrl || '#'}
                      tabIndex={isCenter ? 0 : -1}
                      onClick={(e) => {
                        if (onCtaClick) {
                          e.preventDefault();
                          onCtaClick(item);
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 18px',
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, #c5a880 0%, #a48256 100%)',
                        color: '#110d0c',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.4), 0 0 15px rgba(197,168,128,0.3)',
                        cursor: 'pointer',
                        transition: 'transform 200ms ease, box-shadow 200ms ease',
                      }}
                    >
                      <span>{item.ctaText || 'Acessar'}</span>
                      <ArrowRightIcon />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Slide anterior"
              style={{
                position: 'absolute',
                left: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                zIndex: 40,
                transition: 'all 200ms ease',
              }}
            >
              <ChevronLeftIcon />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Próximo slide"
              style={{
                position: 'absolute',
                right: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                zIndex: 40,
                transition: 'all 200ms ease',
              }}
            >
              <ChevronRightIcon />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {total > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              zIndex: 30,
            }}
          >
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Ir para slide ${idx + 1}`}
                aria-current={idx === currentIndex ? 'true' : 'false'}
                style={{
                  height: '8px',
                  width: idx === currentIndex ? '28px' : '8px',
                  borderRadius: '9999px',
                  backgroundColor: idx === currentIndex ? '#c5a880' : 'rgba(255,255,255,0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: idx === currentIndex ? '0 0 10px rgba(197,168,128,0.7)' : 'none',
                  transition: 'all 300ms ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CoverFlowCarousel;
