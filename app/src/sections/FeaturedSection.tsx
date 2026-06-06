import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const collections = [
  {
    badge: 'Featured',
    title: 'The Summer Edit',
    subtitle: 'Curated looks for every occasion',
    cta: 'Shop the Look',
    image: '/images/feat-summer.jpg',
  },
  {
    badge: 'New',
    title: 'Evening Elegance',
    subtitle: 'Sophisticated styles for special moments',
    cta: 'Explore',
    image: '/images/feat-evening.jpg',
  },
];

export default function FeaturedSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className="w-full py-20 lg:py-24"
      style={{ backgroundColor: 'var(--color-cream)' }}
    >
      <div className="section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {collections.map((col, i) => (
            <div
              key={col.title}
              className={`relative rounded-2xl overflow-hidden aspect-[16/10] lg:aspect-[4/3] cursor-pointer ${
                isVisible ? 'animate-scale-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(26,26,26,0.7) 0%, transparent 60%)',
                }}
              />
              
              {/* Badge */}
              <span
                className="absolute top-5 left-5 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wider uppercase"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-charcoal)' }}
              >
                {col.badge}
              </span>

              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <h3
                  className="heading-1 text-2xl sm:text-3xl lg:text-4xl mb-2"
                  style={{ color: 'var(--color-cream)' }}
                >
                  {col.title}
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: 'rgba(245, 243, 238, 0.8)' }}
                >
                  {col.subtitle}
                </p>
                <span
                  className="text-caption font-medium inline-flex items-center gap-2 hover:gap-3 transition-all"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {col.cta} &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
