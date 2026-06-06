import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { ref, isVisible } = useScrollAnimation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <section
      ref={ref}
      className="w-full py-20 lg:py-24"
      style={{ backgroundColor: 'var(--color-surface-warm)' }}
    >
      <div className="section-padding">
        <div className="max-w-xl mx-auto text-center">
          <h2
            className={`heading-1 text-3xl sm:text-4xl mb-4 ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ color: 'var(--color-charcoal)' }}
          >
            Join the Shining Club
          </h2>
          <p
            className={`text-sm mb-8 ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ color: 'var(--color-muted)', animationDelay: '0.1s' }}
          >
            Subscribe for exclusive deals, early access to new collections, and 10% off your first order.
          </p>

          {subscribed ? (
            <p
              className="text-base font-medium animate-fade-in"
              style={{ color: 'var(--color-accent)' }}
            >
              Welcome to the club! &#10003;
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={`flex flex-col sm:flex-row gap-3 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.2s' }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 h-[52px] px-6 rounded-full text-sm outline-none transition-colors focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-charcoal)',
                }}
              />
              <button
                type="submit"
                className="h-[52px] px-8 rounded-full text-caption font-medium transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-charcoal)',
                  color: 'var(--color-cream)',
                }}
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
