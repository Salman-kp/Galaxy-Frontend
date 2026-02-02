import React, { useState, useEffect } from "react";
import api from "../../services/api";
import RoleWageCard from "../../components/admin/wages/RoleWageCard";
import { CheckCircle2, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";

export default function RoleWageManagement() {
  const [wages, setWages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [popup, setPopup] = useState({ show: false, msg: "", isError: false });

  useEffect(() => { fetchWages(); }, []);

  const fetchWages = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/wages");
      setWages(res.data || []);
    } catch (err) {
      notify("Data Link Failure: Sync Interrupted", true);
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg, isError = false) => {
    setPopup({ show: true, msg, isError });
    setTimeout(() => setPopup({ show: false, msg: "", isError: false }), 4000);
  };

  const handleUpdate = async (role, wage) => {
    setUpdatingRole(role);
    try {
      const res = await api.put(`/admin/wages/${role}`, { wage: parseInt(wage) });
      notify(res.data.message || "Financial Ledger Updated");
      fetchWages();
    } catch (err) {
      notify(err.response?.data?.error || "Transaction Encryption Failed", true);
    } finally {
      setUpdatingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 lg:p-8 font-sans overflow-y-auto">
      
      {popup.show && (
        <div className="fixed top-6 right-6 z-[2000] animate-in slide-in-from-right-10">
          <div className={`flex items-center gap-3 px-5 py-3 shadow-2xl border backdrop-blur-md rounded-xl ${
            popup.isError ? "border-red-500/20 bg-red-500/10 text-red-500" : "border-blue-500/20 bg-blue-500/10 text-blue-400"
          }`}>
            {popup.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{popup.msg}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-8">
          <div>
             <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">Wage Administration</h1>
            <p className="text-xs text-gray-500">Manage role-based financial payouts and system rates.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
             <ShieldCheck size={14} className="text-blue-500" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Secure Node</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          <InstructionCard id="01" label="Update Policy" value="Changes affect future event contracts only." />
          <InstructionCard id="02" label="Currency" value="All values must be entered in base INR." />
          <InstructionCard id="03" label="Verification" value="Rates represent standard daily payouts." />
        </div>

        <div className="flex items-center gap-4 mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 whitespace-nowrap">Role Wage Registry</h3>
            <div className="h-[1px] w-full bg-white/5"></div>
            {loading && <Loader2 className="animate-spin text-blue-500" size={14} />}
        </div>

        <div className="pb-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-[#111114] border border-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {wages.map((item) => (
                <RoleWageCard
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdate}
                  isUpdating={updatingRole === item.role}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InstructionCard({ id, label, value }) {
  return (
    <div className="bg-[#111114] border border-white/5 p-4 rounded-xl hover:bg-white/[0.03] transition-colors group">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-[10px] font-black text-blue-600">{id}.</span>
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-xs font-bold text-gray-200 tracking-tight leading-tight">{value}</p>
    </div>
  );
}