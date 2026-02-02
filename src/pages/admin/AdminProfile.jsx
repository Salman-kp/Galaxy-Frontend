import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { 
  User, Phone, MapPin, Droplets, Calendar, 
  Building2, Edit3, ShieldCheck, Loader2 
} from "lucide-react";
import UpdateProfileForm from "../../components/admin/UpdateProfileForm";

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/profile");
      setProfile(res.data);
    } catch (err) {
      console.error("Profile fetch error", err);
    } finally {
      setLoading(false);
    }
  };
  const hasPermission = (permission) => {
    return profile?.permissions?.includes(permission);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c]">
      <Loader2 className="animate-spin text-blue-600 mb-3" size={28} />
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">Authenticating...</span>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
      <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-xl text-red-500 text-sm font-medium">
        Failed to connect to identity service.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-8">
          <div>
             <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">Profile</h1>
            <p className="text-xs text-gray-500">Manage identity and credentials.</p>
          </div>
        
        {hasPermission("profile:edit") && (
            <button 
              onClick={() => setShowUpdate(true)}
              className="flex items-center gap-2 bg-blue-600 text-black hover:bg-gray-200 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
            >
              <Edit3 size={14} /> Edit Profile
            </button>
          )}
        </div>

        <div className="bg-[#111114] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="relative">
                <img 
                  src={profile.photo ? `http://localhost:8080/uploads/${profile.photo}` : "https://ui-avatars.com/api/?background=1d1d21&color=fff&name=" + profile.name} 
                  className="w-28 h-28 rounded-xl object-cover grayscale-[0.3] border border-white/10"
                  alt="Admin"
                />
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-xl border-2 border-[#111114]">
                  <ShieldCheck size={16} />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full mb-2">
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.1em] text-gray-400">{profile.role}</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter mb-1 capitalize">{profile.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500">
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  <Building2 size={13} className="text-blue-500" /> {profile.branch || "Global Command"}
                </p>
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  <MapPin size={13} className="text-blue-500" /> {profile.starting_point || "Undisclosed"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          <DetailCard label="Contact Line" icon={<Phone size={14}/>} value={profile.phone} />
          <DetailCard label="Blood Type" icon={<Droplets size={14}/>} value={profile.blood_group} />
          <DetailCard label="Date of Birth" icon={<Calendar size={14}/>} value={new Date(profile.dob).toLocaleDateString()} />
          <DetailCard label="Joined Registry" icon={<Calendar size={14}/>} value={new Date(profile.joined_at).toLocaleDateString()} />
          <DetailCard label="Deployment" icon={<MapPin size={14}/>} value={profile.starting_point} />
          <DetailCard label="Role Priority" icon={<ShieldCheck size={14}/>} value={profile.role} />
        </div>
      </div>

      {showUpdate && (
        <UpdateProfileForm 
          currentData={profile} 
          onClose={() => setShowUpdate(false)} 
          onRefresh={fetchProfile}
        />
      )}
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="p-3 border-r border-white/5 last:border-none text-center">
      <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xs font-bold text-white tracking-tight">{value}</p>
    </div>
  );
}

function DetailCard({ label, icon, value }) {
  return (
    <div className="bg-[#111114] border border-white/5 p-4 rounded-xl flex items-center gap-3.5 hover:bg-white/[0.03] transition-colors group">
      <div className="p-2 bg-white/5 text-blue-500 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xs font-bold text-gray-200 tracking-wide truncate">{value || "—"}</p>
      </div>
    </div>
  );
}