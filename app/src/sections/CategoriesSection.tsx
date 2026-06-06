import { categories } from '@/data/products';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function CategoriesSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="categories"
      ref={ref}
      className="w-full py-20 lg:py-24"
      style={{ backgroundColor: 'var(--color-cream)' }}
    >
      <div className="section-padding">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <h2
            className="heading-1 text-3xl sm:text-4xl"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Shop by Category
          </h2>
          <button
            onClick={() => window.location.href = 'category.html'}
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: 'var(--color-accent)' }}
          >
            View All &rarr;
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {categories.map((cat, i) => {
            const getCategoryQuery = (name: string) => {
              const map: Record<string, string> = {
                'Fashion': 'fashion',
                'Shoes': 'shoes',
                'Electronics': 'electronics',
                'Pet Essentials': 'pets',
                'Accessories': 'accessories',
              };
              return map[name] || name.toLowerCase();
            };

            return (
              <div
                key={cat.id}
                onClick={() => window.location.href = `category.html?cat=${getCategoryQuery(cat.name)}`}
                className={`category-card relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(transparent 40%, rgba(26,26,26,0.7))',
                  }}
                />
                <h3
                  className="absolute bottom-0 left-0 right-0 p-6 text-lg font-medium text-center"
                  style={{ color: 'var(--color-cream)' }}
                >
                  {cat.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
