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
  ChevronRight 
} from "lucide-react";

import api from "../../services/api";
import EventFormDrawer from "../../components/admin/events/EventFormDrawer";

export default function EventManagement() {
  const navigate = useNavigate();
  
  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // PERSISTENCE LOGIC: Read from Session Storage on initial load
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
      const { data } = await api.get("/api/admin/events");
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
      await api.delete(`/api/admin/events/${id}`);
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const openDrawer = (event = null) => {
    setEditingEvent(event);
    setIsDrawerOpen(true);
  };

  // Helper to handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Events</h1>
            <p className="text-sm text-slate-500 mt-1">Manage all workforce events</p>
          </div>
          <button 
            onClick={() => openDrawer()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={18} /> Create Event
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-4">
        {/* Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 mb-8 w-full shadow-sm overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Table */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-lg font-bold text-slate-900">{activeTab} Events</h3>
            <p className="text-xs text-slate-500 font-medium">{filteredEvents.length} event(s) found</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20">
                  {["Event Name", "Date", "Time", "Type", "Workers", "Status", "Actions"].map((head, i) => (
                    <th key={head} className={`px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest ${i === 4 ? 'text-center' : i === 6 ? 'text-right' : ''}`}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="7" className="py-20 text-center text-slate-400">Loading events...</td></tr>
                ) : currentEvents.length === 0 ? (
                  <tr><td colSpan="7" className="py-20 text-center text-slate-400">No events found for this category.</td></tr>
                ) : currentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 text-sm font-bold text-slate-900">{event.name}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CalendarIcon size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold capitalize">
                        <Clock size={14} className="text-slate-400" /> {event.time_slot}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-medium text-slate-500 capitalize">{event.work_type}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {event.required_captains + event.required_sub_captains + event.required_main_boys + event.required_juniors}
                      </span>
                    </td>
                    <td className="px-6 py-5"><StatusBadge status={event.status} /></td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {confirmDeleteId !== event.id ? (
                          <>
                         <button
                             onClick={() => navigate(`/admin/events/${event.id}`)}
                             className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm">
                             Details
                         </button>
                            {event.status === "upcoming" && (
                              <>
                                <button onClick={() => openDrawer(event)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                                  <Edit3 size={16} />
                                </button>
                                <button onClick={() => setConfirmDeleteId(event.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                  <Trash2 size={16}/>
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-100 animate-in fade-in zoom-in duration-200">
                            <span className="text-[9px] font-black uppercase text-rose-600 px-2">Confirm?</span>
                            <button onClick={() => handleDelete(event.id)} className="bg-rose-600 text-white p-1.5 rounded-lg hover:bg-rose-700 shadow-sm"><Trash2 size={13} /></button>
                            <button onClick={() => setConfirmDeleteId(null)} className="bg-white text-slate-400 p-1.5 rounded-lg border border-slate-200"><XCircle size={13} /></button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredEvents.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
              <p className="text-xs text-slate-500 font-medium">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length}
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)} 
                  className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i + 1)} 
                      className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => prev + 1)} 
                  className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <EventFormDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onRefresh={fetchEvents} 
        editData={editingEvent}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ongoing: "bg-amber-50 text-amber-600 border-amber-100",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
    upcoming: "bg-blue-50 text-blue-600 border-blue-100"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
}