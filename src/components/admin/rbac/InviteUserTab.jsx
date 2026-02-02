import React, { useState, useEffect } from "react";
import { Camera, Send, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../../services/api";

export default function InviteUserTab() {
  const initialForm = {
    name: "",
    phone: "",
    password: "",
    role: "admin",
    branch: "",
    starting_point: "",
    blood_group: "O+",
    dob: "",
    admin_role_id: ""
  };

  const [formData, setFormData] = useState(initialForm);
  const [subRoles, setSubRoles] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Styling: Reduced padding (8px) and font size (12px) to minimize height
  const fieldStyles = `
    .rbac-input {
      width: 100%;
      background-color: #0d0d0d;
      border: 1px solid #1a1a1a;
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 12px;
      color: #ffffff;
      transition: all 0.2s ease;
      outline: none;
    }
    .rbac-input:focus { border-color: #333; background-color: #111; }
    .rbac-label {
      display: block;
      font-size: 10px;
      color: #666;
      margin-bottom: 4px;
      font-weight: 500;
      letter-spacing: 0.01em;
      text-transform: uppercase;
    }
  `;

  useEffect(() => {
    const fetchSubRoles = async () => {
      try {
        const { data } = await api.get("/admin/rbac/roles");
        setSubRoles(data || []);
      } catch (err) {
        toast.error("Failed to sync security roles");
      }
    };
    fetchSubRoles();
  }, []);

  useEffect(() => {
    if (!photo) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(photo);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.admin_role_id) return toast.error("Please assign clearance");
    setLoading(true);
    const data = new FormData();
    const jsonPayload = { ...formData, admin_role_id: parseInt(formData.admin_role_id) };
    data.append("json", JSON.stringify(jsonPayload));
    if (photo) data.append("photo", photo);
    try {
      await api.post("/admin/rbac/users/invite", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Admin initialized");
      setFormData(initialForm);
      setPhoto(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <style>{fieldStyles}</style>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Create Administrator</h3>
        <p className="text-xs text-gray-500">Initialize identity with security clearance.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Identity - Smaller padding/size */}
        <div className="flex items-center gap-4 p-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg w-fit">
          <div className="relative h-11 w-11 rounded-full bg-black border border-[#222] flex items-center justify-center overflow-hidden cursor-pointer">
            {preview ? (
              <img src={preview} className="h-full w-full object-cover" alt="p" />
            ) : (
              <Camera size={16} className="text-gray-600" />
            )}
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Identity Image</p>
            <p className="text-[9px] text-gray-600">JPG/PNG only</p>
          </div>
        </div>

        {/* Condensed Grid: Reduced gap-y from 5 to 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3">
          <div className="space-y-1">
            <label className="rbac-label">Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full name" className="rbac-input" />
          </div>

          <div className="space-y-1">
            <label className="rbac-label">Phone</label>
            <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Mobile" className="rbac-input" />
          </div>

          <div className="space-y-1">
            <label className="rbac-label">Security Key</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="rbac-input" />
          </div>

          <div className="space-y-1">
            <label className="rbac-label">Clearance</label>
            <select 
              required value={formData.admin_role_id}
              onChange={e => setFormData({...formData, admin_role_id: e.target.value})}
              className="rbac-input text-blue-400 cursor-pointer"
            >
              <option value="" disabled className="bg-black">Select...</option>
              {subRoles.map(role => (
                <option key={role.id} value={role.id} className="bg-black text-white">{role.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="rbac-label">Date of Birth</label>
            <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="rbac-input" style={{ colorScheme: 'dark' }} />
          </div>

          <div className="space-y-1">
            <label className="rbac-label">Blood Group</label>
            <select value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} className="rbac-input cursor-pointer">
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                <option key={bg} value={bg} className="bg-black">{bg}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 lg:col-span-1">
            <label className="rbac-label">Branch</label>
            <input type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} placeholder="Branch" className="rbac-input" />
          </div>

          <div className="space-y-1 lg:col-span-2">
            <label className="rbac-label">Starting Point</label>
            <input type="text" value={formData.starting_point} onChange={e => setFormData({...formData, starting_point: e.target.value})} placeholder="Primary Location" className="rbac-input" />
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" disabled={loading}
            className="w-full sm:w-auto px-8 py-2.5 bg-[#78c8d2] text-black rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={12} />}
            Create
          </button>
        </div>
      </form>
    </div>
  );
}