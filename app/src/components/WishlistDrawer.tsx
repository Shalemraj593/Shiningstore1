import { X, ShoppingBag } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

export default function WishlistDrawer() {
  const {
    wishlist,
    wishlistCount,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    addToCart,
  } = useStore();

  if (!isWishlistOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ backgroundColor: 'var(--color-overlay)' }}
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] flex flex-col"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          animation: 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2
            className="text-lg font-medium"
            style={{ color: 'var(--color-charcoal)' }}
          >
            My Wishlist ({wishlistCount})
          </h2>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <HeartEmpty />
              <p
                className="text-base font-medium mt-4 mb-2"
                style={{ color: 'var(--color-charcoal)' }}
              >
                Your wishlist is empty
              </p>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--color-muted)' }}
              >
                Tap the heart icon on products you love.
              </p>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="text-sm transition-colors hover:opacity-70"
                style={{ color: 'var(--color-accent)' }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      setIsWishlistOpen(false);
                      window.location.href = `product.html?id=${item.id}`;
                    }}
                    className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => {
                        setIsWishlistOpen(false);
                        window.location.href = `product.html?id=${item.id}`;
                      }}
                      className="text-sm font-normal truncate mb-1 cursor-pointer hover:underline"
                      style={{ color: 'var(--color-charcoal)' }}
                    >
                      {item.name}
                    </h3>
                    <p
                      onClick={() => {
                        setIsWishlistOpen(false);
                        window.location.href = `product.html?id=${item.id}`;
                      }}
                      className="text-sm font-medium mb-3 cursor-pointer"
                      style={{ color: 'var(--color-charcoal)' }}
                    >
                      ₹{item.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          addToCart(item);
                          toggleWishlist(item);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-colors"
                        style={{
                          backgroundColor: 'var(--color-charcoal)',
                          color: 'var(--color-cream)',
                        }}
                      >
                        <ShoppingBag size={12} />
                        Move to Cart
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => toggleWishlist(item)}
                    className="self-start p-1 hover:opacity-70 transition-opacity"
                  >
                    <X size={14} style={{ color: 'var(--color-muted)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function HeartEmpty() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      style={{ color: 'var(--color-border)' }}
    >
      <path
        d="M32 56L28.36 52.78C14.88 40.68 6 32.78 6 23C6 15.28 12.08 9.2 19.8 9.2C24.28 9.2 28.56 11.34 31.32 14.76C32.68 16.48 33.32 16.48 34.68 14.76C37.44 11.34 41.72 9.2 46.2 9.2C53.92 9.2 60 15.28 60 23C60 32.78 51.12 40.68 37.64 52.78L34 56H32Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
