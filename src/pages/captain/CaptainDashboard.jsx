import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Loader2, Sparkles } from "lucide-react";
import DashboardEventCard from "../../components/captain/DashboardEventCard";

export default function CaptainDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const res = await api.get("/captain/events");
        setEvents(res.data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingEvents();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 px-4">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-1xl font-black tracking-tight text-gray-900 leading-none">
            AVAILABLE <span className="text-red-600">EVENTS ({events.length})</span>
          </h1>
        </div>
      </header>

      {events.length > 0 ? (
        <div className="space-y-1">
          {events.map((event) => (
            <DashboardEventCard 
              key={event.id} 
              event={event} 
              variant="upcoming"
              onClick={(id) => navigate(`/captain/book/${id}`)}/>
          ))}
        </div>
      ) : (
        <EmptyState message="No upcoming events found" />
      )}
    </div>
  );
}


function LoadingState() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-red-600 mb-3" size={30} />
      <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
        Fetching Galaxy Events
      </span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
      <Sparkles className="mx-auto text-gray-300 mb-4" size={48} />
      <p className="text-gray-500 font-black uppercase text-sm tracking-widest">
        {message}
      </p>
      <p className="text-xs text-gray-400 mt-1">Check back later for new opportunities</p>
    </div>
  );
}