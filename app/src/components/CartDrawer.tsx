import { X, Minus, Plus } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

export default function CartDrawer() {
  const {
    cart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    formatPrice,
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ backgroundColor: 'var(--color-overlay)' }}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] flex flex-col animate-slide-in"
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
            Shopping Bag
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBagEmpty />
              <p
                className="text-base font-medium mt-4 mb-2"
                style={{ color: 'var(--color-charcoal)' }}
              >
                Your cart is empty
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-sm transition-colors hover:opacity-70"
                style={{ color: 'var(--color-accent)' }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  {/* Thumbnail */}
                  <div
                    className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
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
                      className="text-sm font-normal truncate mb-1"
                      style={{ color: 'var(--color-charcoal)' }}
                    >
                      {item.name}
                    </h3>
                    <p
                      className="text-sm font-medium mb-2"
                      style={{ color: 'var(--color-charcoal)' }}
                    >
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded border transition-colors hover:bg-black/5"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        className="text-sm w-6 text-center"
                        style={{ color: 'var(--color-charcoal)' }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded border transition-colors hover:bg-black/5"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="self-start p-1 hover:opacity-70 transition-opacity"
                  >
                    <X size={14} style={{ color: 'var(--color-muted)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div
            className="p-6"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-sm"
                style={{ color: 'var(--color-muted)' }}
              >
                Subtotal ({cartCount} items)
              </span>
              <span
                className="text-lg font-medium"
                style={{ color: 'var(--color-charcoal)' }}
              >
                {formatPrice(cartTotal)}
              </span>
            </div>
            <button
              onClick={() => {
                const session = localStorage.getItem('shiningstore_session');
                if (!session) {
                  alert('Please login or sign up to proceed to checkout');
                  window.location.href = 'account.html';
                } else {
                  window.location.href = 'checkout.html';
                }
              }}
              className="w-full h-[52px] rounded-lg text-sm font-medium tracking-wider uppercase transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--color-charcoal)',
                color: 'var(--color-cream)',
              }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function ShoppingBagEmpty() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      style={{ color: 'var(--color-border)' }}
    >
      <path
        d="M20 16V12C20 8.686 22.686 6 26 6H38C41.314 6 44 8.686 44 12V16M52 16L48 52C48 54.209 46.209 56 44 56H20C17.791 56 16 54.209 16 52L12 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 24V42M32 24V42M40 24V42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
