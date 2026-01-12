import React, { useState } from "react";
import api from "../../../services/api";

export default function ResetPasswordModal({ userId, onClose }) {
  const [newPassword, setNewPassword] = useState("");
  if (!userId) return null;

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/admin/users/reset-password/${userId}`, { new_password: newPassword });
      alert("Credentials updated"); onClose();
    } catch (err) { alert("Reset failed"); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/10 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-[280px] p-8 rounded-[2rem] shadow-2xl text-center border border-gray-50">
        <h3 className="text-md font-bold text-gray-800 mb-1">Reset Key</h3>
        <p className="text-[10px] text-gray-400 mb-6 uppercase tracking-wider font-semibold">User ID: {userId}</p>
        
        <form onSubmit={handleReset} className="space-y-4">
          <input 
            type="password" placeholder="New Password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl border-none font-bold text-center text-xs focus:ring-1 focus:ring-[#B2DFDB] outline-none shadow-inner"
            required
          />
          <div className="flex flex-col gap-2">
            <button type="submit" className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md shadow-gray-100">
              Update
            </button>
            <button type="button" onClick={onClose} className="w-full py-2 text-[10px] font-bold uppercase text-gray-300 hover:text-red-400 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}