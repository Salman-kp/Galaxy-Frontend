import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import EventCard from "../../components/captain/EventCard";
import { Loader2, Activity, PlayCircle } from "lucide-react";

export default function OngoingEvents() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodayWork = async () => {
      try {
        const res = await api.get("/captain/bookings/today");
        setBookings(res.data || []);
      } catch (err) {
        console.error("Error fetching today's work:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayWork();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 px-4 pt-4">
   <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-1xl font-black tracking-tight text-gray-900 leading-none">
            TODAY BOOKED <span className="text-orange-600">  EVENTS ({bookings.length})</span>
          </h1>
        </div>
      </header>

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((item) => {
            const { event } = item;
            return (
              <div key={event.id} className="group">
                <EventCard 
                  event={event} 
                  variant="ongoing"
                  onClick={(id) => navigate(`/captain/events/${id}`)}                />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center py-10 text-gray-400 font-bold uppercase text-xs tracking-widest">
          NO EVENTS BOOKED FOR TODAY
        </p>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-green-600 mb-3" size={30} />
      <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
        Loading Today's Schedule
      </span>
    </div>
  );
}