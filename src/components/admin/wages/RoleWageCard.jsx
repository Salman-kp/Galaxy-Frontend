import React, { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

export default function RoleWageCard({ item, onUpdate, isUpdating }) {
  const [value, setValue] = useState(item.wage);

  useEffect(() => {
    setValue(item.wage);
  }, [item.wage]);

  const displayRole = item.role.replace("_", " ").toUpperCase();

  const handleUpdate = () => {
    const numericWage = parseInt(value, 10);
    if (isNaN(numericWage) || numericWage < 0) return;
    onUpdate(item.role, numericWage);
  };

  // Check if value actually changed to prevent redundant API calls
  const isUnchanged = parseInt(value) === item.wage;

  return (
    <div className="bg-white border border-slate-300 shadow-sm flex flex-col h-full hover:border-slate-400 transition-colors">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">
            {displayRole}
          </h3>
          <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 border border-slate-200 uppercase tracking-tighter">
            REF-{item.id}
          </span>
        </div>

        <div className="space-y-2 mt-6">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Base Payout Rate
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pr-2 border-r border-slate-200">
              <span className="text-[10px] font-black text-slate-400">INR</span>
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isUpdating}
              className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 text-xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleUpdate}
        disabled={isUpdating || isUnchanged}
        className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all"
      >
        {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {isUpdating ? "Authorizing..." : isUnchanged ? "Saved" : "Execute Update"}
      </button>
    </div>
  );
}