import { Home } from 'lucide-react';

const topCategories = [
  {
    name: 'Home',
    href: 'index.html',
    icon: <Home size={18} strokeWidth={1.5} />,
  },
  {
    name: 'Offers',
    href: 'category.html?cat=sale',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=100&q=80',
  },
  {
    name: 'Fresh Fits',
    href: 'category.html?cat=new',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80',
  },
  {
    name: 'Women',
    href: 'category.html?cat=fashion&q=women',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=100&q=80',
  },
  {
    name: 'Men',
    href: 'category.html?cat=fashion&q=men',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=100&q=80',
  },
  {
    name: 'Kids',
    href: 'category.html?cat=fashion&q=kids',
    image: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?auto=format&fit=crop&w=100&q=80',
  },
];

export default function MobileTopCategories() {
  return (
    <div 
      className="w-full overflow-x-auto flex gap-4 px-4 py-3 border-b scrollbar-none"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-cream)' }}
    >
      {topCategories.map((cat, i) => (
        <a
          key={i}
          href={cat.href}
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
        >
          <div 
            className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white border shadow-sm transition-transform active:scale-95"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {cat.icon ? (
              <span style={{ color: 'var(--color-charcoal)' }}>{cat.icon}</span>
            ) : (
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <span 
            className="text-[10px] font-semibold tracking-wide uppercase"
            style={{ color: 'var(--color-charcoal)' }}
          >
            {cat.name}
          </span>
        </a>
      ))}
    </div>
  );
}
