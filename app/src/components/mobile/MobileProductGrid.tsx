import { Heart, ShoppingBag } from 'lucide-react';
import { products } from '@/data/products';
import { useStore } from '@/hooks/useStore';

export default function MobileProductGrid() {
  const { addToCart, toggleWishlist, isInWishlist, formatPrice } = useStore();

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold uppercase tracking-wider" style={{ color: 'var(--color-charcoal)' }}>
          Trending Now
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => {
          const inWishlist = isInWishlist(product.id);

          return (
            <div
              key={product.id}
              className="rounded-xl overflow-hidden border flex flex-col bg-white relative"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {/* Image and Wishlist Overlay */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  onClick={() => window.location.href = `product.html?id=${product.id}`}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-350 active:scale-98"
                />

                {/* Badge */}
                {product.badge && (
                  <span
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider"
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
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-105"
                  style={{ color: inWishlist ? 'var(--color-accent)' : 'var(--color-charcoal)' }}
                  aria-label="Add to wishlist"
                >
                  <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>

                {/* Quick Add To Cart Button */}
                <button
                  onClick={() => addToCart(product)}
                  className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-md"
                  style={{ color: 'var(--color-charcoal)' }}
                  aria-label="Add to cart"
                >
                  <ShoppingBag size={14} />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                <div>
                  <p
                    className="text-[9px] tracking-wider uppercase mb-0.5"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {product.category}
                  </p>
                  <h3
                    onClick={() => window.location.href = `product.html?id=${product.id}`}
                    className="text-xs font-normal text-neutral-700 line-clamp-2 cursor-pointer hover:underline min-h-[32px] leading-tight"
                  >
                    {product.name}
                  </h3>
                </div>
                
                <div 
                  onClick={() => window.location.href = `product.html?id=${product.id}`}
                  className="flex items-baseline gap-1.5 cursor-pointer"
                >
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-charcoal)' }}>
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] line-through text-neutral-400">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
