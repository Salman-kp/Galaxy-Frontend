import React, { useEffect, useState } from "react";
import { Layers, CheckCircle, Clock, CalendarDays, Users } from "lucide-react";
import api from "../../services/api";
import AdminStatCard from "../../components/admin/dashboard/AdminStatCard";
import AdminAnalyticsChart from "../../components/admin/dashboard/AdminAnalyticsChart";

export default function AdminDashboard() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("01");

  useEffect(() => {
    api.get("/api/admin/dashboard/summary").then((res) => setSummary(res.data));
  }, []);

  useEffect(() => {
    api.get(`/api/admin/dashboard/charts/monthly?year=${selectedYear}`).then((res) => {
      setMonthly(res.data || []);
    });
  }, [selectedYear]);

  useEffect(() => {
    api.get(`/api/admin/dashboard/charts/daily?year=${selectedYear}&month=${selectedMonth}`).then((res) => {
      setDaily(res.data || []);
    });
  }, [selectedMonth, selectedYear]);

  const fullMonthly = Array.from({ length: 12 }, (_, i) => {
    const mLabel = (i + 1).toString().padStart(2, "0");
    const found = monthly.find(m => m.month.split("-")[1] === mLabel);
    return { label: mLabel, count: found ? found.count : 0 };
  });

  const daysInMonth = new Date(selectedYear, parseInt(selectedMonth), 0).getDate();
  const fullDaily = Array.from({ length: daysInMonth }, (_, i) => {
    const dLabel = (i + 1).toString().padStart(2, "0");
    const found = daily.find(d => d.date.split("-")[2] === dLabel);
    return { label: dLabel, count: found ? found.count : 0 };
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 bg-gray-200 min-h-screen overflow-x-hidden">
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-black tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium italic">Monitoring Galaxy Events</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <AdminStatCard title="Total Events" value={summary?.total_events} icon={Layers} />
        <AdminStatCard title="Completed" value={summary?.completed_events} icon={CheckCircle} />
        <AdminStatCard title="Ongoing" value={summary?.ongoing_events} icon={Clock} />
        <AdminStatCard title="Upcoming" value={summary?.upcoming_events} icon={CalendarDays} />
        <AdminStatCard title="Total Users" value={summary?.total_users} icon={Users} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <AdminAnalyticsChart 
          title="Monthly Volume"
          subtitle="Click a bar to see daily stats"
          data={fullMonthly}
          labelKey="label"
          valueKey="count"
          onBarClick={(item) => setSelectedMonth(item.label)}
          yearSelector={
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border-2 border-gray-200 text-black text-xs font-bold py-1 px-3 rounded outline-none cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          }
        />

        <AdminAnalyticsChart 
          key={selectedMonth} // Forces refresh when month changes
          title="Daily Distribution"
          subtitle={`Viewing ${selectedYear}-${selectedMonth}`}
          data={fullDaily}
          labelKey="label"
          valueKey="count"
        />
      </div>
    </div>
  );
}