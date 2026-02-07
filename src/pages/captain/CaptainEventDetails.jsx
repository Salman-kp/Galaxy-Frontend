import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Briefcase, CheckCircle2,
  AlertCircle, X, Check, Loader2, Search,CalendarIcon
} from "lucide-react";
import api from "../../services/api";

export default function CaptainEventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [bookings, setBookings] = useState([]);
  const [localBookings, setLocalBookings] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmUpdateId, setConfirmUpdateId] = useState(null);
  const [wageSummary, setWageSummary] = useState(null);

  // Permission Logic
  const canOperate = event?.status === 'ongoing'; 
  const canEditWage = event?.status === 'ongoing';
  const canViewWage = true; 

  const handleBack = () => {
    if (location.state?.from === 'dashboard') {
      navigate("/captain/dashboard");
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchBookings(searchTerm, filterStatus);
      fetchWageSummary();
    }
  }, [id]);
  const fetchWageSummary = async () => {
  try {
    const res = await api.get(`/captain/reports/events/${id}/wages/summary`);
    setWageSummary(res.data);
  } catch (err) {
    console.error("Summary fetch failed");
  }
};

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/captain/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      toast.error("Failed to load event details");
      navigate("/captain/events");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (query = "", status = "all") => {
  try {
    let endpoint = `/captain/event-attendance/${id}`; // Corrected Base Path
    
    if (query) {
      endpoint = `/captain/event-attendance/${id}/search?name=${query}`;
    } else if (status !== "all") {
      endpoint = `/captain/event-attendance/${id}/status/${status}`;
    }

    const res = await api.get(endpoint);
    const data = res.data || [];
    setBookings(data);
    setLocalBookings(JSON.parse(JSON.stringify(data))); 
  } catch (err) {
    console.error("Fetch Bookings Error:", err);
    setBookings([]);
    setLocalBookings([]);
  }
};

  // Logic for the Summary Footer
  const summary = useMemo(() => {
    if (!localBookings.length) return null;
    return localBookings.reduce((acc, row) => {
      const base = Number(row.base_amount || 0);
      const extra = Number(row.extra_amount || 0);
      const ta = Number(row.ta_amount || 0);
      const bonus = Number(row.bonus_amount || 0);
      const fine = Number(row.fine_amount || 0);
      
      acc.total_workers += 1;
      acc.total_base_amount += base;
      acc.total_extra_amount += extra;
      acc.total_ta_amount += ta;
      acc.total_bonus_amount += bonus;
      acc.total_fine_amount += fine;
      acc.grand_total_amount += (base + extra + ta + bonus - fine);
      return acc;
    }, {
      total_workers: 0, total_base_amount: 0, total_extra_amount: 0, 
      total_ta_amount: 0, total_bonus_amount: 0, total_fine_amount: 0, grand_total_amount: 0
    });
  }, [localBookings]);

  const confirmEventStatusUpdate = async () => {
    setIsUpdating(true);
    let endpoint = "";
    if (pendingStatus === "ongoing") endpoint = `/captain/events/start/${id}`;
    else if (pendingStatus === "completed") endpoint = `/captain/events/complete/${id}`;

    try {
      await api.put(endpoint);
      toast.success(`Event marked as ${pendingStatus}`);
      setPendingStatus(null);
      fetchEventDetails(); 
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRowChange = (bookingId, field, value) => {
    setLocalBookings(prev => prev.map(row => 
      row.booking_id === bookingId ? { ...row, [field]: value } : row
    ));
  };

  const saveRowUpdate = async (row) => {
  try {
    const payload = { 
      booking_id: row.booking_id, // Backend needs this in body
      status: row.status,
      ta_amount: Number(row.ta_amount),
      bonus_amount: Number(row.bonus_amount),
      fine_amount: Number(row.fine_amount)
    };
    
    await api.put(`/captain/event-attendance/${id}`, payload);
    
    toast.success("Attendance updated");
    setConfirmUpdateId(null);
    fetchBookings(searchTerm, filterStatus);
  } catch (err) {
    toast.error(err.response?.data?.error || "Update failed");
  }
};

  const formatDate = (dateString) => {
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) return <div className="p-10 text-center text-slate-500 text-sm bg-slate-950 min-h-screen flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16}/> Loading event details...</div>;
  if (!event) return <div className="p-10 text-center text-red-400 text-sm bg-slate-950 min-h-screen">Event not found</div>;
  const isToday = new Date(event.date).toDateString() === new Date().toDateString();

  return (
    <div className="font-sans pb-10 min-h-screen ">
      <div className="max-w-6xl mx-auto px-4 md:px-10">
        
        <button 
        onClick={handleBack} 
        className="flex items-center bg-black gap-2 text-blue-400 hover:text-white hover:bg-black px-4 py-2 rounded-full transition-all duration-300 mb-5 mt-6 text-sm font-semibold group w-fit"
        >
       <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
       Back 
       </button>

        <div className="space-y-5">
          {/* Header Card */}
         <div className="bg-[#000000] border border-slate-800 rounded-xl p-[min(3vw,1.5rem)] shadow-xl mb-10 w-full">
  {/* Header: Title and Status Tag */}
  <div className="flex justify-between items-start mb-[0.5vw]">
    <h1 className="text-[clamp(16px,1.8vw,22px)] font-semibold tracking-tight text-white leading-tight">
      {event.name}
    </h1>
    <span
      className={`px-[1vw] py-0.5 rounded-full border text-[clamp(8px,0.8vw,10px)] uppercase tracking-wider font-bold ${
        event.status === 'ongoing' ? 'bg-amber-900/20 border-amber-800 text-amber-400' : 
        event.status === 'completed' ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 
        'bg-slate-800 border-slate-700 text-slate-400'}`}
    >
      {event.status}
    </span>
  </div>

  {/* ID Row */}
  <div className="flex items-center justify-between mb-[1vw]">
    <p className="text-[clamp(8px,0.8vw,10px)] font-black uppercase tracking-widest text-slate-500">
      ID: <span className="text-slate-400">{event.id}</span>
    </p>
  </div>

  {/* Main Info Grid */}
  <div className="grid grid-cols-2 md:grid-cols-2 gap-y-[1.5vw] gap-x-[5vw] mb-[2vw] border-b border-slate-800 pb-[2vw]">
    <InfoItem 
      icon={<Calendar className="w-[1.2vw] h-[1.2vw] min-w-[12px]" />} 
      label="Date" 
      value={formatDate(event.date)} 
    />
    <InfoItem 
      icon={<Clock className="w-[1.2vw] h-[1.2vw] min-w-[12px]" />} 
      label="Time" 
      value={event.time_slot} 
      capitalize 
    />
    <InfoItem 
      icon={<Clock className="w-[1.2vw] h-[1.2vw] min-w-[12px]" />} 
      label="Reporting" 
      value={event.reporting_time ? (
        (() => {
          const [h, m] = event.reporting_time.split(':');
          const hours = parseInt(h);
          return `${hours % 12 || 12}:${m} ${hours >= 12 ? 'PM' : 'AM'}`;
        })()
      ) : '-'} 
    />
    <InfoItem 
      icon={<Briefcase className="w-[1.2vw] h-[1.2vw] min-w-[12px]" />} 
      label="Type" 
      value={event.work_type} 
      capitalize 
    />
    
    <div className="flex items-center gap-[0.8vw] col-span-2 text-[clamp(11px,1.1vw,14px)]">
      <MapPin className="text-slate-500 w-[1.2vw] h-[1.2vw] min-w-[12px]" />
      <span className="text-slate-500 font-normal">Location:</span>
      <a href={event.location_link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-medium">
        View on Maps
      </a>
    </div>
  </div>

  {/* Logistics Section */}
  <div className="bg-slate-800/50 rounded-lg p-[1.2vw] mb-[2vw] border border-slate-800">
    <p className="text-[clamp(9px,0.8vw,11px)] mb-[0.5vw] font-semibold text-slate-400 uppercase tracking-tight">
      Logistics & Extras
    </p>
    <div className="text-[clamp(11px,1vw,13px)] text-slate-300 flex flex-wrap gap-[2vw]">
      <span className="flex items-center gap-1 font-medium">
        Transport: <span className="text-white">{event.transport_provided ? `Yes (${event.transport_type})` : "No"}</span>
      </span>
      <span className="flex items-center gap-1 font-medium">
        Extra Wage: <span className="text-white">₹{event.extra_wage_amount}</span>
      </span>
      {event.long_work && (
        <span className="bg-amber-900/40 text-amber-400 border border-amber-800/50 px-1.5 py-0.5 rounded text-[clamp(7px,0.6vw,9px)] uppercase font-bold">
          Long Work
        </span>
      )}
    </div>
  </div>

  {/* Workforce Section */}
  <p className="text-[clamp(9px,0.8vw,11px)] mb-[1vw] font-semibold text-slate-400 uppercase tracking-tight">
    Required Work Force:
  </p>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-[1vw] mb-[2vw]">
    <WorkerStat label="Captains" count={event.required_captains} />
    <WorkerStat label="Sub-Captains" count={event.required_sub_captains} />
    <WorkerStat label="Main Boys" count={event.required_main_boys} />
    <WorkerStat label="Juniors" count={event.required_juniors} />
  </div>

  {/* Status Management Section */}
<div className="flex flex-col md:flex-row md:items-center gap-[1.5vw] border-t border-slate-800 pt-[1.5vw]">
  <span className="text-[clamp(9px,0.8vw,11px)] font-semibold text-slate-500 uppercase tracking-tight">
    Manage Event Status:
  </span>

  {/* 1. Date Check: Only allow changes if the date is today */}
  { event.status !== 'completed' && new Date(event.date).toDateString() === new Date().toDateString() ? (
    <>
      {!pendingStatus ? (
        <div className="flex gap-2">
          {(event.status === 'upcoming' || event.status === 'ongoing') ? (
            <select 
              value={event.status} 
              onChange={(e) => setPendingStatus(e.target.value)} 
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-[1vw] py-1 text-[clamp(10px,0.9vw,12px)] font-medium focus:outline-none min-w-[150px] shadow-sm cursor-pointer hover:border-slate-600"
            >
              {event.status === 'upcoming' && (
                <>
                  <option value="upcoming" disabled>Upcoming (Current)</option>
                  <option value="ongoing">Start Event</option>
                  <option value="completed">Mark as Completed</option>
                </>
              )}
              {event.status === 'ongoing' && (
                <>
                  <option value="ongoing" disabled>Ongoing (In Progress)</option>
                  <option value="completed">Finish & Complete Event</option>
                </>
              )}
            </select>
          ) : (
            <div className="flex items-center gap-2 text-slate-500 italic text-[clamp(10px,0.9vw,12px)]">
              <CheckCircle2 className="w-[1.2vw] h-[1.2vw] min-w-[12px]" /> Event is {event.status}.
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-[1vw] animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="flex items-center gap-1.5 bg-amber-900/20 border border-amber-800/50 px-[1vw] py-1 rounded-lg shadow-sm">
            <AlertCircle className="text-amber-500 w-[1.2vw] h-[1.2vw] min-w-[12px]" />
            <span className="text-[clamp(9px,0.8vw,11px)] text-amber-500 font-bold uppercase tracking-tight">
              Confirm "{pendingStatus}"?
            </span>
          </div>
          <button onClick={confirmEventStatusUpdate} disabled={isUpdating} className="bg-emerald-600 text-white p-[0.5vw] rounded hover:bg-emerald-700 shadow-md">
            {isUpdating ? <Loader2 className="w-[1.2vw] h-[1.2vw] animate-spin" /> : <Check className="w-[1.2vw] h-[1.2vw]" />}
          </button>
          <button onClick={() => setPendingStatus(null)} className="bg-slate-800 border border-slate-700 text-slate-400 p-[0.5vw] rounded hover:bg-slate-700 shadow-sm">
            <X className="w-[1.2vw] h-[1.2vw]" />
          </button>
        </div>
      )}
    </>
  ) : (
    /* Display state for Completed or Wrong Date */
    <div className="flex items-center gap-2 text-slate-500 italic text-[clamp(10px,0.9vw,12px)]">
      {event.status === 'completed' ? (
        <>
          <CheckCircle2 className="w-[1.2vw] h-[1.2vw] min-w-[12px] text-emerald-500" />
          <span className="text-emerald-500/80 font-medium">Event Completed</span>
        </>
      ) : (
        <>
          <CalendarIcon className="w-[1.2vw] h-[1.2vw] min-w-[12px]" />
          <span>Status management available on {new Date(event.date).toLocaleDateString()}</span>
        </>
      )}
    </div>
  )}
</div>
</div>

          <div className="bg-[#0a0a0c] border border-slate-800 rounded-xl overflow-hidden shadow-xl mb-10 w-full">
        <div className="p-[min(1.5vw,0.8rem)] border-b border-slate-800 bg-[#0a0a0c] flex flex-row items-center justify-between gap-2 overflow-hidden">
  
        <div className="flex items-center gap-1.5 sm:gap-[0.8vw] shrink-0">
          <CheckCircle2 className="text-blue-400 w-3.5 h-3.5 sm:w-[1.5vw] sm:h-[1.5vw]" />
          <h2 className="text-[10px] sm:text-[clamp(10px,1.2vw,14px)] font-semibold text-white whitespace-nowrap">
           Attendance Management
           </h2>
        </div>
     <div className="flex items-center gap-1.5 sm:gap-[1vw] flex-nowrap min-w-0">
      <div className="relative flex items-center shrink min-w-0">
      <Search 
        className="absolute left-2 text-slate-500 pointer-events-none" 
        size={11} 
      />
      <input 
        type="text" 
        placeholder="Search..." 
        value={searchTerm}
        className="text-[9px] sm:text-[clamp(8px,1vw,12px)] bg-slate-800 border border-slate-700 text-slate-200 rounded pl-7 pr-1.5 py-1 focus:outline-none w-[20vw] sm:w-[15vw] min-w-[75px] focus:border-blue-500 transition-all" 
        onChange={(e) => { setSearchTerm(e.target.value); fetchBookings(e.target.value, filterStatus); }} 
      />
    </div>

    {/* Filter Select */}
    <select 
      className="text-[9px] sm:text-[clamp(8px,1vw,12px)] border border-slate-700 rounded px-1 sm:px-[0.5vw] py-1 bg-slate-800 text-slate-300 outline-none cursor-pointer shrink-0 transition-colors hover:border-slate-500"
      value={filterStatus} 
      onChange={(e) => { setFilterStatus(e.target.value); fetchBookings(searchTerm, e.target.value); }}
    >
      <option value="all">All</option>
      <option value="booked">Booked</option>
      <option value="present">Present</option>
      <option value="absent">Absent</option>
      <option value="completed">Completed</option>
    </select>
  </div>
</div>

  <div className="w-full overflow-x-auto">
    <table className="w-full text-left border-collapse table-fixed min-w-full">
      <thead>
        <tr className="bg-slate-800/30 text-slate-500 text-[clamp(7px,0.8vw,10px)] uppercase tracking-tighter border-b border-slate-800">
          <th className="px-[0.5vw] py-3 w-[4%] text-center">No</th>
          <th className="px-[0.5vw] py-3 w-[18%]">Worker</th> 
          <th className="px-[0.5vw] py-3 w-[12%]">Status</th>
          <th className="px-[0.2vw] py-3 w-[8%] text-center">Base</th>
          <th className="px-[0.2vw] py-3 w-[6%] text-center">EX</th>
          <th className="px-[0.2vw] py-3 w-[9%] text-center">TA</th>
          <th className="px-[0.2vw] py-3 w-[9%] text-center">Bonus</th>
          <th className="px-[0.2vw] py-3 w-[9%] text-center text-red-400">Fine</th>
          <th className="px-[0.5vw] py-3 w-[14%] text-white">Total Amount</th> 
          <th className="px-[0.5vw] py-3 text-center w-[11%]">Action</th>
        </tr>
      </thead>
      
      <tbody className="text-[clamp(8px,0.9vw,13px)]">
        {localBookings.length === 0 ? (
          <tr>
            <td colSpan="10" className="text-center py-10 text-slate-600 italic">No bookings found.</td>
          </tr>
        ) : localBookings.map((row, idx) => {
          const originalRow = bookings.find(b => b.booking_id === row.booking_id);
          const hasChanges = row.status !== originalRow?.status || 
                            Number(row.ta_amount) !== (originalRow?.ta_amount || 0) || 
                            Number(row.bonus_amount) !== (originalRow?.bonus_amount || 0) || 
                            Number(row.fine_amount) !== (originalRow?.fine_amount || 0);
          
          const liveTotal = Number(row.base_amount) + Number(row.extra_amount) + Number(row.ta_amount) + Number(row.bonus_amount) - Number(row.fine_amount);

          return (
            <tr key={row.booking_id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-all">
              <td className="px-[0.2vw] py-2 text-slate-600 text-center">{idx + 1}</td>
              <td className="px-[0.5vw] py-2">
                <div className="font-bold text-slate-200 leading-none truncate w-full" title={row.user_name}>
                  {row.user_name}
                </div>
                <div className="text-[clamp(6px,0.7vw,9px)] text-slate-500 uppercase mt-1">{row.role}</div>
              </td>
              <td className="px-[0.2vw] py-2">
                <select 
                  disabled={!canOperate}
                  value={row.status} 
                  onChange={(e) => handleRowChange(row.booking_id, 'status', e.target.value)}
                  className={`text-[clamp(7px,0.8vw,10px)] font-bold rounded p-[0.2vw] border bg-slate-900 w-full outline-none transition-colors ${
                    !canOperate ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  } ${
                    row.status === 'completed' ? 'text-emerald-400 border-emerald-900/50' : 
                    row.status === 'present' ? 'text-blue-400 border-blue-900/50' : 
                    row.status === 'absent' ? 'text-red-400 border-red-900/50' : 'text-slate-400 border-slate-700'}`}
                >
                  <option value="booked" disabled>Booked</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
              <td className="px-[0.2vw] py-2 text-slate-500 italic text-center">₹{row.base_amount}</td>
              <td className="px-[0.2vw] py-2 text-slate-500 italic text-center">₹{row.extra_amount}</td>
              <td className="px-[0.2vw] py-2">
                <input type="number" disabled={!canEditWage} value={row.ta_amount} onChange={(e) => handleRowChange(row.booking_id, 'ta_amount', e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded py-[0.2vw] text-center focus:border-blue-500 outline-none disabled:opacity-50" />
              </td>
              <td className="px-[0.2vw] py-2">
                <input type="number" disabled={!canEditWage} value={row.bonus_amount} onChange={(e) => handleRowChange(row.booking_id, 'bonus_amount', e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded py-[0.2vw] text-center focus:border-blue-500 outline-none disabled:opacity-50" />
              </td>
              <td className="px-[0.2vw] py-2">
                <input type="number" disabled={!canEditWage} value={row.fine_amount} onChange={(e) => handleRowChange(row.booking_id, 'fine_amount', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded py-[0.2vw] text-red-400 text-center focus:border-red-500 outline-none disabled:opacity-50" />
              </td>
              <td className="px-[0.5vw] py-2 font-black text-white italic">₹{liveTotal}</td>
              <td className="px-[0.2vw] py-2 text-center">
                {confirmUpdateId === row.booking_id ? (
                  <div className="flex gap-1 justify-center">
                    <button onClick={() => saveRowUpdate(row)} className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700"><Check size={12} /></button>
                    <button onClick={() => setConfirmUpdateId(null)} className="bg-slate-800 text-slate-400 p-1 rounded hover:bg-slate-700"><X size={12} /></button>
                  </div>
                ) : hasChanges && (
                  <button onClick={() => setConfirmUpdateId(row.booking_id)} className="bg-blue-600 text-white px-[0.8vw] py-[0.4vw] rounded text-[clamp(6px,0.7vw,9px)] font-bold uppercase hover:bg-blue-700">
                    Update
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>

      {/* Summary Footer Row */}
      {canViewWage && summary && localBookings.length > 0 && (
        <tfoot className="sticky bottom-0 bg-[#0a0a0c]/95 backdrop-blur-md text-white border-t-2 border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          <tr className="font-bold">
            <td className="px-[0.2vw] py-4 text-center text-[clamp(6px,0.7vw,9px)] text-slate-600 uppercase">Total</td>
            <td className="px-[0.5vw] py-4 text-[clamp(8px,0.9vw,12px)] font-medium">{summary.total_workers} workers</td>
            <td className="px-[0.5vw] py-4"></td> 
            <td className="px-[0.2vw] py-4 text-[clamp(7px,0.8vw,10px)] text-center italic text-blue-400">₹{summary.total_base_amount}</td>
            <td className="px-[0.2vw] py-4 text-[clamp(7px,0.8vw,10px)] text-center italic text-blue-400">₹{summary.total_extra_amount}</td>
            <td className="px-[0.2vw] py-4 text-[clamp(7px,0.8vw,10px)] text-center text-blue-400">₹{summary.total_ta_amount}</td>
            <td className="px-[0.2vw] py-4 text-[clamp(7px,0.8vw,10px)] text-center text-blue-400">₹{summary.total_bonus_amount}</td>
            <td className="px-[0.2vw] py-4 text-[clamp(7px,0.8vw,10px)] text-center text-red-400">₹{summary.total_fine_amount}</td>
            <td className="px-[0.5vw] py-4 text-[clamp(10px,1.2vw,16px)] text-emerald-400 bg-slate-900 border-l border-slate-800" colSpan="2">
              <span className="text-[clamp(6px,0.6vw,8px)] text-slate-500 uppercase block leading-none mb-1 font-normal">Grand Total</span>
              ₹{summary.grand_total_amount}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  </div>
         </div>

        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoItem({ icon, label, value, capitalize }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-500">{icon && React.cloneElement(icon, { size: 16 })}</span>
      <span className="text-slate-500 text-sm">{label}:</span>
      <span className={`text-sm font-medium text-slate-200 ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  );
}

function WorkerStat({ label, count }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-[min(1.2vw,0.75rem)] border border-slate-800 flex flex-col justify-center">
      <p className="text-slate-500 text-[clamp(8px,0.7vw,10px)] uppercase mb-[0.2vw] font-bold tracking-tight">
        {label}
      </p>
      <p className="text-[clamp(14px,1.4vw,18px)] font-semibold text-slate-200 leading-none">
        {count || 0}
      </p>
    </div>
  );
}