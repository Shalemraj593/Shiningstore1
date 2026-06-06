import { Truck, RotateCcw, Shield, Headphones } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On all orders over $50',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: Shield,
    title: 'Secure Checkout',
    description: '100% protected payments',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated customer care',
  },
];

export default function FeaturesBar() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className="w-full py-12"
      style={{ backgroundColor: 'var(--color-cream)' }}
    >
      <div className="section-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`flex items-center gap-4 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{
                borderRight: i < features.length - 1 ? '1px solid var(--color-border)' : 'none',
                paddingRight: i < features.length - 1 ? '2rem' : '0',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <feature.icon
                size={24}
                strokeWidth={1.5}
                style={{ color: 'var(--color-charcoal)' }}
              />
              <div>
                <h3 className="font-medium text-sm" style={{ color: 'var(--color-charcoal)' }}>
                  {feature.title}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
