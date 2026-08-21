import React from 'react';

interface AdBannerProps {
  adUnitId: string;
  onClose?: () => void;
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ adUnitId, onClose, className = '' }) => {
  return (
    <div className={`relative w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center overflow-hidden shadow-sm ${className}`}>
      
      {/* Ad Placeholder Visuals */}
      <div className="flex flex-col items-center justify-center gap-2 w-full">
        <div className="flex items-center gap-2 mb-1">
            <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">AD</div>
            <span className="text-slate-400 text-xs font-medium">Google AdMob</span>
        </div>
        <div className="w-full h-24 bg-slate-950 rounded-lg border border-slate-800 border-dashed flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <p className="text-xs text-slate-500 font-medium">বিজ্ঞাপন এখানে দেখানো হবে</p>
        </div>
        <p className="text-[10px] text-slate-600 font-mono text-center break-all opacity-50 mt-1">
          ID: {adUnitId}
        </p>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-slate-500 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}
    </div>
  );
};

export default AdBanner;
