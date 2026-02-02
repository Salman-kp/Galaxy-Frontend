import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Trash2, 
  XCircle, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Layers,
  Users
} from "lucide-react";

import api from "../../services/api";
import EventFormDrawer from "../../components/admin/events/EventFormDrawer";
import { useAuth } from "../../context/AuthContext";

export default function EventManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  const can = (permission) => user?.permissions?.includes(permission);
  
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("eventActiveTab") || "All";
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = sessionStorage.getItem("eventPageNumber");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });

  const itemsPerPage = 8;
  const tabs = ["All", "Ongoing", "Future", "Completed", "Cancelled"];

  // Effect to save state whenever they change
  useEffect(() => {
    sessionStorage.setItem("eventPageNumber", currentPage);
    sessionStorage.setItem("eventActiveTab", activeTab);
  }, [currentPage, activeTab]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/events");
      const sortedData = (data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(sortedData);
    } catch (err) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/events/${id}`);
      toast.success("Event deleted");
      setConfirmDeleteId(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date).toDateString();
    const today = new Date().toDateString();

    switch (activeTab) {
      case "Ongoing":   return event.status === "ongoing" || eventDate === today;
      case "Future":    return event.status === "upcoming" && eventDate !== today;
      case "Completed": return event.status === "completed";
      case "Cancelled": return event.status === "cancelled";
      default:          return true;
    }
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const openDrawer = (event = null) => {
    setEditingEvent(event);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-[72px] p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER - Responsive alignment */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">Event Logistics</h1>
            <p className="text-xs text-gray-500 mt-1">System deployment and workforce scheduling registry.</p>
          </div>
          
          {can("event:create") && (
            <button 
              onClick={() => openDrawer()}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-black px-6 py-3 sm:py-2 rounded-full flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg"
            >
              <Plus size={14} strokeWidth={3} /> Create Event
            </button>
          )}
        </header>

        {/* TABS - Scrollable on small screens */}
        <div className="overflow-x-auto no-scrollbar mb-8">
          <div className="flex bg-[#111114] p-1 rounded-xl border border-white/5 w-max sm:w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`px-4 md:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? "bg-white/10 text-white shadow-inner" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT CONTAINER */}
        <div className="bg-[#111114] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Layers size={14} className="text-blue-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{activeTab} Event Log</h3>
            </div>
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
              {filteredEvents.length} Entries Detected
            </span>
          </div>

          {/* DESKTOP TABLE - Hidden on Mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/20">
                  {["Event Name", "Date", "Time", "Type", "Workers", "Status", "Actions"].map((head, i) => (
                    <th key={head} className={`px-6 py-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ${i === 4 ? 'text-center' : i === 6 ? 'text-right' : ''}`}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {loading ? (
                  <tr><td colSpan="7" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                ) : currentEvents.length === 0 ? (
                  <tr><td colSpan="7" className="py-20 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">No matching records found</td></tr>
                ) : currentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5 text-xs font-bold text-gray-200 capitalize">{event.name}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-400">
                        <CalendarIcon size={12} className="text-blue-500" />
                        <span className="text-[10px] font-bold">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase">
                      <div className="flex items-center gap-2"><Clock size={12} className="text-blue-500" /> {event.time_slot}</div>
                    </td>
                    <td className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase">{event.work_type}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="bg-white/5 text-gray-300 px-2 py-1 rounded border border-white/5 text-[10px] font-black">
                        {event.required_captains + event.required_sub_captains + event.required_main_boys + event.required_juniors}
                      </span>
                    </td>
                    <td className="px-6 py-5"><StatusBadge status={event.status} /></td>
                    <td className="px-6 py-5 text-right"><ActionButtons event={event} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} handleDelete={handleDelete} can={can} openDrawer={openDrawer} navigate={navigate} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST VIEW - Hidden on Desktop */}
          <div className="md:hidden divide-y divide-white/[0.05]">
            {loading ? (
              <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
            ) : currentEvents.length === 0 ? (
              <div className="py-20 text-center text-gray-600 text-[10px] font-bold uppercase">No matching records found</div>
            ) : currentEvents.map((event) => (
              <div key={event.id} className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-gray-200 capitalize">{event.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">{event.work_type}</p>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400">
                    <CalendarIcon size={12} className="text-blue-500" />
                    <span className="text-[10px] font-bold">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={12} className="text-blue-500" />
                    <span className="text-[10px] font-bold uppercase">{event.time_slot}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users size={12} className="text-blue-500" />
                    <span className="text-[10px] font-bold">{event.required_captains + event.required_sub_captains + event.required_main_boys + event.required_juniors} Workers</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                   <ActionButtons event={event} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} handleDelete={handleDelete} can={can} openDrawer={openDrawer} navigate={navigate} isMobile={true} />
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION - Mobile Responsive */}
          {!loading && filteredEvents.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between bg-black/20 gap-4">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">
                Nodes {((currentPage - 1) * itemsPerPage) + 1}—{Math.min(currentPage * itemsPerPage, filteredEvents.length)} / {filteredEvents.length}
              </p>
              <div className="flex gap-4 sm:gap-2 w-full sm:w-auto justify-center">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)} 
                  className="flex-1 sm:flex-none p-2 rounded-lg border border-white/10 bg-white/5 disabled:opacity-20 text-gray-400 flex justify-center"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => prev + 1)} 
                  className="flex-1 sm:flex-none p-2 rounded-lg border border-white/10 bg-white/5 disabled:opacity-20 text-gray-400 flex justify-center"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(can("event:create") || can("event:edit")) && (
        <EventFormDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          onRefresh={fetchEvents} 
          editData={editingEvent}
        />
      )}
    </div>
  );
}

// Sub-component for buttons to keep code clean
function ActionButtons({ event, confirmDeleteId, setConfirmDeleteId, handleDelete, can, openDrawer, navigate, isMobile = false }) {
  if (confirmDeleteId === event.id) {
    return (
      <div className="flex items-center gap-1 bg-red-500/10 p-1 rounded-lg border border-red-500/20">
        <button onClick={() => handleDelete(event.id)} className="bg-red-600 text-white px-3 py-1.5 rounded text-[9px] font-black uppercase">Confirm</button>
        <button onClick={() => setConfirmDeleteId(null)} className="text-gray-400 p-1"><XCircle size={16} /></button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${!isMobile && 'justify-end'}`}>
      <button
        onClick={() => navigate(`/admin/events/${event.id}`)}
        className="bg-white/5 border border-white/10 text-gray-400 px-4 py-2 sm:py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all">
        Details
      </button>
      
      {event.status === "upcoming" && (
        <div className={`flex items-center gap-1 ${!isMobile && 'md:opacity-0 group-hover:opacity-100'} transition-opacity`}>
          {can("event:edit") && (
            <button onClick={() => openDrawer(event)} className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
              <Edit3 size={16} />
            </button>
          )}
          {can("event:delete") && (
            <button onClick={() => setConfirmDeleteId(event.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
              <Trash2 size={16}/>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ongoing: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    completed: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    cancelled: "text-red-500 bg-red-500/10 border-red-500/20",
    upcoming: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.15em] border whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
}