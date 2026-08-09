export default function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`relative flex items-center justify-center rounded-[14px] w-10 h-10 ${light ? 'bg-white text-[#0B1F18]' : 'bg-[#0B1F18] text-white'} transition-colors`}> 
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 28C16 28 6 22.5 6 13.5C6 8.25 9.5 5 14 5C15.9 5 16 6.5 16 6.5C16 6.5 16.1 5 18 5C22.5 5 26 8.25 26 13.5C26 22.5 16 28 16 28Z" fill="currentColor" fillOpacity="0.14" />
          <path d="M16 26.2C13.2 24.5 8 20.2 8 13.7C8 9.3 10.7 7 14 7C15.2 7 16.1 7.9 16.3 8.6C16.43 9.15 17.57 9.15 17.7 8.6C17.9 7.9 18.8 7 20 7C23.3 7 26 9.3 26 13.7C26 20.2 20.8 24.5 16 26.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11.2 14.2C11.2 14.2 12.8 16.8 16 16.8C19.2 16.8 20.8 14.2 20.8 14.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="16" cy="11" r="1.1" fill="currentColor" />
        </svg>
      </div>
      {!compact && (
        <div className="leading-none">
          <div className={`font-[700] tracking-[-0.02em] text-[19px] ${light ? 'text-white' : 'text-[#0B1F18]'}`} style={{ fontFamily: 'General Sans, Instrument Sans, sans-serif' }}>LIDDAWI</div>
          <div className={`font-[500] text-[10px] tracking-[0.28em] uppercase -mt-0.5 ${light ? 'text-white/70' : 'text-[#0B1F18]/60'}`}>CLINIC • KUWAIT</div>
        </div>
      )}
    </div>
  );
}
