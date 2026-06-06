import { Mail, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

export default function MobileHeader() {
  const { cartCount, setIsCartOpen, setIsWishlistOpen, setIsSearchOpen } = useStore();

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-white/95 backdrop-blur-md border-b px-4 flex items-center justify-between gap-3" style={{ borderColor: 'var(--color-border)' }}>
      <button 
        aria-label="Mail"
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
        style={{ color: 'var(--color-charcoal)' }}
      >
        <Mail size={20} strokeWidth={1.5} />
      </button>

      <button
        onClick={() => setIsSearchOpen(true)}
        className="flex-1 h-9 rounded-lg bg-neutral-100 flex items-center gap-2 px-3 text-xs font-normal transition-all hover:bg-neutral-200/70 text-neutral-500"
      >
        <span>Search by product</span>
      </button>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsWishlistOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors relative"
          style={{ color: 'var(--color-charcoal)' }}
          aria-label="Wishlist"
        >
          <Heart size={20} strokeWidth={1.5} />
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 relative"
          style={{ color: 'var(--color-charcoal)' }}
          aria-label="Cart"
        >
          <ShoppingBag size={20} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
