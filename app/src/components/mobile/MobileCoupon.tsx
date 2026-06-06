export default function MobileCoupon() {
  const handleRedirect = () => {
    window.location.href = 'seller-register.html';
  };

  return (
    <div 
      onClick={handleRedirect}
      className="mx-4 my-6 p-5 rounded-2xl border flex flex-col gap-3 cursor-pointer shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{ 
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)', 
        borderColor: 'rgba(212, 168, 83, 0.4)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(212, 168, 83, 0.15)', border: '1px solid rgba(212, 168, 83, 0.3)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M30 7H30"/></svg>
        </div>
        <div className="flex-1">
          <span className="text-[9px] uppercase tracking-[0.15em] font-semibold" style={{ color: '#D4A853' }}>
            Partnership Opportunity
          </span>
          <h3 className="text-base font-semibold text-white mt-0.5 leading-tight">
            Become a Seller
          </h3>
          <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#CCCCCC' }}>
            Reach over 15K active shoppers globally. Industry-lowest 5% commission.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <span className="text-[10px]" style={{ color: '#999999' }}>Set up your store in minutes</span>
        <span className="text-xs font-semibold flex items-center gap-1 transition-all duration-300" style={{ color: '#D4A853' }}>
          Start Selling <span className="transform translate-x-0 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </div>
  );
}
