import React, { useState, useEffect } from "react";
import { X, Camera } from "lucide-react";
import api from "../../../services/api";

export default function UserFormDrawer({ isOpen, onClose, userData, onSuccess, onError }) {
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
  const [preview, setPreview] = useState(null);

  // 1. CRITICAL FIX: Memory Management for Image Previews
  // Without this, every time you pick an image, a memory leak occurs.
  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photo);
    setPreview(objectUrl);
    
    // Cleanup function to free memory when component unmounts or photo changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  // 2. Sync form state with incoming userData
  useEffect(() => {
    if (userData) {
      const formattedDob = userData.dob ? userData.dob.split('T')[0] : "";
      setFormData({ 
        name: userData.name || "",
        phone: userData.phone || "",
        password: "", // Security: Never fill the password field on edit
        role: userData.role || "main_boy",
        branch: userData.branch || "",
        starting_point: userData.starting_point || "",
        blood_group: userData.blood_group || "O+",
        dob: formattedDob,
        status: userData.status || "active"
      });
    } else {
      setFormData(initialForm);
    }
    setPhoto(null);
  }, [userData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare JSON payload for the backend
    const jsonPayload = {
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      branch: formData.branch,
      starting_point: formData.starting_point,
      blood_group: formData.blood_group,
      dob: formData.dob,
    };

    // Logic: New users need password, existing users need status updates
    if (!userData) {
      jsonPayload.password = formData.password;
    } else {
      jsonPayload.status = formData.status;
    }

    const data = new FormData();
    // Appending the JSON string as expected by your Go backend
    data.append("json", JSON.stringify(jsonPayload));
    
    if (photo) {
      data.append("photo", photo);
    }

    try {
      if (userData) {
        await api.put(`/api/admin/users/${userData.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post("/api/admin/users", data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Operation failed";
      if (onError) onError(errMsg);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end bg-black/10 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`w-full max-w-sm bg-white h-screen p-8 shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold tracking-tight">
            {userData ? `Edit Details: ${userData.name}` : 'Create New User'}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
          >
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pb-10">
          {/* Avatar Upload Section */}
          <div className="flex justify-center mb-6">
            <div className="relative h-24 w-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden hover:border-[#B2DFDB] transition-all cursor-pointer group shadow-sm">
              {preview ? (
                <img src={preview} className="h-full w-full object-cover" alt="preview" />
              ) : userData?.photo ? (
                <img src={`http://localhost:8080/uploads/${userData.photo}`} className="h-full w-full object-cover" alt="profile" />
              ) : (
                <div className="flex flex-col items-center">
                   <Camera className="text-gray-300 group-hover:text-[#B2DFDB] transition-colors" size={28} />
                   <span className="text-[8px] font-bold text-gray-300 uppercase mt-1">Upload</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setPhoto(e.target.files[0])} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-2 focus:ring-[#B2DFDB]/20 outline-none transition-all" placeholder="Enter name" required />
            </div>
            
            {/* Phone Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-2 focus:ring-[#B2DFDB]/20 outline-none transition-all" placeholder="10-digit mobile" required />
            </div>

            {/* Password - Only shown on Create */}
            {!userData && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Initial Password</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-2 focus:ring-[#B2DFDB]/20 outline-none transition-all" placeholder="Security key" required />
              </div>
            )}

            {/* Branch & Starting Point */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Branch</label>
                <input type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-2 focus:ring-[#B2DFDB]/20 outline-none" placeholder="Location" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Starting Point</label>
                <input type="text" value={formData.starting_point} onChange={e => setFormData({...formData, starting_point: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-2 focus:ring-[#B2DFDB]/20 outline-none" placeholder="City" />
              </div>
            </div>

            {/* Blood Group & DOB */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Blood Group</label>
                <select value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-semibold outline-none cursor-pointer border-none focus:ring-2 focus:ring-[#B2DFDB]/20">
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-none font-medium text-xs focus:ring-2 focus:ring-[#B2DFDB]/20 outline-none" />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Access Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-semibold outline-none cursor-pointer border-none focus:ring-2 focus:ring-[#B2DFDB]/20">
                <option value="captain">Captain</option>
                <option value="sub_captain">Sub Captain</option>
                <option value="main_boy">Main Boy</option>
                <option value="junior_boy">Junior Boy</option>
              </select>
            </div>

            {/* Status Selection - Only shown on Edit */}
            {userData && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-semibold outline-none cursor-pointer border-none focus:ring-2 focus:ring-[#B2DFDB]/20">
                  <option value="active">Active</option>
                  <option value="blocked">Blocked / Suspended</option>
                </select>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black active:scale-[0.98] transition-all mt-6 shadow-lg shadow-gray-200"
          >
            {userData ? 'Save Changes' : 'Register Member'}
          </button>
        </form>
      </div>
    </div>
  );
}