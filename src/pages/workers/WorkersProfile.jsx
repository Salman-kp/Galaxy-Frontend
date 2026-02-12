import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Loader2,
  Phone,
  MapPin,
  Droplets,
  Calendar,
  Briefcase,
  Wallet,
} from "lucide-react";

export default function WorkersProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-yellow-600 mb-3" size={30} />
        <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
          Loading Profile
        </span>
      </div>
    );

  if (!profile)
    return (
      <div className="p-10 text-center text-yellow-600 font-bold">
        Failed to load profile
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      {/* ================= PROFILE CARD ================= */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* TOP SECTION */}
        <div className="p-14 bg-gradient-to-br from-yellow-600 to-yellow-800 h-40">
          <div className=" bottom-16 left-8">
            <img
              src={
                profile.photo
                  ? `${import.meta.env.VITE_IMAGE_URL}/uploads/${profile.photo}`
                  : `https://ui-avatars.com/api/?name=${profile.name}&background=000&color=fff`
              }
              alt="Profile"
              className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
            />
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="pt-20 px-8 pb-6">
          <h2 className="text-2xl font-black tracking-tight capitalize">
            {profile.name}
          </h2>
          <p className="text-sm font-bold text-yellow-600 uppercase tracking-wide">
            {profile.role}
          </p>
          <p className="text-xs font-semibold text-gray-400 mt-1">
            ID: {profile.id}
          </p>
        </div>

        <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem icon={MapPin} label="Branch" value={profile.branch} />
          <InfoItem
            icon={MapPin}
            label="Starting Point"
            value={profile.starting_point}
          />
          <InfoItem
            icon={Phone}
            label="Phone Number"
            value={profile.phone}
          />
          <InfoItem
            icon={Droplets}
            label="Blood Group"
            value={profile.blood_group}
          />
          <InfoItem
            icon={Briefcase}
            label="Completed Events"
            value={profile.completed_work}
          />
          <InfoItem
            icon={Wallet}
            label="Today's Wage"
            value={`₹${profile.current_wage || "0.00"}`}
          />
          <InfoItem
            icon={Calendar}
            label="Joined On"
            value={formatDate(profile.joined_at)}
          />
          <InfoItem
            icon={Calendar}
            label="Date of Birth"
            value={formatDate(profile.dob)}
          />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4">
      <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-yellow-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-black text-gray-800 capitalize">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
