import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const shopLinks = [
  { label: 'New Arrivals', href: 'category.html?cat=new' },
  { label: 'Dresses', href: 'category.html?cat=fashion' },
  { label: 'Outerwear', href: 'category.html?cat=fashion' },
  { label: 'Activewear', href: 'category.html?cat=fashion' },
  { label: 'Sale', href: 'category.html?cat=sale' }
];
const helpLinks = [
  { label: 'Customer Service', href: 'about.html' },
  { label: 'Track Order', href: 'tracking.html' },
  { label: 'Returns & Exchanges', href: 'about.html' },
  { label: 'Shipping Info', href: 'about.html' },
  { label: 'FAQ', href: 'about.html' }
];
const aboutLinks = [
  { label: 'Our Story', href: 'about.html' },
  { label: 'Sustainability', href: 'about.html' },
  { label: 'Careers', href: 'about.html' },
  { label: 'Press', href: 'about.html' },
  { label: 'Contact Us', href: 'about.html' }
];

export default function Footer() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <footer
      ref={ref}
      className="w-full pt-16 pb-8"
      style={{ backgroundColor: 'var(--color-charcoal)' }}
    >
      <div className="section-padding">
        {/* Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div
            className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0s' }}
          >
            <h3
              className="text-caption font-medium tracking-[0.12em] mb-4"
              style={{ color: 'var(--color-cream)' }}
            >
              SHINING STORE
            </h3>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: 'var(--color-muted)' }}
            >
              Redefining premium fashion with elegant, timeless pieces designed for the modern lifestyle.
            </p>
            <div className="flex items-center gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <button
                  key={i}
                  className="transition-colors hover:opacity-70"
                  style={{ color: 'var(--color-muted)' }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.color = 'var(--color-accent)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.color = 'var(--color-muted)';
                  }}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div
            className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}
          >
            <h4
              className="text-caption mb-4"
              style={{ color: 'var(--color-muted)' }}
            >
              Shop
            </h4>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:opacity-70"
                    style={{ color: 'var(--color-cream)' }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--color-cream)';
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Column */}
          <div
            className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            <h4
              className="text-caption mb-4"
              style={{ color: 'var(--color-muted)' }}
            >
              Help
            </h4>
            <ul className="space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:opacity-70"
                    style={{ color: 'var(--color-cream)' }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--color-cream)';
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About Column */}
          <div
            className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.3s' }}
          >
            <h4
              className="text-caption mb-4"
              style={{ color: 'var(--color-muted)' }}
            >
              About
            </h4>
            <ul className="space-y-2.5">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:opacity-70"
                    style={{ color: 'var(--color-cream)' }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--color-cream)';
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p
            className="text-caption"
            style={{ color: 'var(--color-muted)' }}
          >
            &copy; 2026 Shining Store. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
              <button
                key={link}
                className="text-caption transition-colors"
                style={{ color: 'var(--color-muted)' }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--color-cream)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--color-muted)';
                }}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
