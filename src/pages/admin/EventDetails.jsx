import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { toast } from "react-hot-toast";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Briefcase,
  CheckCircle2,
  Edit3,
  AlertCircle,
  X,
  Check,
  Trash2,
  Loader2
} from "lucide-react";
import api from "../../services/api";
import EventFormDrawer from "../../components/admin/events/EventFormDrawer";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access navigation state
  
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

  // Logic to determine back destination
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
      fetchBookings();
      fetchSummary();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/api/admin/events/${id}`);
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
      let endpoint = `/api/admin/events/bookings/${id}`;
      if (query) endpoint = `/api/admin/events/bookings/${id}/search?name=${query}`;
      else if (status !== "all") endpoint = `/api/admin/events/bookings/${id}/status/${status}`;

      const res = await api.get(endpoint);
      const data = res.data || [];
      setBookings(data);
      setLocalBookings(JSON.parse(JSON.stringify(data))); 
    } catch (err) {
      console.error("Failed to load bookings");
      setBookings([]);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/api/admin/reports/events/${id}/wages/summary`);
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load summary");
    }
  };

  const confirmEventStatusUpdate = async () => {
    if (!pendingStatus) return;
    setIsUpdating(true);
    let endpoint = "";
    if (pendingStatus === "ongoing") endpoint = `/api/admin/events/start/${id}`;
    else if (pendingStatus === "completed") endpoint = `/api/admin/events/complete/${id}`;
    else if (pendingStatus === "cancelled") endpoint = `/api/admin/events/cancel/${id}`;

    try {
      await api.put(endpoint);
      toast.success(`Event marked as ${pendingStatus}`);
      setEvent(prev => ({ ...prev, status: pendingStatus }));
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

      const endpoint = event.status === 'completed' 
        ? `/api/admin/bookings/${row.booking_id}/wage` 
        : `/api/admin/bookings/${row.booking_id}/attendance`;

      await api.put(endpoint, payload);
      
      toast.success("Worker updated");
      setConfirmUpdateId(null);
      fetchBookings(searchTerm, filterStatus);
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  const removeWorker = async (bookingId) => {
    if (!window.confirm("Remove worker from this event?")) return;
    try {
      await api.delete(`/api/admin/events/bookings/${id}/${bookingId}`);
      toast.success("Worker removed");
      fetchBookings();
      fetchSummary();
    } catch (err) {
      toast.error("Removal failed");
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) return <div className="p-10 text-center text-slate-400 text-sm">Loading...</div>;
  if (!event) return null;

  return (
    <div className="font-sans text-slate-700 pb-10">
      <div className="max-w-5xl mx-auto px-4 md:px-10">
        
        {/* UPDATED BACK BUTTON */}
        <button 
         onClick={handleBack} 
         className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors mb-5 mt-2 text-sm font-semibold group"
        >
       <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
       {location.state?.from === 'dashboard' ? 'Back to Dashboard' : 'Back to Events'}
     </button>

        <div className="space-y-5">
          {/* --- DETAILS SECTION --- */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative">
            
            {event.status === 'upcoming' && (
              <button 
                className="absolute top-6 right-6 flex items-center gap-1.5 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-xs font-medium transition-all border border-blue-100" 
                onClick={() => setIsEditOpen(true)}
              >
                <Edit3 size={14} /> Edit
              </button>
            )}

            <div className="flex justify-between items-start mb-0.5 mr-16">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">{event.name}</h1>
              <span className={`px-3 py-0.5 rounded-full border text-[10px] uppercase tracking-wider font-medium ${
                event.status === 'ongoing' ? 'bg-amber-50 border-amber-200 text-amber-600' : 
                event.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                event.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-600' :
                'bg-slate-50 border-slate-200 text-slate-600'}`}>
                {event.status}
              </span>
            </div>
            
            <p className="text-slate-400 text-xs mb-6 font-normal">ID: {event.id}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10 mb-6 border-b border-slate-50 pb-6">
              <InfoItem icon={<Calendar />} label="Date" value={formatDate(event.date)} />
              <InfoItem icon={<Clock />} label="Time" value={event.time_slot} capitalize />
              <InfoItem icon={<Clock />} label="Reporting" value={event.reporting_time} />
              <InfoItem icon={<Briefcase />} label="Type" value={event.work_type} capitalize />
              <div className="flex items-center gap-3 md:col-span-2 text-sm">
                <MapPin size={16} className="text-slate-400" />
                <span className="text-slate-500 font-normal">Location:</span>
                <a href={event.location_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-medium">View on Maps</a>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-100">
              <p className="text-xs mb-2 font-semibold text-slate-600 uppercase tracking-tight">Logistics & Extras</p>
              <div className="text-sm text-slate-600 flex flex-wrap gap-6">
                <span className="flex items-center gap-1">Transport: {event.transport_provided ? `Yes (${event.transport_type})` : "No"}</span>
                <span className="flex items-center gap-1">Extra Wage: ₹{event.extra_wage_amount}</span>
                {event.long_work && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">Long Work</span>}
              </div>
            </div>

            <p className="text-xs mb-3 font-semibold text-slate-600 uppercase tracking-tight">Required Workforce:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <WorkerStat label="Captains" count={event.required_captains} />
              <WorkerStat label="Sub-Captains" count={event.required_sub_captains} />
              <WorkerStat label="Main Boys" count={event.required_main_boys} />
              <WorkerStat label="Juniors" count={event.required_juniors} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4 border-t border-slate-100 pt-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Manage Event Lifecycle:</span>
              
              {!pendingStatus ? (
                <div className="flex gap-2">
                  {(event.status === 'upcoming' || event.status === 'ongoing') ? (
                    <select 
                      value={event.status} 
                      onChange={(e) => setPendingStatus(e.target.value)} 
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none min-w-[180px] shadow-sm cursor-pointer hover:border-slate-300"
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
                    <div className="flex items-center gap-2 text-slate-400 italic text-xs">
                      <CheckCircle2 size={14} /> 
                      Event is {event.status}. No further status changes possible.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm">
                    <AlertCircle size={14} className="text-amber-600" />
                    <span className="text-xs text-amber-700 font-bold uppercase tracking-tight">
                      Confirm "{pendingStatus}"?
                    </span>
                  </div>
                  <button 
                    onClick={confirmEventStatusUpdate} 
                    disabled={isUpdating} 
                    className="bg-emerald-600 text-white p-2 rounded-md hover:bg-emerald-700 shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  </button>
                  <button 
                    onClick={() => setPendingStatus(null)} 
                    className="bg-white border border-slate-200 text-slate-400 p-2 rounded-md hover:bg-slate-50 shadow-sm transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* --- ATTENDANCE TABLE & ALIGNED SUMMARY --- */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-10">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-500" />
                <h2 className="text-sm font-semibold text-slate-900">Attendance Management</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Search workers..." 
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none w-full md:w-40" 
                  onChange={(e) => { setSearchTerm(e.target.value); fetchBookings(e.target.value, filterStatus); }} 
                />
                <select 
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none bg-white font-medium text-slate-600 cursor-pointer" 
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

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50/30 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-100">
                    <th className="px-4 py-3 font-semibold w-12 text-center">No</th>
                    <th className="px-4 py-3 font-semibold w-auto">Worker</th> 
                    <th className="px-4 py-3 font-semibold w-28">Status</th>
                    <th className="px-4 py-3 font-semibold w-20">Base</th>
                    <th className="px-4 py-3 font-semibold w-20">EX</th>
                    <th className="px-4 py-3 font-semibold w-20">TA</th>
                    <th className="px-4 py-3 font-semibold w-20">DA</th>
                    <th className="px-4 py-3 font-semibold w-20 text-red-500">Fine</th>
                    <th className="px-4 py-3 font-semibold w-32 text-slate-900">Total Amount</th> 
                    <th className="px-4 py-3 font-semibold text-center w-32">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {localBookings.map((row, idx) => {
                    const originalRow = bookings.find(b => b.booking_id === row.booking_id);
                    const hasChanges = (
                        row.status !== originalRow?.status ||
                        Number(row.ta_amount) !== (originalRow?.ta_amount || 0) ||
                        Number(row.bonus_amount) !== (originalRow?.bonus_amount || 0) ||
                        Number(row.fine_amount) !== (originalRow?.fine_amount || 0)
                    );
                    const liveTotal = Number(row.base_amount) + Number(row.extra_amount) + Number(row.ta_amount) + Number(row.bonus_amount) - Number(row.fine_amount);

                    return (
                      <tr key={row.booking_id} className="border-b border-slate-50 hover:bg-slate-50/20">
                        <td className="px-4 py-3 text-slate-400 text-xs text-center">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 leading-none mb-1 truncate">{row.user_name}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-tight">{row.role}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            value={row.status} 
                            onChange={(e) => handleRowChange(row.booking_id, 'status', e.target.value)}
                            className={`text-[10px] font-bold rounded px-1.5 py-1 border focus:outline-none bg-white w-full cursor-pointer ${
                              row.status === 'completed' ? 'text-emerald-600 border-emerald-100' : 
                              row.status === 'present' ? 'text-blue-600 border-blue-100' : 'text-slate-500'}`}
                          >
                            <option value="booked">Booked</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-slate-500 italic">₹{row.base_amount}</td>
                        <td className="px-4 py-3 text-slate-500 italic">₹{row.extra_amount}</td>
                        <td className="px-4 py-3">
                          <input type="number" value={row.ta_amount} onChange={(e) => handleRowChange(row.booking_id, 'ta_amount', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs focus:border-blue-400 focus:outline-none" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" value={row.bonus_amount} onChange={(e) => handleRowChange(row.booking_id, 'bonus_amount', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs focus:border-blue-400 focus:outline-none" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" value={row.fine_amount} onChange={(e) => handleRowChange(row.booking_id, 'fine_amount', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-red-500 focus:border-red-400 focus:outline-none" />
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900 text-base italic">₹{liveTotal}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {confirmUpdateId === row.booking_id ? (
                               <div className="flex gap-1 animate-in zoom-in duration-200">
                                 <button onClick={() => saveRowUpdate(row)} className="bg-emerald-500 text-white p-1.5 rounded-md hover:bg-emerald-600 shadow-sm"><Check size={14} /></button>
                                 <button onClick={() => setConfirmUpdateId(null)} className="bg-slate-100 text-slate-400 p-1.5 rounded-md hover:bg-slate-200"><X size={14} /></button>
                               </div>
                            ) : (
                              <>
                                {hasChanges && (
                                  <button onClick={() => setConfirmUpdateId(row.booking_id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-sm">
                                    Update
                                  </button>
                                )}
                                <button onClick={() => removeWorker(row.booking_id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {summary && (
                  <tfoot className="bg-slate-900 text-white border-t-2 border-slate-800">
                    <tr className="font-bold">
                      <td className="px-4 py-4 text-center text-[10px] text-slate-500">Total workers</td>
                      <td className="px-4 py-4 text-sm font-medium">{summary.total_workers} </td>
                      <td className="px-4 py-4"></td> 
                      <td className="px-4 py-4 text-xs italic text-blue-300">₹{summary.total_base_amount}</td>
                      <td className="px-4 py-4 text-xs italic text-blue-300">₹{summary.total_extra_amount}</td>
                      <td className="px-4 py-4 text-xs text-blue-300">₹{summary.total_ta_amount}</td>
                      <td className="px-4 py-4 text-xs text-blue-300">₹{summary.total_bonus_amount}</td>
                      <td className="px-4 py-4 text-xs text-red-400">₹{summary.total_fine_amount}</td>
                      <td className="px-4 py-4 text-lg text-emerald-400 bg-slate-800 border-l border-slate-700" colSpan="2">
                        <span className="text-[9px] text-slate-400 uppercase block leading-none mb-1 tracking-tighter">Grand Total</span>
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

      <EventFormDrawer isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onRefresh={fetchEventDetails} editData={event} />
    </div>
  );
}

// Helpers remain unchanged
function InfoItem({ icon, label, value, capitalize }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400">{icon && React.cloneElement(icon, { size: 16 })}</span>
      <span className="text-slate-500 text-sm">{label}:</span>
      <span className={`text-sm font-medium text-slate-900 ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  );
}

function WorkerStat({ label, count }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
      <p className="text-slate-400 text-[10px] uppercase mb-0.5 tracking-tight font-semibold">{label}</p>
      <p className="text-lg font-medium text-slate-800">{count}</p>
    </div>
  );
}