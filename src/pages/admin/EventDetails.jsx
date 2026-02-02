import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Briefcase, CheckCircle2,
  Edit3, AlertCircle, X, Check, Trash2, Loader2, Search
} from "lucide-react";
import api from "../../services/api";
import EventFormDrawer from "../../components/admin/events/EventFormDrawer";
import { useAuth } from "../../context/AuthContext";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth(); 
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false); 
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [bookings, setBookings] = useState([]);
  const [localBookings, setLocalBookings] = useState([]); 
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmUpdateId, setConfirmUpdateId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(null);

  const canEditEvent = hasPermission("event:edit");
  const canOperate = hasPermission("event:operate");
  const canEditWage = hasPermission("wage:edit");
  const canViewWage = hasPermission("wage:view");

  const handleBack = () => {
    if (location.state?.from === 'dashboard') {
      navigate("/admin/dashboard");
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchBookings(searchTerm, filterStatus);
      if (canViewWage) fetchSummary();
    }
  }, [id, canViewWage]);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/admin/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      toast.error("Failed to load event details");
      navigate("/admin/events");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (query = "", status = "all") => {
    try {
      let endpoint = `/admin/events/bookings/${id}`;
      if (query) {
        endpoint = `/admin/events/bookings/${id}/search?name=${query}`;
      } else if (status !== "all") {
        endpoint = `/admin/events/bookings/${id}/status/${status}`;
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

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/admin/reports/events/${id}/wages/summary`);
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load summary");
    }
  };

  const confirmEventStatusUpdate = async () => {
    if (!canOperate) return toast.error("No permission to operate");
    setIsUpdating(true);
    let endpoint = "";
    if (pendingStatus === "ongoing") endpoint = `/admin/events/start/${id}`;
    else if (pendingStatus === "completed") endpoint = `/admin/events/complete/${id}`;
    else if (pendingStatus === "cancelled") endpoint = `/admin/events/cancel/${id}`;

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
        status: row.status,
        ta_amount: Number(row.ta_amount) || 0,
        bonus_amount: Number(row.bonus_amount) || 0,
        fine_amount: Number(row.fine_amount) || 0
      };

      const isWageOverride = event.status === 'completed';
      
      if (isWageOverride && !canEditWage) return toast.error("Permission denied to edit wages");
      if (!isWageOverride && !canOperate) return toast.error("Permission denied to update attendance");

      const endpoint = isWageOverride 
        ? `/admin/bookings/${row.booking_id}/wage` 
        : `/admin/bookings/${row.booking_id}/attendance`;

      await api.put(endpoint, payload);
      
      toast.success("Updated successfully");
      setConfirmUpdateId(null);
      fetchBookings(searchTerm, filterStatus);
      if (canViewWage) fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  const removeWorker = async (bookingId) => {
    if (!canOperate) return toast.error("No permission to remove workers");

    setIsDeleting(bookingId);
    try {
      await api.delete(`/admin/events/bookings/${id}/${bookingId}`);
      toast.success("Worker removed");
      
      setLocalBookings(prev => prev.filter(b => b.booking_id !== bookingId));
      setBookings(prev => prev.filter(b => b.booking_id !== bookingId));
      setDeleteConfirmId(null); 
      
      if (canViewWage) fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove worker");
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) return <div className="p-10 text-center text-slate-500 text-sm bg-slate-950 min-h-screen">Loading event details...</div>;
  if (!event) return <div className="p-10 text-center text-red-400 text-sm bg-slate-950 min-h-screen">Event not found</div>;

  return (
    <div className="font-sans pb-10  min-h-screen text-slate-200">
      <div className="max-w-5xl mx-auto px-4 md:px-10">
        
        <button onClick={handleBack} className="flex items-center gap-2 text-blue-400 hover:text-white transition-colors mb-5 mt-2 text-sm font-semibold group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          {location.state?.from === 'dashboard' ? 'Back to Dashboard' : 'Back to Events'}
        </button>

        <div className="space-y-5">
          <div className="bg-[#0a0a0c]  border border-slate-800 rounded-xl p-6 shadow-xl mb-10">
            <div className="flex justify-between items-start mb-0.5">
              <h1 className="text-xl font-semibold tracking-tight text-white">{event.name}</h1>
              <span className={`px-3 py-0.5 rounded-full border text-[10px] uppercase tracking-wider font-medium ${
                event.status === 'ongoing' ? 'bg-amber-900/20 border-amber-800 text-amber-400' : 
                event.status === 'completed' ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 
                event.status === 'cancelled' ? 'bg-red-900/20 border-red-800 text-red-400' :
                'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {event.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                   ID: <span className="text-slate-400">{event.id}</span>
               </p>
              {event.status === 'upcoming' && canEditEvent && (
                <button onClick={() => setIsEditOpen(true)}
                 className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-blue-500/20 active:scale-95">
                <Edit3 size={12} strokeWidth={3} /> 
                Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10 mb-6 border-b border-slate-800 pb-6">
              <InfoItem icon={<Calendar />} label="Date" value={formatDate(event.date)} />
              <InfoItem icon={<Clock />} label="Time" value={event.time_slot} capitalize />
              <InfoItem 
                icon={<Clock />} 
                label="Reporting" 
                value={event.reporting_time ? (
                  (() => {
                    const [h, m] = event.reporting_time.split(':');
                    const hours = parseInt(h);
                    return `${hours % 12 || 12}:${m} ${hours >= 12 ? 'PM' : 'AM'}`;
                  })()
                ) : '-'} 
              />
              <InfoItem icon={<Briefcase />} label="Type" value={event.work_type} capitalize />
              <div className="flex items-center gap-3 md:col-span-2 text-sm">
                <MapPin size={16} className="text-slate-500" />
                <span className="text-slate-500 font-normal">Location:</span>
                <a href={event.location_link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-medium">View on Maps</a>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-800">
              <p className="text-xs mb-2 font-semibold text-slate-400 uppercase tracking-tight">Logistics & Extras</p>
              <div className="text-sm text-slate-300 flex flex-wrap gap-6">
                <span className="flex items-center gap-1 font-medium">Transport: <span className="text-white">{event.transport_provided ? `Yes (${event.transport_type})` : "No"}</span></span>
                <span className="flex items-center gap-1 font-medium">Extra Wage: <span className="text-white">₹{event.extra_wage_amount}</span></span>
                {event.long_work && <span className="bg-amber-900/40 text-amber-400 border border-amber-800/50 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">Long Work</span>}
              </div>
            </div>

            <p className="text-xs mb-3 font-semibold text-slate-400 uppercase tracking-tight">Required Workforce:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <WorkerStat label="Captains" count={event.required_captains} />
              <WorkerStat label="Sub-Captains" count={event.required_sub_captains} />
              <WorkerStat label="Main Boys" count={event.required_main_boys} />
              <WorkerStat label="Juniors" count={event.required_juniors} />
            </div>

            {canOperate && (
              <div className="flex flex-col md:flex-row md:items-center gap-4 border-t border-slate-800 pt-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Manage Event Lifecycle:</span>
                {!pendingStatus ? (
                  <div className="flex gap-2">
                    {(event.status === 'upcoming' || event.status === 'ongoing') ? (
                      <select 
                        value={event.status} 
                        onChange={(e) => setPendingStatus(e.target.value)} 
                        className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none min-w-[180px] shadow-sm cursor-pointer hover:border-slate-600"
                      >
                        {event.status === 'upcoming' && (
                          <>
                            <option value="upcoming" disabled>Upcoming (Current)</option>
                            <option value="ongoing">Start Event</option>
                            <option value="completed">Mark as Completed</option>
                            <option value="cancelled">Cancel Event</option>
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
                      <div className="flex items-center gap-2 text-slate-500 italic text-xs">
                        <CheckCircle2 size={14} /> Event is {event.status}.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center gap-1.5 bg-amber-900/20 border border-amber-800/50 px-3 py-1.5 rounded-lg shadow-sm">
                      <AlertCircle size={14} className="text-amber-500" />
                      <span className="text-xs text-amber-500 font-bold uppercase tracking-tight">Confirm "{pendingStatus}"?</span>
                    </div>
                    <button onClick={confirmEventStatusUpdate} disabled={isUpdating} className="bg-emerald-600 text-white p-2 rounded-md hover:bg-emerald-700 shadow-md disabled:opacity-50">
                      {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    </button>
                    <button onClick={() => setPendingStatus(null)} className="bg-slate-800 border border-slate-700 text-slate-400 p-2 rounded-md hover:bg-slate-700 shadow-sm"><X size={16} /></button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bbg-[#0a0a0c]  border border-slate-800 rounded-xl overflow-hidden shadow-xl mb-10">
  <div className="p-4 border-b border-slate-800 bg-[#0a0a0c]  flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="flex items-center gap-2">
      <CheckCircle2 size={18} className="text-blue-400" />
      <h2 className="text-sm font-semibold text-white">Attendance Management</h2>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        <input 
          type="text" 
          placeholder="Search workers..." 
          value={searchTerm}
          className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none w-full md:w-40 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600" 
          onChange={(e) => { 
            setSearchTerm(e.target.value); 
            fetchBookings(e.target.value, filterStatus); 
          }} 
        />
      </div>
      <select 
        className="text-xs border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none bg-slate-800 font-medium text-slate-300 cursor-pointer hover:border-slate-600" 
        value={filterStatus} 
        onChange={(e) => { 
          setFilterStatus(e.target.value); 
          fetchBookings(searchTerm, e.target.value); 
        }}
      >
        <option value="all">All Status</option>
        <option value="booked">Booked</option>
        <option value="present">Present</option>
        <option value="absent">Absent</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  </div>

  {/* Added black scrollbar styling for mobile/tablet views */}
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
    <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
      <thead>
        <tr className="bg-slate-800/30 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-800">
          <th className="px-4 py-3 font-semibold w-12 text-center">No</th>
          <th className="px-4 py-3 font-semibold w-auto">Worker</th> 
          <th className="px-4 py-3 font-semibold w-28">Status</th>
          <th className="px-4 py-3 font-semibold w-20">Base</th>
          <th className="px-4 py-3 font-semibold w-20">EX</th>
          <th className="px-4 py-3 font-semibold w-20">TA</th>
          <th className="px-4 py-3 font-semibold w-20">DA</th>
          <th className="px-4 py-3 font-semibold w-20 text-red-400">Fine</th>
          <th className="px-4 py-3 font-semibold w-32 text-white">Total Amount</th> 
          <th className="px-4 py-3 font-semibold text-center w-32">Action</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {localBookings.length === 0 ? (
          <tr>
            <td colSpan="10" className="text-center py-10 text-slate-600 italic">No bookings found matching criteria.</td>
          </tr>
        ) : localBookings.map((row, idx) => {
          const originalRow = bookings.find(b => b.booking_id === row.booking_id);
          const hasChanges = row.status !== originalRow?.status || 
                            Number(row.ta_amount) !== (originalRow?.ta_amount || 0) || 
                            Number(row.bonus_amount) !== (originalRow?.bonus_amount || 0) || 
                            Number(row.fine_amount) !== (originalRow?.fine_amount || 0);
          
          const liveTotal = Number(row.base_amount) + Number(row.extra_amount) + Number(row.ta_amount) + Number(row.bonus_amount) - Number(row.fine_amount);

          return (
            <tr key={row.booking_id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-3 text-slate-600 text-xs text-center">{idx + 1}</td>
              <td className="px-4 py-3">
                <div className="font-bold text-slate-200 leading-none mb-1 truncate">{row.user_name}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-tight font-medium">{row.role}</div>
              </td>
            <td className="px-4 py-3">
            <select 
              disabled={!canOperate || event.status === 'completed'}
              value={row.status} 
              onChange={(e) => handleRowChange(row.booking_id, 'status', e.target.value)}
              className={`text-[10px] font-bold rounded px-1.5 py-1 border focus:outline-none bg-slate-900 w-full transition-colors ${
                event.status === 'completed' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              } ${
                row.status === 'completed' ? 'text-emerald-400 border-emerald-900/50 bg-emerald-900/20' : 
                row.status === 'present' ? 'text-blue-400 border-blue-900/50 bg-blue-900/20' : 
                row.status === 'absent' ? 'text-red-400 border-red-900/50 bg-red-900/20' : 'text-slate-400 border-slate-700'}`}
            >
              <option value="booked" disabled>Booked</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="completed">Completed</option>
            </select>
          </td>
              <td className="px-4 py-3 text-slate-500 italic">₹{row.base_amount}</td>
              <td className="px-4 py-3 text-slate-500 italic">₹{row.extra_amount}</td>
              <td className="px-4 py-3">
                <input type="number" disabled={!canEditWage} value={row.ta_amount} onChange={(e) => handleRowChange(row.booking_id, 'ta_amount', e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-1 py-1 text-xs focus:border-blue-500 focus:outline-none disabled:bg-slate-900 disabled:text-slate-600" />
              </td>
              <td className="px-4 py-3">
                <input type="number" disabled={!canEditWage} value={row.bonus_amount} onChange={(e) => handleRowChange(row.booking_id, 'bonus_amount', e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-1 py-1 text-xs focus:border-blue-500 focus:outline-none disabled:bg-slate-900 disabled:text-slate-600" />
              </td>
              <td className="px-4 py-3">
                <input type="number" disabled={!canEditWage} value={row.fine_amount} onChange={(e) => handleRowChange(row.booking_id, 'fine_amount', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-1 py-1 text-xs text-red-400 focus:border-red-500 focus:outline-none disabled:bg-slate-900 disabled:opacity-40" />
              </td>
              <td className="px-4 py-3 font-black text-white text-base italic">₹{liveTotal}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  {confirmUpdateId === row.booking_id ? (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => saveRowUpdate(row)} 
                        className="bg-emerald-600 text-white p-1.5 rounded-md hover:bg-emerald-700 shadow-sm"
                        title="Save Changes"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          setConfirmUpdateId(null);
                          setLocalBookings(JSON.parse(JSON.stringify(bookings)));
                        }} 
                        className="bg-slate-800 text-slate-400 p-1.5 rounded-md hover:bg-slate-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : deleteConfirmId === row.booking_id ? (
                     <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                       <button 
                         onClick={() => removeWorker(row.booking_id)}
                         disabled={isDeleting !== null}
                         className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase hover:bg-red-700 shadow-sm"
                       >
                         {isDeleting === row.booking_id ? <Loader2 size={12} className="animate-spin" /> : 'Confirm'}
                       </button>
                       <button 
                         onClick={() => setDeleteConfirmId(null)}
                         className="bg-slate-800 text-slate-400 p-1.5 rounded-md hover:bg-slate-700"
                       >
                         <X size={12} />
                       </button>
                     </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {hasChanges && (
                        <button 
                          onClick={() => setConfirmUpdateId(row.booking_id)} 
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 shadow-sm transition-colors"
                        >
                          Update
                        </button>
                      )}
                      
                      {/* Updated: Remove button only shows if event status is upcoming */}
                      {canOperate && event.status === 'upcoming' && (
                        <button 
                          onClick={() => setDeleteConfirmId(row.booking_id)} 
                          className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
      {canViewWage && summary && localBookings.length > 0 && (
        <tfoot className="bg-slate-950 text-white border-t-2 border-slate-800">
          <tr className="font-bold">
            <td className="px-4 py-4 text-center text-[10px] text-slate-600 uppercase">Total</td>
            <td className="px-4 py-4 text-sm font-medium">{summary.total_workers} workers</td>
            <td className="px-4 py-4"></td> 
            <td className="px-4 py-4 text-xs italic text-blue-400">₹{summary.total_base_amount}</td>
            <td className="px-4 py-4 text-xs italic text-blue-400">₹{summary.total_extra_amount}</td>
            <td className="px-4 py-4 text-xs text-blue-400">₹{summary.total_ta_amount}</td>
            <td className="px-4 py-4 text-xs text-blue-400">₹{summary.total_bonus_amount}</td>
            <td className="px-4 py-4 text-xs text-red-400">₹{summary.total_fine_amount}</td>
            <td className="px-4 py-4 text-lg text-emerald-400 bg-slate-900 border-l border-slate-800" colSpan="2">
              <span className="text-[9px] text-slate-500 uppercase block leading-none mb-1">Grand Total</span>
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
      <EventFormDrawer 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onRefresh={fetchEventDetails} 
        editData={event} 
      />
    </div>
  );
}

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
    <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
      <p className="text-slate-500 text-[10px] uppercase mb-0.5 tracking-tight font-bold">{label}</p>
      <p className="text-lg font-medium text-slate-200">{count}</p>
    </div>
  );
}