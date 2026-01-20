import React, { useState, useEffect } from "react";
import api from "../../services/api";
import RoleWageCard from "../../components/admin/wages/RoleWageCard";
import { CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default function RoleWageManagement() {
  const [wages, setWages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [popup, setPopup] = useState({ show: false, msg: "", isError: false });

  useEffect(() => { fetchWages(); }, []);

  const fetchWages = async () => {
    try {
      const res = await api.get("/api/admin/wages");
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
      const res = await api.put(`/api/admin/wages/${role}`, { wage: parseInt(wage) });
      notify(res.data.message || "Financial Ledger Updated");
      fetchWages();
    } catch (err) {
      notify(err.response?.data?.error || "Transaction Encryption Failed", true);
    } finally {
      setUpdatingRole(null);
    }
  };

  return (
    /* CHANGE: Removed h-screen and overflow-hidden. Added min-h-screen and overflow-y-auto */
    <div className="min-h-screen bg-gray-200 text-slate-900 flex flex-col font-sans overflow-y-auto">
      {popup.show && (
        <div className="fixed top-6 right-6 z-[2000] animate-in slide-in-from-right-10">
          <div className={`flex items-center gap-3 px-5 py-3 shadow-xl border-l-4 bg-white ${
            popup.isError ? "border-red-600 text-red-700" : "border-blue-600 text-blue-700"
          }`}>
            {popup.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span className="text-[11px] font-bold uppercase tracking-wide">{popup.msg}</span>
          </div>
        </div>
      )}

      {/* CHANGE: Changed p-8 to p-4 on mobile and p-12 on desktop for better spacing */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-8 lg:p-12 flex flex-col h-full">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-300 pb-6 gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Wage <span className="text-blue-600 font-medium">Administration</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
              Role Wage Management System
            </p>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
             <ShieldCheck size={14} />
             <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Secure Node</span>
          </div>
        </header>

        {/* ADMIN INSTRUCTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-300 bg-white mb-8 shadow-sm">
          <div className="p-4 border-b md:border-b-0 md:border-r border-slate-100">
            <span className="text-[9px] font-black text-blue-600 uppercase block mb-1">01. Update Policy</span>
            <p className="text-[11px] font-semibold text-slate-600 leading-tight">Changes affect future event contracts only.</p>
          </div>
          <div className="p-4 border-b md:border-b-0 md:border-r border-slate-100">
            <span className="text-[9px] font-black text-blue-600 uppercase block mb-1">02. Currency</span>
            <p className="text-[11px] font-semibold text-slate-600 leading-tight">All values must be entered in base INR.</p>
          </div>
          <div className="p-4">
            <span className="text-[9px] font-black text-blue-600 uppercase block mb-1">03. Verification</span>
            <p className="text-[11px] font-semibold text-slate-600 leading-tight">Rates represent standard daily payouts.</p>
          </div>
        </div>

        <div className="pb-10"> {/* Added bottom padding for mobile clearance */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-56 bg-white/60 border border-slate-300 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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