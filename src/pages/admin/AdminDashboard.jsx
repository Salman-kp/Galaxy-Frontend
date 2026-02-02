import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Layers, 
  CheckCircle, 
  Clock, 
  CalendarDays, 
  Users
} from "lucide-react";
import api from "../../services/api";
import AdminStatCard from "../../components/admin/dashboard/AdminStatCard";
import AdminAnalyticsChart from "../../components/admin/dashboard/AdminAnalyticsChart";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("01");

  // Today's Events
  const [allEvents, setAllEvents] = useState([]);
  const [loadingToday, setLoadingToday] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard/summary").then((res) => setSummary(res.data));
    fetchTodayEvents();
  }, []);

  const fetchTodayEvents = async () => {
    setLoadingToday(true);
    try {
      const { data } = await api.get("/admin/events");
      setAllEvents(data || []);
    } catch (err) {
      console.error("Failed to fetch events for dashboard");
    } finally {
      setLoadingToday(false);
    }
  };

  useEffect(() => {
    api.get(`/admin/dashboard/charts/monthly?year=${selectedYear}`)
      .then((res) => setMonthly(res.data || []));
  }, [selectedYear]);

  useEffect(() => {
    api.get(`/admin/dashboard/charts/daily?year=${selectedYear}&month=${selectedMonth}`)
      .then((res) => setDaily(res.data || []));
  }, [selectedMonth, selectedYear]);

  // ✅ SAME LOGIC AS EVENT MANAGEMENT (ONGOING TAB)
  const today = new Date().toDateString();

  const todayEvents = allEvents.filter((event) => {
    const eventDate = new Date(event.date).toDateString();
    return event.status === "ongoing" || eventDate === today;
  });

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
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 min-h-screen overflow-x-hidden px-8 pt-8">
      
      {/* Header */}
      <div className="pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Monitoring Galaxy Events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <AdminStatCard title="Total Events" value={summary?.total_events} icon={Layers} />
        <AdminStatCard title="Completed" value={summary?.completed_events} icon={CheckCircle} />
        <AdminStatCard title="Ongoing" value={summary?.ongoing_events} icon={Clock} />
        <AdminStatCard title="Upcoming" value={summary?.upcoming_events} icon={CalendarDays} />
        <AdminStatCard title="Total Users" value={summary?.total_users} icon={Users} />
      </div>

      {/* Charts (UNCHANGED) */}
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
          key={selectedMonth}
          title="Daily Distribution"
          subtitle={`Viewing ${selectedYear}-${selectedMonth}`}
          data={fullDaily}
          labelKey="label"
          valueKey="count"
        />
      </div>

      {/* TODAY'S EVENTS TABLE */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Today's Event List</h2>
          <p className="text-xs text-slate-500 font-medium">
            Ongoing events or events scheduled for today ({today})
          </p>
        </div>

       <div className="bg-[#0f1115] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-white/10 bg-white/[0.03]">
          {["Event Name", "Time", "Type", "Workers", "Status", "Actions"].map((head, i) => (
            <th
              key={head}
              className={`px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest ${
                i === 3 ? "text-center" : i === 5 ? "text-right" : ""
              }`}
            >
              {head}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="divide-y divide-white/5">
        {loadingToday ? (
          <tr>
            <td colSpan="6" className="py-14 text-center text-gray-500 text-sm">
              Loading today’s schedule...
            </td>
          </tr>
        ) : todayEvents.length === 0 ? (
          <tr>
            <td colSpan="6" className="py-14 text-center text-gray-500 text-sm italic">
              No ongoing or today’s events found.
            </td>
          </tr>
        ) : (
          todayEvents.map((event) => (
            <tr
              key={event.id}
              className="hover:bg-white/[0.04] transition-colors group"
            >
              <td className="px-6 py-5 text-sm font-bold text-white">
                {event.name}
              </td>

              <td className="px-6 py-5 text-xs font-semibold text-gray-300">
                <Clock size={14} className="inline mr-1 text-gray-500" />
                {event.time_slot}
              </td>

              <td className="px-6 py-5 text-xs font-medium text-gray-400 capitalize">
                {event.work_type}
              </td>

              <td className="px-6 py-5 text-center">
                <span className="bg-white/5 text-gray-200 px-2.5 py-1 rounded-lg text-xs font-black border border-white/10">
                  {event.required_captains +
                    event.required_sub_captains +
                    event.required_main_boys +
                    event.required_juniors}
                </span>
              </td>

              <td className="px-6 py-5">
                <StatusBadge status={event.status} />
              </td>

              <td className="px-6 py-5 text-right">
                <button
                  onClick={() =>
                    navigate(`/admin/events/${event.id}`, {
                      state: { from: "dashboard" },
                    })
                  }
                  className="bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-[11px] font-black hover:border-blue-500 hover:text-blue-400 transition-all shadow-sm"
                >
                  Details
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ongoing: "bg-amber-50 text-amber-600 border-amber-100",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
    upcoming: "bg-blue-50 text-blue-600 border-blue-100"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status] || styles.upcoming}`}>
      {status}
    </span>
  );
}