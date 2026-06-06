import { Instagram } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const images = [
  '/images/insta-1.jpg',
  '/images/insta-2.jpg',
  '/images/insta-3.jpg',
  '/images/insta-4.jpg',
  '/images/insta-5.jpg',
];

export default function InstagramSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className="w-full py-20 lg:py-24"
      style={{ backgroundColor: 'var(--color-cream)' }}
    >
      <div className="section-padding">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2
            className="heading-1 text-3xl sm:text-4xl mb-3"
            style={{ color: 'var(--color-charcoal)' }}
          >
            @ShiningStore
          </h2>
          <p
            className="text-sm"
            style={{ color: 'var(--color-muted)' }}
          >
            Follow us for daily style inspiration
          </p>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className={`insta-item relative aspect-square overflow-hidden cursor-pointer ${
                isVisible ? 'animate-scale-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <img
                src={img}
                alt={`Instagram ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <div
                className="insta-overlay absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(26, 26, 26, 0.4)' }}
              >
                <Instagram size={20} style={{ color: 'var(--color-cream)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
