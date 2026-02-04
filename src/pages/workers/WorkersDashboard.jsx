import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Loader2, Sparkles } from "lucide-react";
import DashboardEventCard from "../../components/workers/DashboardEventCard";

export default function WorkersDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableJobs = async () => {
      try {
        const res = await api.get("/worker/events");
        setEvents(res.data || []);
      } catch (err) {
        console.error("Worker fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableJobs();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <header className="mb-6">
           <h1 className="text-sm font-black tracking-tight text-gray-900 leading-none">
            AVAILABLE <span className="text-red-600">EVENTS ({events.length})</span>
          </h1>
      </header>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {events.map((event) => (
            <DashboardEventCard 
              key={event.id} 
              event={event} 
              onClick={(id) => navigate(`/worker/book/${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
          <Sparkles className="mx-auto text-gray-200 mb-4" size={40} />
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No new shifts available</p>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-[50vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-amber-600 mb-3" size={30} />
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning Marketplace...</span>
    </div>
  );
}