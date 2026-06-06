import { Home, List, Shirt, ShoppingBag, User } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

export default function MobileBottomNav() {
  const { cartCount, setIsCartOpen } = useStore();

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around z-40 pb-safe shadow-inner bg-white"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <a
        href="#"
        onClick={scrollToTop}
        className="flex flex-col items-center gap-1 text-[10px] font-semibold text-neutral-800 transition-colors"
      >
        <Home size={20} strokeWidth={1.5} />
        <span>Home</span>
      </a>

      <a
        href="categories.html"
        className="flex flex-col items-center gap-1 text-[10px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
      >
        <List size={20} strokeWidth={1.5} />
        <span>Category</span>
      </a>

      <a
        href="category.html?cat=new"
        className="flex flex-col items-center gap-1 text-[10px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
      >
        <Shirt size={20} strokeWidth={1.5} />
        <span>New</span>
      </a>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setIsCartOpen(true);
        }}
        className="flex flex-col items-center gap-1 text-[10px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors relative"
      >
        <ShoppingBag size={20} strokeWidth={1.5} />
        <span>Bag</span>
        {cartCount > 0 && (
          <span
            className="absolute top-0 right-1/2 translate-x-4 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {cartCount}
          </span>
        )}
      </a>

      <a
        href="account.html"
        className="flex flex-col items-center gap-1 text-[10px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
      >
        <User size={20} strokeWidth={1.5} />
        <span>Me</span>
      </a>
    </nav>
  );
}
