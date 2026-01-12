import React from "react";

export default function AdminAnalyticsChart({ title, subtitle, data, labelKey, valueKey, onBarClick, yearSelector }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
<div className="flex justify-between items-end mb-10 group">
  <div className="flex gap-5 items-center">
    <div className="w-1.5 h-10 bg-gradient-to-b from-black to-gray-300 rounded-full" />
    
    <div className="flex flex-col">
      <h2 className="text-2xl font-black text-balance tracking-tighter leading-none mb-1">
        {title}
      </h2>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] leading-none">
        {subtitle}
      </p>
    </div>
  </div>

  {yearSelector && (
    <div className="flex flex-col items-end gap-1.5">
      <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.1em]">
        Filter Context
      </span>
      <div className="bg-white border-b-2 border-black px-1 py-0.5 transition-all focus-within:border-blue-500">
        <div className="text-[11px] font-bold text-black uppercase">
          {yearSelector}
        </div>
      </div>
    </div>
  )}
</div>

      {data.length === 0 ? (
        <div className="mt-6 h-44 flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
          No data available
        </div>
      ) : (
        <div className="mt-auto flex items-end gap-[2px] h-48 w-full border-b border-gray-100 pb-8">
          {data.map((item, idx) => {
            const heightPx = Math.max(Math.round((item[valueKey] / max) * 140), 4);

            return (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 min-w-0 cursor-pointer group relative"
                onClick={() => onBarClick?.(item)}
              >
                {/* TOOLTIP ON HOVER */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                  <div className="bg-black text-white text-[9px] py-1 px-2 rounded flex flex-col items-center shadow-xl">
                    <span className="font-black whitespace-nowrap">Day {item[labelKey]}</span>
                    <span className="text-blue-400 font-bold">{item[valueKey]} Events</span>
                  </div>
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-black mx-auto" />
                </div>

                {/* VISIBLE COUNT ABOVE BAR (OPTIONAL: Show only if > 0 to keep clean) */}
                {item[valueKey] >= 0 && (
                  <span className="absolute -top-5 text-[8px] font-bold text-blue-600">
                    {item[valueKey]}
                  </span>
                )}

                {/* THE BAR */}
                <div
                  className="w-full rounded-t-[2px] bg-blue-500 group-hover:bg-black transition-all duration-200"
                  style={{ height: `${heightPx}px` }}
                />
                
                {/* UPDATED LABELS: Rotated or every 2nd day to ensure dates are mentioned */}
                <div className="absolute -bottom-7 flex flex-col items-center">
                   <span className={`text-[8px] font-bold text-black ${data.length > 12 ? 'scale-90' : ''}`}>
                    {/* Show every day if it's monthly, show every 2nd or 3rd if daily to avoid overlap */}
                    {data.length > 12 
                      ? (idx % 2 === 0 || idx === data.length - 1 ? item[labelKey] : "") 
                      : item[labelKey]
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}