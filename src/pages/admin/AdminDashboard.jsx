import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Layers, 
  CheckCircle, 
  Clock, 
  CalendarDays, 
  Users,
  Calendar as CalendarIcon
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
  
  // Today's Events State
  const [allEvents, setAllEvents] = useState([]);
  const [todayFilter, setTodayFilter] = useState("All");
  const [loadingToday, setLoadingToday] = useState(true);

  const filterTabs = ["All", "Ongoing", "Upcoming", "Completed", "Cancelled"];

  useEffect(() => {
    // Fetch Summary Stats
    api.get("/api/admin/dashboard/summary").then((res) => setSummary(res.data));
    
    // Fetch Today's Events (using the general events endpoint)
    fetchTodayEvents();
  }, []);

  const fetchTodayEvents = async () => {
    setLoadingToday(true);
    try {
      const { data } = await api.get("/api/admin/events");
      setAllEvents(data || []);
    } catch (err) {
      console.error("Failed to fetch events for dashboard");
    } finally {
      setLoadingToday(false);
    }
  };

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

  // Logic to filter events for "Today" and status
  const todayDateString = new Date().toDateString();
  const filteredTodayEvents = allEvents.filter((event) => {
    const isToday = new Date(event.date).toDateString() === todayDateString;
    if (!isToday) return false;

    if (todayFilter === "All") return true;
    return event.status.toLowerCase() === todayFilter.toLowerCase();
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
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12  min-h-screen overflow-x-hidden px-8 pt-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Monitoring Galaxy Events</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <AdminStatCard title="Total Events" value={summary?.total_events} icon={Layers} />
        <AdminStatCard title="Completed" value={summary?.completed_events} icon={CheckCircle} />
        <AdminStatCard title="Ongoing" value={summary?.ongoing_events} icon={Clock} />
        <AdminStatCard title="Upcoming" value={summary?.upcoming_events} icon={CalendarDays} />
        <AdminStatCard title="Total Users" value={summary?.total_users} icon={Users} />
      </div>

      {/* Analytics Charts */}
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

      {/* TODAY'S EVENTS LIST SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Today's Event List</h2>
            <p className="text-xs text-slate-500 font-medium">Events scheduled for {todayDateString}</p>
          </div>
          
          {/* Filters */}
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setTodayFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  todayFilter === tab 
                  ? "bg-slate-900 text-white" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container - Same design as Event Management */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20">
                  {["Event Name", "Time", "Type", "Workers", "Status", "Actions"].map((head, i) => (
                    <th key={head} className={`px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest ${i === 3 ? 'text-center' : i === 5 ? 'text-right' : ''}`}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingToday ? (
                  <tr><td colSpan="6" className="py-12 text-center text-slate-400 text-sm">Loading today's schedule...</td></tr>
                ) : filteredTodayEvents.length === 0 ? (
                  <tr><td colSpan="6" className="py-12 text-center text-slate-400 text-sm italic">No events found for today with this status.</td></tr>
                ) : (
                  filteredTodayEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 text-sm font-bold text-slate-900">{event.name}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold capitalize">
                          <Clock size={14} className="text-slate-400" /> {event.time_slot}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-medium text-slate-500 capitalize">{event.work_type}</td>
                      <td className="px-6 py-5 text-center">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                          {event.required_captains + event.required_sub_captains + event.required_main_boys + event.required_juniors}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="px-6 py-5 text-right">
                      <button
                       onClick={() => navigate(`/admin/events/${event.id}`, { state: { from: 'dashboard' } })}
                       className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm">
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

// Helper Status Badge component (same as EventManagement)
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