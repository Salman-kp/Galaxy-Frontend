import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import api from "../../../services/api";
import { toast } from "react-hot-toast";

export default function EventFormDrawer({ isOpen, onClose, onRefresh, editData = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time_slot: "morning",
    reporting_time: "",
    work_type: "",
    location_link: "",
    required_captains: 1,
    required_sub_captains: 0,
    required_main_boys: 0,
    required_juniors: 0,
    long_work: false,
    transport_provided: false,
    transport_type: "bus",
    extra_wage_amount: 0,
  });

  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        ...editData,
        date: editData.date ? new Date(editData.date).toISOString().split('T')[0] : "",
      });
    } else if (!editData && isOpen) {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "", date: "", time_slot: "morning", reporting_time: "",
      work_type: "", location_link: "", required_captains: 1,
      required_sub_captains: 0, required_main_boys: 0, required_juniors: 0,
      long_work: false, transport_provided: false, transport_type: "bus",
      extra_wage_amount: 0,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    if (name.startsWith("required_") || name === "extra_wage_amount") {
      val = parseInt(val) || 0;
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: val };
      if (name === "long_work" && !val) {
        newData.extra_wage_amount = 0;
        newData.transport_provided = false;
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (formData.long_work && (!formData.extra_wage_amount || formData.extra_wage_amount <= 0)) {
      return toast.error("Please provide an extra wage amount for long work sessions.");
    }

    setLoading(true);
    try {
      const payload = { ...formData, date: new Date(formData.date).toISOString() };
      
      let response;
      if (editData) {
        response = await api.put(`/admin/events/${editData.id}`, payload);
        toast.success(response.data?.message || "Event updated successfully");
      } else {
        response = await api.post("/admin/events", payload);
        toast.success(response.data?.message || "Event created successfully");
      }
      
      onRefresh();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to save event";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .custom-black-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-black-scrollbar::-webkit-scrollbar-track {
          background: #000000;
        }
        .custom-black-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-black-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2">
        <div className="w-full max-w-lg max-h-[90vh] bg-black rounded-xl shadow-2xl flex flex-col overflow-hidden border border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-5 py-3 border-b border-zinc-800 flex justify-between items-center bg-black">
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {editData ? "Edit Event" : "Create Event"}
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                {editData ? `ID: ${editData.id}` : "Management Dashboard"}
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-zinc-900 rounded-md transition-colors text-zinc-400">
              <X size={18} />
            </button>
          </div>

          {/* Form Body - With Black Scrollbar */}
          <form 
            onSubmit={handleSubmit} 
            className="flex-1 overflow-y-auto p-5 space-y-4 custom-black-scrollbar"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Event Name / Place</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[13px] text-white outline-none focus:border-blue-600 transition-all" placeholder="Location name" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Date</label>
                <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[13px] text-white outline-none focus:border-blue-600 [color-scheme:dark]" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Time Slot</label>
                <select name="time_slot" value={formData.time_slot} onChange={handleChange} className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[13px] text-white outline-none focus:border-blue-600">
                  <option value="morning">Morning</option>
                  <option value="lunch">Lunch</option>
                  <option value="night">Night</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Reporting Time</label>
                <input required type="time" name="reporting_time" value={formData.reporting_time} onChange={handleChange} className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[13px] text-white outline-none focus:border-blue-600 [color-scheme:dark]" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Work Type</label>
                <input required name="work_type" value={formData.work_type} onChange={handleChange} className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[13px] text-white outline-none focus:border-blue-600" placeholder="e.g. Catering" />
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Maps Link</label>
                <input name="location_link" value={formData.location_link} onChange={handleChange} className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[13px] text-white outline-none focus:border-blue-600" placeholder="Maps URL" />
              </div>
            </div>

            {/* Manpower Section */}
            <div className="pt-3 border-t border-zinc-900">
              <h3 className="text-[11px] font-bold text-blue-500 mb-2 uppercase tracking-widest">Requirements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Captains", key: "required_captains" },
                  { label: "Sub-Caps", key: "required_sub_captains" },
                  { label: "Main Boys", key: "required_main_boys" },
                  { label: "Juniors", key: "required_juniors" }
                ].map(item => (
                  <div key={item.key} className="space-y-1 p-2 bg-zinc-900 rounded border border-zinc-800">
                    <label className="text-[8px] font-bold text-zinc-500 uppercase">{item.label}</label>
                    <input type="number" min="0" name={item.key} value={formData[item.key]} onChange={handleChange} className="w-full bg-transparent text-[13px] font-bold text-white outline-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-3 border-t border-zinc-900">
              <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                <div>
                  <p className="text-[12px] font-bold text-white leading-none">Long Work</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Extra hours / Dinner included</p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleChange({ target: { name: 'long_work', type: 'checkbox', checked: !formData.long_work }})}
                  className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${formData.long_work ? 'bg-blue-600' : 'bg-zinc-700'}`}
                >
                  <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-200 ${formData.long_work ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {formData.long_work && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg animate-in slide-in-from-top-1">
                  <div className="flex items-center justify-between col-span-2 px-1">
                    <p className="text-[11px] font-bold text-zinc-300">Transport Required?</p>
                    <button 
                      type="button"
                      onClick={() => handleChange({ target: { name: 'transport_provided', type: 'checkbox', checked: !formData.transport_provided }})}
                      className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 ${formData.transport_provided ? 'bg-blue-600' : 'bg-zinc-700'}`}
                    >
                      <div className={`bg-white w-3 h-3 rounded-full transform transition-transform duration-200 ${formData.transport_provided ? 'translate-x-3' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  {formData.transport_provided && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase">Type</label>
                      <select name="transport_type" value={formData.transport_type} onChange={handleChange} className="w-full px-2 py-1 bg-black border border-zinc-800 rounded text-[11px] text-white outline-none focus:border-blue-600">
                        <option value="bus">Bus</option>
                        <option value="train">Train</option>
                      </select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Extra Wage (₹)</label>
                    <input type="number" name="extra_wage_amount" value={formData.extra_wage_amount} onChange={handleChange} className="w-full px-2 py-1 bg-black border border-zinc-800 rounded text-[11px] text-white outline-none focus:border-blue-600" />
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Action Button */}
          <div className="p-4 border-t border-zinc-800 bg-black">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] rounded-lg shadow-lg flex justify-center items-center transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : editData ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}