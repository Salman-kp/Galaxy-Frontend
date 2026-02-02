import React from "react";

const iconColorMap = {
  "Total Events": "text-indigo-500",
  "Completed": "text-emerald-500",
  "Ongoing": "text-amber-500",
  "Upcoming": "text-blue-500",
  "Total Users": "text-purple-500",
};

const iconBgMap = {
  "Total Events": "bg-indigo-50",
  "Completed": "bg-emerald-50",
  "Ongoing": "bg-amber-50",
  "Upcoming": "bg-blue-50",
  "Total Users": "bg-purple-50",
};

export default function AdminStatCard({ title, value, icon: Icon }) {
  const iconColor = iconColorMap[title] || "text-gray-400";
  const iconBg = iconBgMap[title] || "bg-gray-50";

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:border-blue-200 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div
          className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} transition-colors`}
        >
          <Icon size={22} strokeWidth={1.5} />
        </div>

        <div>
          <p className="text-[13px] font-medium text-gray-400 mb-0.5">
            {title}
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {value ?? "0"}
          </h2>
        </div>
      </div>
    </div>
  );
}