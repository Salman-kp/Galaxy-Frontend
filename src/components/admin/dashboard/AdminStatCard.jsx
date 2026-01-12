import React from "react";

export default function AdminStatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:border-blue-200 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          <Icon size={22} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[13px] font-medium text-gray-400 mb-0.5">{title}</p>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {value ?? "0"}
          </h2>
        </div>
      </div>
    </div>
  );
}