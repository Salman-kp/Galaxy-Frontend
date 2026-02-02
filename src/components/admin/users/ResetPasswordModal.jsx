import React, { useState } from "react";
import api from "../../../services/api";
import { KeyRound, X } from "lucide-react";

export default function ResetPasswordModal({ userId, onClose, onSuccess, onError }) {
  const [newPassword, setNewPassword] = useState("");
  if (!userId) return null;

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/reset-password/${userId}`, { new_password: newPassword });
      if (onSuccess) onSuccess(); 
      onClose();
    } catch (err) { 
      if (onError) onError("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0c] w-full max-w-[320px] p-6 rounded-2xl shadow-2xl text-center border border-slate-800 ring-1 ring-white/5">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-500/10 rounded-full">
            <KeyRound size={24} className="text-blue-400" />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-1">Reset Password</h3>
        <p className="text-[10px] text-slate-500 mb-6 uppercase tracking-wider font-semibold">
          Worker ID: <span className="text-slate-300">{userId}</span>
        </p>
        
        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl font-medium text-center text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all shadow-inner"
              required
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button 
              type="submit" 
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20"
            >
              Update Password
            </button>
            
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full py-2 text-[10px] font-bold uppercase text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}