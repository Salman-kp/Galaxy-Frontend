import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { X, Save, Loader2, Camera, CheckCircle2, AlertCircle } from "lucide-react";

export default function UpdateProfileForm({ currentData, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    branch: "",
    starting_point: "",
    blood_group: "O+",
    dob: ""
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (currentData) {
      setFormData({
        name: currentData.name || "",
        phone: currentData.phone || "",
        branch: currentData.branch || "",
        starting_point: currentData.starting_point || "",
        blood_group: currentData.blood_group || "O+",
        dob: currentData.dob ? currentData.dob.split('T')[0] : ""
      });
    }
  }, [currentData]);

  useEffect(() => {
    if (!photo) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(photo);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
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
      // Your backend uses /api/admin/profile based on usual patterns, 
      // but I'll use the endpoint provided in your previous snippet.
      const res = await api.put("/admin/profile", data);

      // STATUS 200: Green Notification
      setNotification({
        type: 'success',
        msg: res.data.message // Matches c.JSON(http.StatusOK, gin.H{"message": ...})
      });

      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1200);

    } catch (err) {
      // STATUS 400/500: Red Notification
      // This catches "no changes detected" or validation errors
      const backendMsg = err.response?.data?.message || err.response?.data?.error || "Connection Error";
      setNotification({
        type: 'error',
        msg: backendMsg
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-sm p-4">

      {/* Dynamic Notification Toast */}
      {notification && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-top-8 duration-300 ${
          notification.type === 'success' 
            ? 'bg-[#0F172A] border-emerald-500 text-emerald-400'
            : 'bg-[#0F172A] border-red-500 text-red-400'
          }`}>
          {notification.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
          <p className="text-[11px] font-bold uppercase tracking-wider">{notification.msg}</p>
        </div>
      )}

      {/* Form Container - set to max-w-sm for compact size */}
      <div className="bg-[#1E293B] w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">

        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#0F172A]/50">
          <h2 className="text-xs font-black text-white uppercase tracking-widest">Edit Profile</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div className="w-20 h-20 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden bg-[#0F172A] relative transition-all group-hover:border-blue-500">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                ) : currentData?.photo ? (
                  <img
                    src={`${import.meta.env.VITE_IMAGE_URL}/uploads/${currentData.photo}`}
                    className="w-full h-full object-cover"
                    alt="Current Profile"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?background=3b82f6&color=fff&name=${currentData?.name}`;
                    }}
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?background=3b82f6&color=fff&name=${currentData?.name}`}
                    className="w-full h-full object-cover"
                    alt="Avatar"
                  />
                )}

                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="text-white" size={20} />
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={e => {
                  if (e.target.files[0]) setPhoto(e.target.files[0]);
                }}
                accept="image/*"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
            <InputField label="Phone" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
            <InputField label="Branch" value={formData.branch} onChange={v => setFormData({...formData, branch: v})} />
            <InputField label="Point" value={formData.starting_point} onChange={v => setFormData({...formData, starting_point: v})} />

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/40 uppercase ml-1">Blood</label>
              <select
                value={formData.blood_group}
                onChange={e => setFormData({...formData, blood_group: e.target.value})} 
                className="w-full p-2.5 bg-[#0F172A] border border-white/5 rounded-xl text-[11px] font-bold text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              >
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/40 uppercase ml-1">DOB</label>
              <input
                type="date"
                value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})} 
                className="w-full p-2.5 bg-[#0F172A] border border-white/5 rounded-xl text-[11px] font-bold text-white outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-white/10 disabled:text-white/20"
          >
            {isUpdating ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>}
            {isUpdating ? "Saving..." : "Update Identity"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold text-white/40 uppercase ml-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full p-2.5 bg-[#0F172A] border border-white/5 rounded-xl text-[11px] font-bold text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
      />
    </div>
  );
}