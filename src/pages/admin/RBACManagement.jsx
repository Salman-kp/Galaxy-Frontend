import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ShieldCheck, UserPlus, Fingerprint, RefreshCcw, Loader2 } from "lucide-react";
import api from "../../services/api";

import InviteUserTab from "../../components/admin/rbac/InviteUserTab";
import RolesPermissionsTab from "../../components/admin/rbac/RolesPermissionsTab";
import TeamAccessTab from "../../components/admin/rbac/TeamAccessTab";

export default function RBACManagement() {
  const [activeTab, setActiveTab] = useState("Invite User");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const tabs = [
    { id: "Invite User", icon: UserPlus },
    { id: "Roles & Permissions", icon: Fingerprint },
    { id: "Promote / Demote", icon: ShieldCheck },
  ];

  const fetchBaseData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permRes] = await Promise.all([
        api.get("/admin/rbac/roles"),
        api.get("/admin/rbac/permissions")
      ]);
      setRoles(rolesRes.data || []);
      setPermissions(permRes.data || []);
    } catch (err) {
      toast.error("Security sync failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  return (
    /* CHANGED: Added max-w-4xl and centered it with mx-auto. Removed min-h-screen for better height control. */
    <div className="max-w-4xl mx-auto py-6 px-4">
      
      {/* Header: Reduced margin-bottom from 10 to 6 */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl text-white font-bold tracking-tight uppercase flex items-center gap-3">
            RBAC Management
          </h1>
          <p className="text-[8px] text-gray-500 mt-0.5 uppercase tracking-[0.2em] font-bold">
            Access & Security Protocols
          </p>
        </div>
        <button 
          onClick={fetchBaseData}
          className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-gray-400 active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
        </button>
      </header>

      {/* Tab Switcher: Reduced padding and margin */}
      <div className="flex bg-[#050505] p-1 rounded-xl border border-white/5 w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <tab.icon size={12} />
            {tab.id}
          </button>
        ))}
      </div>

      {/* Content Card: Reduced border-radius and padding for a sleeker "medium" look */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl min-h-[400px]">
        {loading && !roles.length ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === "Invite User" && <InviteUserTab roles={roles} />}
            {activeTab === "Roles & Permissions" && (
              <RolesPermissionsTab roles={roles} permissions={permissions} onRefresh={fetchBaseData} />
            )}
            {activeTab === "Promote / Demote" && <TeamAccessTab roles={roles} />}
          </div>
        )}
      </div>
    </div>
  );
}