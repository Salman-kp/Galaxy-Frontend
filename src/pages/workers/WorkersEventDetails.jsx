import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowLeft,
  Wallet,
  Loader2,
  Navigation2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function WorkersEventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [h, m] = time.split(":");
    const hour = +h % 12 || 12;
    return `${hour}:${m} ${+h >= 12 ? "PM" : "AM"}`;
  };

  useEffect(() => {
    api
      .get(`/worker/bookings/${id}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load booking");
        navigate(-1);
      });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-slate-700" size={36} />
      </div>
    );
  }

  const { event, my_booking } = data;
  const eventDate = new Date(event.date);

  return (
    <div className="flex justify-center p-4 bg-slate-50 ">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-200">

        {/* HEADER */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex gap-4 items-center">
          <div className="flex flex-col items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white mb-2 transition active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-amber-400 text-5xl font-black leading-none">
              {eventDate.getDate()}
            </span>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              {eventDate.toLocaleString("default", { month: "short" })}
            </span>
          </div>

          <div className="text-white">
            <h1 className="text-xl font-bold capitalize leading-tight">
              {event.name}
            </h1>
            <p className="text-xs opacity-80 mt-1">{event.work_type}</p>
          </div>
        </div>

        {/* EVENT DETAILS */}
        <div className="p-6 space-y-3">
          <DetailRow label="Date" value={eventDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
          <DetailRow label="Time Slot" value={event.time_slot} />
          <DetailRow label="Reporting" value={formatTime(event.reporting_time)} />
          <DetailRow label="Work Type" value={event.work_type} />
          {event.long_work && <DetailRow label="Duration" value="Long Work" isHighlight />}
          <DetailRow
            label="Transport"
            value={event.transport_provided ? `Provided (${event.transport_type || "N/A"})` : "Self"}
          />
          {event.extra_wage_amount > 0 && (
            <DetailRow label="Extra Wage" value={`₹${event.extra_wage_amount}`} isHighlight />
          )}

          {/* LOCATION BUTTON */}
          <div className="pt-4">
            {(() => {
              const isValidLink =
                event.location_link &&
                (event.location_link.startsWith("http") || event.location_link.includes("maps"));

              return (
                <a
                  href={isValidLink ? event.location_link : "#"}
                  target={isValidLink ? "_blank" : "_self"}
                  rel="noreferrer"
                  onClick={(e) => !isValidLink && e.preventDefault()}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition
                    ${isValidLink
                      ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-lg"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  <Navigation2 size={16} />
                  {isValidLink ? "Get Direction" : "No Location"}
                </a>
              );
            })()}
          </div>
        </div>

        {/* BOOKING & PAYOUT */}
        <div className="border-t border-slate-200">
          <div className="px-6 py-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 bg-slate-50">
            <Wallet size={14} />
            Booking & Payout
          </div>

          <div className="p-6 space-y-3">
            <DetailRow label="Status" value={my_booking.status} badge />
            <DetailRow label="Base Amount" value={`₹${my_booking.base_amount}`} />
            <DetailRow label="Extra Amount" value={`₹${my_booking.extra_amount}`} />
            <DetailRow label="TA Amount" value={`₹${my_booking.ta_amount}`} />
            <DetailRow label="Bonus" value={`₹${my_booking.bonus_amount}`} isHighlight />
            <DetailRow label="Fine" value={`₹${my_booking.fine_amount}`} isNegative />
          </div>

          {/* TOTAL */}
          <div className="px-6 py-5 bg-slate-900 flex justify-between items-center">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-slate-400">
              Total Payout
            </span>
            <span className="text-3xl font-black text-white tracking-tight">
              ₹{my_booking.total_amount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI HELPERS ---------- */

function DetailRow({ label, value, isHighlight, badge, isNegative }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-28">
        {label}
      </span>
      <span className="text-slate-300 mx-2">:</span>

      {badge ? (
        <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase">
          {value}
        </span>
      ) : (
        <span
          className={`font-bold ${
            isNegative
              ? "text-red-600"
              : isHighlight
              ? "text-emerald-600"
              : "text-slate-800"
          }`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
