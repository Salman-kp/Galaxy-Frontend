import React, { useState, useEffect } from "react";
import { X, Camera } from "lucide-react";
import api from "../../../services/api";

export default function UserFormDrawer({ isOpen, onClose, userData, onSuccess }) {
  const initialForm = {
    name: "",
    phone: "",
    password: "",
    role: "main_boy",
    branch: "",
    starting_point: "",
    blood_group: "O+",
    dob: "",
    status: "active"
  };

  const [formData, setFormData] = useState(initialForm);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (userData) {
      // Clean the date format if it comes from the DB as ISO string
      const formattedDob = userData.dob ? userData.dob.split('T')[0] : "";
      setFormData({ ...userData, dob: formattedDob });
    } else {
      setFormData(initialForm);
    }
    setPhoto(null);
  }, [userData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Append all form fields to FormData
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });
    
    if (photo) data.append("photo", photo);

    try {
      if (userData) {
        await api.put(`/api/admin/users/${userData.id}`, data);
      } else {
        await api.post("/api/admin/users", data);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Operation failed. Please check the fields.");
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end bg-black/10 backdrop-blur-[2px] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`w-full max-w-sm bg-white h-screen p-8 shadow-2xl transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold tracking-tight">{userData ? 'Edit' : 'New'} Staff member</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg transition-colors"><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pb-10">
          {/* Photo Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative h-20 w-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden hover:border-[#B2DFDB] transition-all cursor-pointer group shadow-sm">
              {photo ? (
                <img src={URL.createObjectURL(photo)} className="h-full w-full object-cover" />
              ) : userData?.photo ? (
                <img src={`/uploads/${userData.photo}`} className="h-full w-full object-cover" />
              ) : (
                <Camera className="text-gray-300 group-hover:text-gray-500" size={24} />
              )}
              <input type="file" onChange={(e) => setPhoto(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Name & Phone */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-1 focus:ring-[#B2DFDB] outline-none" placeholder="e.g. John Doe" required />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-1 focus:ring-[#B2DFDB] outline-none" placeholder="9988..." required />
            </div>

            {/* Password - Only shown for NEW users */}
            {!userData && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Initial Password</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-1 focus:ring-[#B2DFDB] outline-none" required />
              </div>
            )}

            {/* Branch & Starting Point */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Branch</label>
                <input type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-1 focus:ring-[#B2DFDB] outline-none" placeholder="Branch location" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Starting Point</label>
                <input type="text" value={formData.starting_point} onChange={e => setFormData({...formData, starting_point: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-1 focus:ring-[#B2DFDB] outline-none" placeholder="City" />
              </div>
            </div>

            {/* Blood Group & DOB */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Blood Group</label>
                <select value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-semibold outline-none cursor-pointer">
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-1 focus:ring-[#B2DFDB] outline-none" />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Access Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-semibold outline-none cursor-pointer">
                <option value="admin">Administrator</option>
                <option value="captain">Captain</option>
                <option value="sub_captain">Sub Captain</option>
                <option value="main_boy">Main Boy</option>
                <option value="junior_boy">Junior Boy</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all mt-6 shadow-md shadow-gray-200">
            {userData ? 'Sync Changes' : 'Register Member'}
          </button>
        </form>
      </div>
    </div>
  );
}