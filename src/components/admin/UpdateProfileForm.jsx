import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { X, Save, Loader2, Camera, CheckCircle2, AlertCircle } from "lucide-react";

export default function UpdateProfileForm({ currentData, onClose, onRefresh }) {
  // Use currentData to set initial state
  const [formData, setFormData] = useState({
    name: currentData?.name || "",
    phone: currentData?.phone || "",
    branch: currentData?.branch || "",
    starting_point: currentData?.starting_point || "",
    blood_group: currentData?.blood_group || "O+",
    dob: currentData?.dob ? currentData.dob.split('T')[0] : ""
  });
  
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState(null); 

  useEffect(() => {
    if (!photo) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(photo);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const jsonPayload = {
      name: formData.name,
      phone: formData.phone,
      branch: formData.branch,
      starting_point: formData.starting_point,
      blood_group: formData.blood_group,
      dob: formData.dob,
    };

    const data = new FormData();
    data.append("json", JSON.stringify(jsonPayload));
    if (photo) data.append("photo", photo);

    try {
      const res = await api.put("/api/admin/profile", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setNotification({ 
        type: 'success', 
        msg: res.data.message || res.data.msg || "Success" 
      });
     setTimeout(() => {
        onRefresh(); 
        onClose();
      }, 1200);
    } catch (err) {
      const backendError = err.response?.data?.error || err.response?.data?.message || "Update failed";
      setNotification({ 
        type: 'error', 
        msg: backendError 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      
      {notification && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border animate-in slide-in-from-top-4 ${
          notification.type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-red-100 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-500"/> : <AlertCircle size={18} className="text-red-500"/>}
          <p className="text-sm font-semibold">{notification.msg}</p>
        </div>
      )}

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Admin Profile</h2>
            <p className="text-xs text-slate-500 font-medium">Update your system identity</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex justify-center mb-8">
             <label className="relative cursor-pointer group">
               <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 relative">
                 {preview ? (
                 <img src={preview} className="w-full h-full object-cover" alt="New Preview" />
                 ) : (
                 <img 
                   src={currentData?.photo ? `http://localhost:8080/uploads/${currentData.photo}` : `https://ui-avatars.com/api/?name=${currentData?.name}`} 
                   className="w-full h-full object-cover" 
                   alt="Current Profile" 
                 />
                 )}
                 <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="text-indigo-600" size={24} />
                 </div>
                </div>
                  <input type="file" className="hidden" onChange={e => setPhoto(e.target.files[0])} accept="image/*" />
             </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
            <InputField label="Phone" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
            <InputField label="Branch" value={formData.branch} onChange={v => setFormData({...formData, branch: v})} />
            <InputField label="Point" value={formData.starting_point} onChange={v => setFormData({...formData, starting_point: v})} />

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Blood Group</label>
              <select 
                value={formData.blood_group} 
                onChange={e => setFormData({...formData, blood_group: e.target.value})} 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none"
              >
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">DOB</label>
              <input 
                type="date" 
                value={formData.dob} 
                onChange={e => setFormData({...formData, dob: e.target.value})} 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isUpdating}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:bg-slate-300"
          >
            {isUpdating ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
            {isUpdating ? "Syncing..." : "Update Records"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none" 
      />
    </div>
  );
}