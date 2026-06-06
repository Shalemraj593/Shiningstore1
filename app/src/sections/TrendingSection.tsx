import { useRef } from 'react';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { products } from '../data/products';
import { useStore } from '@/hooks/useStore';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { Product } from '../data/products';

function ProductCard({ product, index, isVisible }: { product: Product; index: number; isVisible: boolean }) {
  const { addToCart, toggleWishlist, isInWishlist, formatPrice } = useStore();
  const inWishlist = isInWishlist(product.id);

  return (
    <div
      className={`product-card flex-shrink-0 w-[260px] sm:w-[280px] ${
        isVisible ? 'animate-slide-in' : 'opacity-0'
      }`}
      style={{
        animationDelay: `${index * 0.08}s`,
        animation: isVisible ? `slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s forwards` : 'none',
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3">
        <img
          src={product.image}
          alt={product.name}
          onClick={() => window.location.href = `product.html?id=${product.id}`}
          className="w-full h-full object-cover transition-transform duration-400 hover:scale-[1.03] cursor-pointer"
        />
        
        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase"
            style={{
              backgroundColor: product.badge === 'New' ? 'var(--color-accent)' : 'var(--color-charcoal)',
              color: product.badge === 'New' ? 'var(--color-charcoal)' : 'var(--color-cream)',
            }}
          >
            {product.badge}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-105"
          style={{ color: inWishlist ? 'var(--color-accent)' : 'var(--color-charcoal)' }}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Add Button */}
        <div className="absolute bottom-3 left-3 right-3 quick-actions">
          <button
            onClick={() => addToCart(product)}
            className="w-full py-2.5 rounded-lg text-xs font-semibold uppercase bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ color: 'var(--color-charcoal)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <p
        className="text-[10px] tracking-wider uppercase mb-1"
        style={{ color: 'var(--color-muted)' }}
      >
        {product.category}
      </p>
      <h3
        onClick={() => window.location.href = `product.html?id=${product.id}`}
        className="text-sm font-normal truncate mb-1 hover:opacity-70 cursor-pointer"
        style={{ color: 'var(--color-charcoal)' }}
      >
        {product.name}
      </h3>
      <div 
        onClick={() => window.location.href = `product.html?id=${product.id}`}
        className="flex items-center gap-2 cursor-pointer"
      >
        <span
          className="text-base font-medium"
          style={{ color: 'var(--color-charcoal)' }}
        >
          {formatPrice(product.price)}
        </span>
        {product.originalPrice && (
          <span
            className="text-sm line-through"
            style={{ color: 'var(--color-muted)' }}
          >
            {formatPrice(product.originalPrice)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TrendingSection() {
  const { ref, isVisible } = useScrollAnimation(0.15);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="trending"
      ref={ref}
      className="w-full py-20 lg:py-24"
      style={{ backgroundColor: 'var(--color-surface-warm)' }}
    >
      <div className="section-padding">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <h2
            className="heading-1 text-3xl sm:text-4xl"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Trending Now
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
              style={{ backgroundColor: 'var(--color-charcoal)', color: 'var(--color-cream)' }}
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
              style={{ backgroundColor: 'var(--color-charcoal)', color: 'var(--color-cream)' }}
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="carousel-container flex gap-6 overflow-x-auto pl-6 sm:pl-8 lg:pl-16 xl:pl-24 pr-6 pb-4"
      >
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            index={i}
            isVisible={isVisible}
          />
        ))}
      </div>
    </section>
  );
}
