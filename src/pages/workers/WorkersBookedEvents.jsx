import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Loader2, Briefcase } from "lucide-react";
import EventCard from "../../components/workers/EventCard";

export default function WorkersBookedEvents() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookedJobs = async () => {
      try {
        const res = await api.get("/worker/bookings");
        // Ensure we handle the nested structure and sort by event date
        const data = res.data || [];
        const sortedData = data.sort(
          (a, b) => new Date(a.event.date) - new Date(b.event.date)
        );
        setBookings(sortedData);
      } catch (err) {
        console.error("Worker booking fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookedJobs();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h1 className="text-sm font-black tracking-tight text-gray-900 leading-none uppercase">
          MY BOOKED <span className="text-green-600">EVENTS ({bookings.length})</span>
        </h1>
      </header>

      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-1">
          {bookings.map((item) => (
            <EventCard 
              key={item.my_booking.id} 
              event={item.event} 
              variant="booked"
              onClick={() => navigate(`/worker/event/${item.my_booking.id}`)}
            />
          ))}
        </div>
      ) : (
         <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
          <Briefcase className="mx-auto text-gray-200 mb-4" size={40} />
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No new shifts available</p>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-[50vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-green-600 mb-3" size={30} />
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        Retrieving your schedule...
      </span>
    </div>
  );
}