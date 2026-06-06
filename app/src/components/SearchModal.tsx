import { useEffect, useRef, useState } from 'react';
import { X, Search } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

const trendingTags = ['Summer Dress', 'Wireless Headphones', 'Pet Bed', 'Cardigan', 'Sandals'];

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, setSearchQuery, searchResults } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState('');

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center pt-20 sm:pt-28 animate-fade-in"
      style={{ backgroundColor: 'var(--color-cream)' }}
    >
      {/* Close Button */}
      <button
        onClick={() => setIsSearchOpen(false)}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
      >
        <X size={20} />
      </button>

      {/* Search Input */}
      <div
        className="w-full max-w-2xl px-6 animate-fade-in-up"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="relative">
          <Search
            size={20}
            className="absolute left-0 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-muted)' }}
          />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full text-3xl sm:text-4xl font-light outline-none pb-4 pl-8 bg-transparent"
            style={{
              color: 'var(--color-charcoal)',
              borderBottom: '2px solid var(--color-charcoal)',
            }}
          />
        </div>
      </div>

      {/* Search Results */}
      {localQuery.trim().length > 0 && (
        <div className="w-full max-w-2xl px-6 mt-8 overflow-y-auto max-h-[50vh]">
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setIsSearchOpen(false);
                    window.location.href = `product.html?id=${product.id}`;
                  }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-black/5 text-left"
                >
                  <div
                    className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-normal truncate"
                      style={{ color: 'var(--color-charcoal)' }}
                    >
                      {product.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      {product.category}
                    </p>
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-charcoal)' }}
                  >
                    ₹{product.price.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm" style={{ color: 'var(--color-muted)' }}>
              No products found for &ldquo;{localQuery}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Trending Tags */}
      {localQuery.trim().length === 0 && (
        <div className="w-full max-w-2xl px-6 mt-12">
          <p
            className="text-caption mb-4"
            style={{ color: 'var(--color-muted)' }}
          >
            Trending
          </p>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setLocalQuery(tag);
                  setSearchQuery(tag);
                }}
                className="px-4 py-2 rounded-full text-sm transition-colors hover:opacity-70"
                style={{
                  backgroundColor: 'var(--color-surface-warm)',
                  color: 'var(--color-charcoal)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
