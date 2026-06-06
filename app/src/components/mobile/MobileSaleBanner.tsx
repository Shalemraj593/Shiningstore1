export default function MobileSaleBanner() {
  return (
    <a
      href="category.html?cat=sale"
      className="mx-4 mb-6 rounded-xl overflow-hidden border flex shadow-sm hover:opacity-95 transition-all"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      {/* Discount Box */}
      <div 
        className="w-24 text-white flex flex-col justify-center items-center p-3 text-center flex-shrink-0"
        style={{ backgroundColor: 'var(--color-charcoal)' }}
      >
        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">Up to</span>
        <h3 className="text-2xl font-bold leading-none font-mono my-1" style={{ color: 'var(--color-accent)' }}>
          80%
        </h3>
        <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'var(--color-accent)' }}>Off</span>
      </div>

      {/* Product Thumbnails */}
      <div className="flex-1 flex gap-3 p-3 overflow-x-auto items-center justify-around">
        <div className="w-12 h-14 rounded-md overflow-hidden bg-neutral-100 border" style={{ borderColor: 'var(--color-border)' }}>
          <img
            src="https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&w=200&q=80"
            alt="Promo Product 1"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-12 h-14 rounded-md overflow-hidden bg-neutral-100 border" style={{ borderColor: 'var(--color-border)' }}>
          <img
            src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=200&q=80"
            alt="Promo Product 2"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-12 h-14 rounded-md overflow-hidden bg-neutral-100 border" style={{ borderColor: 'var(--color-border)' }}>
          <img
            src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=200&q=80"
            alt="Promo Product 3"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </a>
  );
}
