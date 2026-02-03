import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import EventCard from "../../components/captain/EventCard";
import { Loader2, Sparkles } from "lucide-react";

export default function BookedEvents() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookedEvents = async () => {
      try {
        const res = await api.get("/captain/bookings/upcoming");
        setBookings(res.data || []);
      } catch (err) {
        console.error("Error fetching booked events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookedEvents();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 px-4 pt-4">
     <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-1xl font-black tracking-tight text-gray-900 leading-none">
            UPCOMING BOOKED <span className="text-green-900">  EVENTS ({bookings.length})</span>
          </h1>
        </div>
      </header>

      {/* EVENT LIST */}
      {bookings.length > 0 ? (
        <div className="space-y-1">
          {bookings.map((item) => (
            <EventCard 
              key={item.event.id} 
              event={item.event} 
              variant="booked"
              onClick={(id) => navigate(`/captain/events/${id}`)} 
            />
          ))}
        </div>
      ) : (
        <EmptyState message="No reserved bookings found" />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-600 mb-3" size={30} />
      <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
        Loading Reservations
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
      <p className="text-xs text-gray-400 mt-1">Your upcoming missions will appear here</p>
    </div>
  );
}