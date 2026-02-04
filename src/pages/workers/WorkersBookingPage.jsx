import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Navigation2, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WorkersBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`; 
  };

  useEffect(() => {
    api.get(`/worker/events/${id}`)
      .then(res => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Event details not found");
        navigate('/worker/dashboard');
      });
  }, [id, navigate]);

  const handleConfirmJoin = async () => {
    setIsBooking(true);
    try {
      await api.post(`/worker/events/${id}/book`);
      toast.success("Event booked successfully");
      navigate('/worker/booked-events');
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to book event";
      toast.error(errorMsg, { duration: 4000, icon: '🚫' });
      setShowConfirm(false);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-red-700" size={40} />
    </div>
  );

  const eventDate = new Date(event.date);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md bg-[#e0e0e0] rounded-lg shadow-lg overflow-hidden border border-gray-300">
        
        {/* HEADER */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-3  flex items-center gap-3">
          <div className="flex flex-col items-center">
            <button onClick={() => navigate(-1)} className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white mb-2">
              <ArrowLeft size={18} />
            </button>
            <span className="text-[#c18e3e] text-6xl font-bold leading-none">{eventDate.getDate()}</span>
            <span className="text-[#c18e3e] text-lg font-bold uppercase tracking-widest">
              {eventDate.toLocaleString('default', { month: 'short' })}
            </span>
          </div>
          <div className="text-white p-6">
            <h1 className="text-2xl font-bold capitalize tracking-wide leading-tight">{event.name}</h1>
            <p className="text-sm opacity-90">{event.work_type}</p>
          </div>
        </div>

        {/* DETAILS */}
        <div className="p-8 space-y-4 text-[#333]">
          <DetailRow label="Date" value={eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
          <DetailRow label="Time Slot" value={event.time_slot} />
          <DetailRow label="Reporting" value={formatTime(event.reporting_time)} />
          
          {event.long_work && <DetailRow label="Duration" value="Long Work" />}
          
          <DetailRow label="Transport" value={event.transport_provided ? `Provided (${event.transport_type})` : "Self"} />

          {event.extra_wage_amount > 0 && (
            <DetailRow label="Extra Wage" value={`₹${event.extra_wage_amount}`} isHighlight />
          )}
        </div>

        {/* ACTIONS */}
        <div className="px-8 pb-8 space-y-4">
  <div className="flex gap-4">
    {(() => {
      const isValidLink = 
        event.location_link && 
        event.location_link.trim() !== "" && 
        (event.location_link.startsWith("http") || event.location_link.includes("maps"));

      return (
        <a 
          href={isValidLink ? event.location_link : "#"}
          target={isValidLink ? "_blank" : "_self"}
          rel="noreferrer"
          onClick={(e) => !isValidLink && e.preventDefault()} // Block click if invalid
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-300 group shadow-lg
            ${isValidLink 
              ? "bg-gradient-to-b from-[#2a3544] to-[#1e293b] border border-white/5 text-white hover:shadow-blue-500/10 hover:border-blue-500/30 active:scale-95" 
              : "bg-gray-300 border border-gray-400 text-gray-500 cursor-not-allowed opacity-60 pointer-events-none"
            }`}
        >
          <Navigation2 
            size={16} 
            className={`${isValidLink ? "text-[#38bdf8] group-hover:animate-pulse" : "text-gray-400"}`} 
            fill="currentColor" 
          /> 
          {isValidLink ? "Get Direction" : "No Location"}
        </a>
      );
    })()}
  </div>

  <button 
    onClick={() => setShowConfirm(true)}
    className="relative overflow-hidden w-full bg-gradient-to-r from-[#D4AF37] via-[#C18E3E] to-[#8A6623] text-[#1A2238] py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-[0_10px_30px_rgba(193,142,62,0.3)] hover:shadow-[0_15px_40px_rgba(193,142,62,0.5)] active:scale-[0.97] transition-all duration-300 before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:skew-x-[-20deg]"
  >
    <span className="relative z-10">Confirm Joining</span>
  </button>
</div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="bg-amber-100 p-3 rounded-full mb-4">
                <AlertCircle className="text-amber-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Shift</h3>
              <p className="text-gray-500 mt-2">Book your slot for <span className="font-bold">"{event.name}"</span>?</p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button onClick={handleConfirmJoin} disabled={isBooking}
                      className="w-full bg-[#1a365d] text-white py-3 rounded-xl font-bold disabled:opacity-70">
                {isBooking ? "Processing..." : "Yes, Confirm"}
              </button>
              <button onClick={() => setShowConfirm(false)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, isHighlight }) {
  return (
    <div className="flex text-sm items-baseline">
      <span className="w-32 font-semibold shrink-0 text-gray-500">{label}</span>
      <span className="mr-4">:</span>
      <span className={`capitalize font-bold ${isHighlight ? 'text-green-600' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}