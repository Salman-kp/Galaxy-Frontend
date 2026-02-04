import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Loader2, Briefcase, CheckCircle2 } from "lucide-react";
import EventCard from "../../components/workers/EventCard";

export default function WorkersCompletedEvents() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompletedJobs = async () => {
      try {
        const res = await api.get("/worker/bookings/completed");
        const data = res.data || [];
                const sortedData = data.sort(
          (a, b) => new Date(b.event.date) - new Date(a.event.date)
        );
        setBookings(sortedData);
      } catch (err) {
        console.error("Worker completed booking fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedJobs();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      <header className="mb-6">
        <h1 className="text-sm font-black tracking-tight text-gray-900 leading-none uppercase">
          COMPLETED <span className="text-blue-600">EVENTS ({bookings.length})</span>
        </h1>
      </header>

      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-1">
          {bookings.map((item) => (
            <EventCard 
              key={item.my_booking.id} 
              event={item.event} 
              variant="completed"
              onClick={() => navigate(`/worker/event/${item.my_booking.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
          <Briefcase className="mx-auto text-gray-200 mb-4" size={40} />
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No completed work found</p>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-[50vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-600 mb-3" size={30} />
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        Loading your history...
      </span>
    </div>
  );
}