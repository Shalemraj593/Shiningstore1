export default function MobileHero() {
  return (
    <div className="relative w-full h-[480px] overflow-hidden flex items-end">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=800&q=80"
        alt="Premium Beauty"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to top, rgba(26,26,26,0.9) 0%, rgba(26,26,26,0.3) 60%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-20 w-full p-6 text-white text-center flex flex-col items-center">
        <span 
          className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2"
          style={{ color: 'var(--color-accent)' }}
        >
          The New Era of Beauty
        </span>
        <h1 className="text-4xl font-light tracking-tight mb-3 leading-none font-serif">
          Shining <span className="italic" style={{ color: 'var(--color-accent)' }}>Sheglam</span>
        </h1>
        <p className="text-xs text-neutral-300 max-w-[280px] leading-relaxed mb-6 font-normal">
          Discover the premium makeup collection. Unveil your true radiance.
        </p>
        <a
          href="category.html?cat=beauty"
          className="px-6 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-transform active:scale-95 shadow-md"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-charcoal)' }}
        >
          Explore Collection
        </a>
      </div>
    </div>
  );
}
