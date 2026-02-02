import React, { useState, useEffect } from "react";
import { 
  Search, Loader2, RefreshCcw, Save, Trash2, 
  User, X, Check, ShieldAlert, ChevronLeft, ChevronRight 
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../../services/api";

export default function TeamAccessTab({ roles }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("admin"); 
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const mainRoles = ["admin", "captain", "sub_captain", "main_boy", "junior_boy"];

  useEffect(() => {
    fetchStaff(activeFilter);
    setCurrentPage(1);
  }, [activeFilter]);

  const fetchStaff = async (roleType) => {
    setLoading(true);
    try {
      let url = roleType === "all" ? "/admin/users" : `/admin/users/role/${roleType}`;
      const { data } = await api.get(url);
      setStaff(data || []);
      setPendingChanges({}); 
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to load users";
      toast.error(errMsg);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalChange = (userId, field, value) => {
    setPendingChanges((prev) => {
      const currentPending = prev[userId] || {};
      const user = staff.find(s => s.id === userId);
      
      let newChanges = { ...currentPending, [field]: value };

      // Logical Sync: If switching away from admin, clear sub-role
      if (field === "role") {
        if (value !== "admin") {
          newChanges.admin_role_id = null;
        } else {
          // If switching back to admin, pick a default sub-role if none exists
          if (!user?.admin_role_id && roles.length > 0) {
            newChanges.admin_role_id = roles[0].id;
          }
        }
      }
      
      return { ...prev, [userId]: newChanges };
    });
  };

  const handleUpdate = async (user) => {
    const changes = pendingChanges[user.id];
    if (!changes) return;
    
    setUpdatingId(user.id);
    try {
      const finalRole = changes.role || user.role;

      // Payload construction to satisfy Postgres Constraint
      const payload = {
        role: finalRole,
        admin_role_id: finalRole === "admin" 
          ? (changes.admin_role_id !== undefined ? Number(changes.admin_role_id) : user.admin_role_id)
          : null // Explicit null for non-admins
      };

      const { data } = await api.put(`/admin/rbac/update-role/${user.id}`, payload);
      toast.success(data.message || "Updated successfully");

      const newPending = { ...pendingChanges };
      delete newPending[user.id];
      setPendingChanges(newPending);
      
      fetchStaff(activeFilter);
    } catch (err) {
      const errMsg = err.response?.data?.error || "Update failed";
      toast.error(errMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/rbac/admins/${id}`);
      toast.success("User removed successfully");
      setStaff(staff.filter(s => s.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // --- Filtering & Pagination Logic ---
  const filteredStaff = staff.filter(person => 
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    person.phone.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredStaff.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredStaff.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Search and Filters */}
      <div className="flex justify-between items-center bg-[#0a0a0c] p-3 rounded-2xl border border-white/5 shadow-xl">
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
          {["admin", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeFilter === f ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {f === "admin" ? "Admins Only" : "All Accounts"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-[11px] text-white focus:border-blue-500 outline-none w-40 transition-all"
            />
          </div>
          <button onClick={() => fetchStaff(activeFilter)} className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-gray-400">
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-gray-500 font-bold uppercase tracking-tighter">
              <th className="px-6 py-4">Personnel Identity</th>
              <th className="px-6 py-4">Primary Role</th>
              <th className="px-6 py-4">RBAC Clearance</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan="4" className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={24} /></td></tr>
            ) : currentUsers.length === 0 ? (
              <tr><td colSpan="4" className="py-12 text-center text-gray-500">No users found.</td></tr>
            ) : currentUsers.map((member) => {
              const hasChanges = !!pendingChanges[member.id];
              const currentRole = pendingChanges[member.id]?.role || member.role;
              const currentSubRole = pendingChanges[member.id]?.admin_role_id ?? (member.admin_role_id || "");

              return (
                <tr key={member.id} className={`hover:bg-white/[0.01] transition-colors ${hasChanges ? 'bg-blue-500/[0.03]' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-gray-400">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-white">{member.name}</p>
                        <p className="text-[10px] text-gray-500">{member.phone}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={currentRole}
                      onChange={(e) => handleLocalChange(member.id, "role", e.target.value)}
                      className="bg-black border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-gray-300 outline-none w-32 focus:border-blue-500/40"
                    >
                      {mainRoles.map(r => (
                        <option key={r} value={r}>{r.toUpperCase().replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    {currentRole === "admin" ? (
                      <select
                        value={currentSubRole}
                        onChange={(e) => handleLocalChange(member.id, "admin_role_id", e.target.value)}
                        className="bg-black border border-blue-500/20 rounded-lg px-2 py-1.5 text-[10px] text-blue-400 outline-none w-40 focus:border-blue-500"
                      >
                        <option value="" disabled>— SELECT ROLE —</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-1.5 text-gray-600 italic px-2">
                        <ShieldAlert size={12} />
                        <span>Not Applicable</span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-3">
                      {hasChanges && (
                        <button 
                          onClick={() => handleUpdate(member)}
                          disabled={updatingId === member.id}
                          className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                        >
                          {updatingId === member.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        </button>
                      )}
                      
                      {deleteConfirmId === member.id ? (
                        <div className="flex items-center gap-1 bg-red-600/10 p-1 rounded-lg border border-red-600/20">
                          <button onClick={() => handleDelete(member.id)} className="p-1 text-red-500 hover:bg-red-600 hover:text-white rounded-md transition-colors"><Check size={14} /></button>
                          <button onClick={() => setDeleteConfirmId(null)} className="p-1 text-gray-400 hover:bg-white/10 rounded-md"><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(member.id)} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* --- Pagination Footer --- */}
        {filteredStaff.length > usersPerPage && (
          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-gray-500">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredStaff.length)} of {filteredStaff.length} personnel
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                    currentPage === i + 1 
                      ? "bg-blue-600 text-white" 
                      : "bg-white/5 text-gray-500 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-20 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}