import { testimonials } from '@/data/products';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className="w-full py-20 lg:py-24"
      style={{ backgroundColor: 'var(--color-charcoal)' }}
    >
      <div className="section-padding">
        {/* Section Header */}
        <h2
          className="heading-1 text-3xl sm:text-4xl text-center mb-12"
          style={{ color: 'var(--color-cream)' }}
        >
          What Our Customers Say
        </h2>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className={`flex flex-col ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {/* Quote Mark */}
              <span
                className="text-5xl font-serif leading-none mb-4"
                style={{ color: 'var(--color-accent)', opacity: 0.3 }}
              >
                &ldquo;
              </span>

              {/* Quote Text */}
              <p
                className="text-base italic leading-relaxed mb-6"
                style={{ color: 'var(--color-cream)' }}
              >
                {t.quote}
              </p>

              {/* Divider */}
              <div
                className="w-10 h-px mb-6"
                style={{ backgroundColor: 'var(--color-muted)' }}
              />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{
                    border: '2px solid var(--color-accent)',
                    color: 'var(--color-cream)',
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-cream)' }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-caption"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
