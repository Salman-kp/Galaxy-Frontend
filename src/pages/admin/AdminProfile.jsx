import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { 
  User, Phone, MapPin, Droplets, Calendar, 
  Building2, Edit3, ShieldCheck, Briefcase, IndianRupee, Loader2 
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
      const res = await api.get("/api/auth/profile");
      setProfile(res.data);
    } catch (err) {
      console.error("Profile fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-300 mb-4" size={32} />
      <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Loading Profile...</span>
    </div>
  );

  if (!profile) return <div className="p-10 text-red-500 font-medium">Failed to connect to identity service.</div>;

  return (
    <div className="min-h-screen  p-6 lg:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your administrator identity and system preferences.</p>
          </div>
          <button 
            onClick={() => setShowUpdate(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* AVATAR & PRIMARY INFO */}
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 border-b border-slate-100">
            <div className="relative">
              <img 
                src={profile.photo ? `http://localhost:8080/uploads/${profile.photo}` : "https://ui-avatars.com/api/?name=" + profile.name} 
                className="w-36 h-36 rounded-none border-4 border-slate-50 object-cover shadow-sm bg-slate-100"
                alt="Admin"
              />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg">
                <ShieldCheck size={16} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-indigo-100">{profile.role}</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{profile.name}</h2>
              <p className="text-slate-500 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
                <Building2 size={14} /> {profile.branch || "Headquarters"}
              </p>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <DetailCard label="Contact Number" icon={<Phone size={18}/>} value={profile.phone} />
          <DetailCard label="Current Deployment" icon={<MapPin size={18}/>} value={profile.starting_point} />
          <DetailCard label="Blood Group" icon={<Droplets size={18}/>} value={profile.blood_group} />
          <DetailCard label="Date of Birth" icon={<Calendar size={18}/>} value={new Date(profile.dob).toLocaleDateString()} />
          <DetailCard label="Location" icon={<Building2 size={18}/>} value={profile.starting_point } />
          <DetailCard label=" Joined Date" icon={<Calendar size={18}/>} value={new Date(profile.joined_at).toLocaleDateString()} />

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
    <div className="p-6">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-800 tracking-tight">{value || "0"}</p>
    </div>
  );
}

function DetailCard({ label, icon, value }) {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center gap-4">
      <div className="p-2.5 bg-slate-50 text-indigo-600 rounded-lg">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-sm font-semibold text-slate-900 uppercase tracking-wide">{value || "Not Set"}</p>
      </div>
    </div>
  );
}