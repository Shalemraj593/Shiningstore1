import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
    subtitle: 'SUMMER 2026 COLLECTION',
    title: 'Elegant\nSummer Styles',
    desc: 'Discover our curated collection of timeless pieces designed for the modern woman.',
    btnText: 'Shop Collection',
    objectPosition: 'center 30%'
  },
  {
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&q=80',
    subtitle: 'JUST DROPPED',
    title: 'New Season\nArrivals',
    desc: 'Be the first to wear our latest designs. Fresh styles updated weekly.',
    btnText: 'Explore Now',
    objectPosition: 'center 15%'
  },
  {
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80',
    subtitle: 'PREMIUM ESSENTIALS',
    title: 'Outerwear\nEdit',
    desc: 'Layering pieces that elevate every outfit. Crafted with premium fabrics.',
    btnText: 'Shop Outerwear',
    objectPosition: 'center 5%'
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const scrollToTrending = () => {
    const el = document.getElementById('trending');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ height: '100vh', backgroundColor: 'var(--color-charcoal)' }}
    >
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title.replace('\n', ' ')}
            className="w-full h-full object-cover"
            style={{ objectPosition: slide.objectPosition || 'center center' }}
          />
          {/* Premium Gradient Overlay: Darker on the left for maximum text contrast, lighter on the right */}
          <div 
            className="absolute inset-0" 
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.15) 100%)'
            }}
          />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/45 transition-all duration-300 pointer-events-auto"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/45 transition-all duration-300 pointer-events-auto"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Text Overlay */}
      <div
        className="absolute inset-0 z-10 flex flex-col justify-end section-padding pb-16 sm:pb-24 pointer-events-none"
      >
        <div className="max-w-2xl pointer-events-auto relative h-64">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ease-in-out absolute bottom-0 left-0 w-full ${
                index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ pointerEvents: index === currentSlide ? 'auto' : 'none' }}
            >
              <p
                className="hero-tag text-caption mb-4 font-semibold tracking-widest"
                style={{ 
                  color: 'var(--color-accent)',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)'
                }}
              >
                {slide.subtitle}
              </p>
              <h1
                className="hero-headline heading-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6"
                style={{ 
                  color: 'var(--color-cream)',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
                }}
              >
                {slide.title.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h1>
              <p
                className="hero-subheadline text-base sm:text-lg mb-8 max-w-md font-medium"
                style={{ 
                  color: 'var(--color-cream)',
                  textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)'
                }}
              >
                {slide.desc}
              </p>
              <button
                onClick={scrollToTrending}
                className="hero-cta btn-primary"
              >
                {slide.btnText}
              </button>
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 pointer-events-auto">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
