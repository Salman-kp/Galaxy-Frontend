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
        response = await api.put(`/api/admin/events/${editData.id}`, payload);
        toast.success(response.data?.message || "Event updated successfully");
      } else {
        response = await api.post("/api/admin/events", payload);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Changes based on editData presence */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editData ? "Editing the Event" : "Create Event"}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              {editData ? `Event ID: ${editData.id}` : "Logistics Dashboard"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Event Name / Place</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-[13px] outline-none" placeholder="Enter location or name" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date</label>
              <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-[13px] outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Time Slot</label>
              <select name="time_slot" value={formData.time_slot} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-[13px] outline-none">
                <option value="morning">Morning</option>
                <option value="lunch">Lunch</option>
                <option value="night">Night</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Reporting Time</label>
              <input required type="time" name="reporting_time" value={formData.reporting_time} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-[13px] outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Work Type</label>
              <input required name="work_type" value={formData.work_type} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-[13px] outline-none" placeholder="e.g. Catering" />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Maps Link</label>
              <input name="location_link" value={formData.location_link} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-[13px] outline-none" placeholder="Maps URL" />
            </div>
          </div>

          {/* Manpower Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-[12px] font-bold text-slate-900 mb-3 uppercase tracking-tighter">Manpower Requirements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Captains", key: "required_captains" },
                { label: "Sub-Caps", key: "required_sub_captains" },
                { label: "Main Boys", key: "required_main_boys" },
                { label: "Juniors", key: "required_juniors" }
              ].map(item => (
                <div key={item.key} className="space-y-1 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">{item.label}</label>
                  <input type="number" min="0" name={item.key} value={formData[item.key]} onChange={handleChange} className="w-full bg-transparent text-[14px] font-bold text-slate-700 outline-none" />
                </div>
              ))}
            </div>
          </div>

          {/* Long Work & Transport Toggles */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-[13px] font-bold text-slate-800 leading-none">Long Work</p>
                <p className="text-[10px] text-slate-400 mt-1">Extra hours / Dinner included</p>
              </div>
              <button 
                type="button"
                onClick={() => handleChange({ target: { name: 'long_work', type: 'checkbox', checked: !formData.long_work }})}
                className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors duration-200 ${formData.long_work ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-200 ${formData.long_work ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {formData.long_work && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/30 border border-blue-100 rounded-xl animate-in slide-in-from-top-1">
                <div className="flex items-center justify-between col-span-2 px-1">
                  <p className="text-[12px] font-bold text-slate-700">Transport Required?</p>
                  <button 
                    type="button"
                    onClick={() => handleChange({ target: { name: 'transport_provided', type: 'checkbox', checked: !formData.transport_provided }})}
                    className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${formData.transport_provided ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`bg-white w-3.5 h-3.5 rounded-full transform transition-transform duration-200 ${formData.transport_provided ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </button>
                </div>
                {formData.transport_provided && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Type</label>
                    <select name="transport_type" value={formData.transport_type} onChange={handleChange} className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-[12px] outline-none">
                      <option value="bus">Bus</option>
                      <option value="train">Train</option>
                    </select>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Extra Wage (₹)</label>
                  <input type="number" name="extra_wage_amount" value={formData.extra_wage_amount} onChange={handleChange} className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-[12px] outline-none" />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Sticky Footer Action */}
        <div className="p-5 border-t border-slate-100 bg-white">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] rounded-xl shadow-lg shadow-blue-100 flex justify-center items-center transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : editData ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}