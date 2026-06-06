import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { navCategories } from '@/data/products';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const { 
    cartCount, 
    wishlistCount, 
    setIsCartOpen, 
    setIsWishlistOpen, 
    setIsSearchOpen,
    setIsAuthOpen,
    currency,
    changeCurrency 
  } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 64;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const getSectionId = (cat: string) => {
    const map: Record<string, string> = {
      'New Arrivals': 'trending',
      'Fashion': 'categories',
      'Shoes': 'categories',
      'Electronics': 'categories',
      'Pets': 'categories',
      'Accessories': 'categories',
    };
    return map[cat] || 'categories';
  };

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const session = localStorage.getItem('shiningstore_session');
    if (session) {
      window.location.href = 'account.html';
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div
        className={`announcement-bar fixed top-0 left-0 right-0 z-50 h-10 flex items-center justify-center text-caption transition-transform duration-400 ${
          announcementVisible && !scrolled ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <span className="text-center px-4">
          Become a Seller on Shining Store — Reach millions of customers worldwide.{' '}
          <a href="seller-register.html" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>Start Selling →</a>
        </span>
        <button
          onClick={() => setAnnouncementVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
          aria-label="Close announcement"
        >
          <X size={14} />
        </button>
      </div>

      {/* Main Navigation */}
      <nav
        className={`fixed left-0 right-0 z-40 h-16 flex items-center transition-all duration-300 ${
          scrolled
            ? 'top-0 backdrop-blur-xl border-b'
            : announcementVisible ? 'top-10' : 'top-0'
        }`}
        style={{
          backgroundColor: scrolled ? 'rgba(245, 243, 238, 0.9)' : 'transparent',
          borderColor: scrolled ? 'var(--color-border)' : 'transparent',
        }}
      >
        <div className="w-full section-padding flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-caption font-medium tracking-[0.12em] hover:opacity-70 transition-all duration-300"
            style={{ color: scrolled ? 'var(--color-charcoal)' : 'var(--color-cream)' }}
          >
            <span 
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current text-[10px] font-semibold transition-all duration-300"
            >
              Logo
            </span>
            SHINING STORE
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => scrollToSection(getSectionId(cat))}
                className="nav-link relative group transition-colors duration-300"
                style={{ color: scrolled ? 'var(--color-charcoal)' : 'rgba(255, 255, 255, 0.9)' }}
              >
                {cat}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
              </button>
            ))}
          </div>

          {/* Right Icons */}
          <div 
            className="flex items-center gap-1 transition-colors duration-300"
            style={{ color: scrolled ? 'var(--color-charcoal)' : 'rgba(255, 255, 255, 0.9)' }}
          >
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold uppercase transition-colors duration-300 ${
                  scrolled ? 'hover:bg-black/5' : 'hover:bg-white/10'
                }`}
                style={{ color: 'inherit' }}
              >
                {currency === 'USD' ? '$ USD' : '₹ INR'}
                <ChevronDown size={12} className={`transition-transform duration-200 ${isCurrencyOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCurrencyOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCurrencyOpen(false)} />
                  <div
                    className="absolute right-0 mt-2 z-50 rounded-lg shadow-lg border p-1 min-w-[100px]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <button
                      onClick={() => {
                        changeCurrency('USD');
                        setIsCurrencyOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium rounded transition-colors ${
                        currency === 'USD' ? 'bg-black/5 font-semibold' : 'hover:bg-black/5'
                      }`}
                      style={{ color: 'var(--color-charcoal)' }}
                    >
                      $ USD
                    </button>
                    <button
                      onClick={() => {
                        changeCurrency('INR');
                        setIsCurrencyOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium rounded transition-colors ${
                        currency === 'INR' ? 'bg-black/5 font-semibold' : 'hover:bg-black/5'
                      }`}
                      style={{ color: 'var(--color-charcoal)' }}
                    >
                      ₹ INR
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setIsSearchOpen(true)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${
                scrolled ? 'hover:bg-black/5' : 'hover:bg-white/10'
              }`}
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIsWishlistOpen(true)}
              className={`hidden sm:flex w-10 h-10 items-center justify-center rounded-full transition-colors duration-300 relative ${
                scrolled ? 'hover:bg-black/5' : 'hover:bg-white/10'
              }`}
              aria-label="Wishlist"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] font-medium flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 relative ${
                scrolled ? 'hover:bg-black/5' : 'hover:bg-white/10'
              }`}
              aria-label="Cart"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] font-medium flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={handleAccountClick}
              className={`hidden sm:flex w-10 h-10 items-center justify-center rounded-full transition-colors duration-300 ${
                scrolled ? 'hover:bg-black/5' : 'hover:bg-white/10'
              }`}
              aria-label="Account"
            >
              <User size={20} strokeWidth={1.5} />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${
                scrolled ? 'hover:bg-black/5' : 'hover:bg-white/10'
              }`}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-fade-in lg:hidden"
          style={{ backgroundColor: 'var(--color-charcoal)' }}
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center"
            style={{ color: 'var(--color-cream)' }}
          >
            <X size={24} />
          </button>
          <div className="flex flex-col items-center gap-8">
            {navCategories.map((cat, i) => (
              <button
                key={cat}
                onClick={() => scrollToSection(getSectionId(cat))}
                className="heading-1 text-3xl animate-fade-in-up"
                style={{
                  color: 'var(--color-cream)',
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="absolute bottom-12 flex items-center gap-6" style={{ color: 'var(--color-muted)' }}>
            <button onClick={() => { setIsSearchOpen(true); setMobileMenuOpen(false); }}>
              <Search size={20} />
            </button>
            <button onClick={() => { setIsWishlistOpen(true); setMobileMenuOpen(false); }}>
              <Heart size={20} />
            </button>
            <button onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }}>
              <ShoppingBag size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
