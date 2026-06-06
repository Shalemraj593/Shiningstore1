const categories = [
  {
    name: 'Fashion',
    href: 'category.html?cat=fashion',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Shoes',
    href: 'category.html?cat=shoes',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Tech',
    href: 'category.html?cat=electronics',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Pets',
    href: 'category.html?cat=pets',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Accessories',
    href: 'category.html?cat=accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&q=80',
  },
];

export default function MobileSquareCategories() {
  return (
    <div className="w-full overflow-x-auto flex gap-4 px-4 pb-4 scrollbar-none">
      {categories.map((cat, i) => (
        <a
          key={i}
          href={cat.href}
          className="flex flex-col items-center gap-2 flex-shrink-0 w-16"
        >
          <div 
            className="w-16 h-16 rounded-full overflow-hidden border shadow-sm transition-transform active:scale-95 bg-white"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span 
            className="text-[10px] font-semibold text-center truncate w-full"
            style={{ color: 'var(--color-charcoal)' }}
          >
            {cat.name}
          </span>
        </a>
      ))}
    </div>
  );
}
