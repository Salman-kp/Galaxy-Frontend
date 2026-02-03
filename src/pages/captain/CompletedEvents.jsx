import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import EventCard from "../../components/captain/EventCard";
import { Loader2, Sparkles } from "lucide-react";

export default function CompletedEvents() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompletedEvents = async () => {
      try {
        const res = await api.get("/captain/bookings/completed");
        setBookings(res.data || []);
      } catch (err) {
        console.error("Error fetching completed events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedEvents();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 px-4 pt-4">
      {/* HEADER: Matching the clean Dashboard style */}
       <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-1xl font-black tracking-tight text-gray-900 leading-none">
            COMPLETED <span className="text-[#607d8b]">EVENTS ({bookings.length})</span>
          </h1>
        </div>
      </header>

      {bookings.length > 0 ? (
        <div className="space-y-1">
          {bookings.map((item) => (
            <EventCard 
              key={item.event.id} 
              event={item.event} 
              variant="completed"
              onClick={(id) => navigate(`/captain/events/${id}`)} 
            />
          ))}
        </div>
      ) : (
        <EmptyState message="No past events found" />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-gray-400 mb-3" size={30} />
      <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
        Loading History
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
      <p className="text-xs text-gray-400 mt-1">Events you finish will appear here</p>
    </div>
  );
}