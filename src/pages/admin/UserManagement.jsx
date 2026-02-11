import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Search, Key, Trash2, SlidersHorizontal,
  ChevronLeft, ChevronRight, UserPen, Ban, CheckCircle,
  XCircle, Users
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext"; // Import useAuth
import UserFormDrawer from "../../components/admin/users/UserFormDrawer";
import ResetPasswordModal from "../../components/admin/users/ResetPasswordModal";

export default function UserManagement() {
  const { hasPermission } = useAuth(); // Destructure hasPermission
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPwdId, setResetPwdId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const triggerNotify = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  const IMAGE_BASE_URL = `${import.meta.env.VITE_IMAGE_URL}/uploads`

  const fetchUsers = useCallback(async () => {
    // Only fetch if user has view permission
    if (!hasPermission("user:view")) return;

    try {
      let url = "/admin/users";
      if (searchTerm) {
        url = `/admin/users/search?phone=${searchTerm}`;
      } else if (selectedRole !== "all") {
        url = `/admin/users/role/${selectedRole}`;
      }
      const res = await api.get(url);
      const data = res.data || [];
      setUsers(data);

      const filteredUsers = data.filter(user => user.role !== "admin");
      setUsers(filteredUsers);

      const maxPage = Math.ceil(filteredUsers.length / usersPerPage);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (err) {
      triggerNotify("Failed to sync user data with server", "error");
    }
  }, [searchTerm, selectedRole, currentPage, hasPermission]); // Added hasPermission to dependency array

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBlockToggle = async (user) => {
    const action = user.status === "active" ? "block" : "unblock";
    try {
      await api.put(`/admin/users/${action}/${user.id}`);
      triggerNotify(`User access ${action === 'block' ? 'suspended' : 'restored'}`);
      fetchUsers();
    } catch (err) {
      triggerNotify("System error: Could not update status", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setConfirmDeleteId(null);
      triggerNotify("Staff record permanently deleted");
      fetchUsers();
    } catch (err) {
      triggerNotify("Delete operation failed", "error");
      setConfirmDeleteId(null);
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // If user doesn't have view permission, show access denied
  if (!hasPermission("user:view")) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle size={48} className="text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold uppercase tracking-widest">Access Denied</h1>
          <p className="text-xs text-gray-500">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-[72px] p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* NOTIFICATION */}
        {notification.show && (
          <div className="fixed top-20 right-4 md:right-8 z-[9999] animate-in slide-in-from-right-full duration-300">
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${notification.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
              {notification.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
              <p className="text-[10px] font-black uppercase tracking-widest">{notification.message}</p>
            </div>
          </div>
        )}

        {/* HEADER & CONTROLS */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">User management</h1>
            <p className="text-xs text-gray-500 mt-1">User management and access control systems.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={14} />
              <input
                type="text" placeholder="SEARCH PHONE..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 bg-[#111114] border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none w-full sm:w-48 focus:border-blue-500/50 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#111114] border border-white/5 px-3 py-2 rounded-xl">
              <SlidersHorizontal size={14} className="text-gray-500" />
              <select
                value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer pr-2 text-gray-400"
              >
                <option value="all">ALL ROLES</option>
                <option value="captain">CAPTAIN</option>
                <option value="sub_captain">SUB CAPTAIN</option>
                <option value="main_boy">MAIN BOY</option>
                <option value="junior_boy">JUNIOR BOY</option>
              </select>
            </div>

            {/* Check user:create permission */}
            {hasPermission("user:create") && (
              <button
                onClick={() => { setEditingUser(null); setIsDrawerOpen(true); }}
                className="bg-blue-600 hover:bg-blue-500 text-black px-6 py-2 rounded-full flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg"
              >
                <UserPlus size={14} strokeWidth={3} /> Add New User
              </button>
            )}
          </div>
        </header>

        {/* DATA CONTAINER */}
        <div className="bg-[#111114] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users size={14} className="text-blue-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Personnel Log</h3>
            </div>
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
              {users.length} Nodes Detected
            </span>
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/20">
                  <th className="px-6 py-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] text-center">ID</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Profile</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Details</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Role</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] text-center">Work</th>
                  <th className="px-6 py-4 text-right text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {currentUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5 text-[10px] font-bold text-gray-600 text-center">
                      {String(indexOfFirstUser + index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                        <img
                          src={`${IMAGE_BASE_URL}/${user.photo}`}
                          className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          alt=""
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`; }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-gray-200 uppercase tracking-wide">{user.name}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 font-bold">{user.phone}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter bg-white/5 px-2 py-1 rounded border border-white/5">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-[0.15em] border ${user.status === 'active' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-black text-gray-400">{user.completed_work || 0}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <ActionButtons
                        user={user}
                        confirmDeleteId={confirmDeleteId}
                        setConfirmDeleteId={setConfirmDeleteId}
                        handleDelete={handleDelete}
                        setResetPwdId={setResetPwdId}
                        handleBlockToggle={handleBlockToggle}
                        setEditingUser={setEditingUser}
                        setIsDrawerOpen={setIsDrawerOpen}
                        hasPermission={hasPermission} // Pass permission checker
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW */}
          <div className="md:hidden divide-y divide-white/[0.05]">
            {currentUsers.map((user) => (
              <div key={user.id} className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                      <img src={`${IMAGE_BASE_URL}/${user.photo}`} className="h-full w-full object-cover" alt="" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`; }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-200 uppercase">{user.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold">{user.phone}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${user.status === 'active' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                    }`}>
                    {user.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-gray-600 uppercase">System Role</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{user.role.replace('_', ' ')}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[8px] font-black text-gray-600 uppercase">Work Units</span>
                    <span className="text-[10px] font-bold text-gray-400">{user.completed_work || 0}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <ActionButtons
                    user={user}
                    confirmDeleteId={confirmDeleteId}
                    setConfirmDeleteId={setConfirmDeleteId}
                    handleDelete={handleDelete}
                    setResetPwdId={setResetPwdId}
                    handleBlockToggle={handleBlockToggle}
                    setEditingUser={setEditingUser}
                    setIsDrawerOpen={setIsDrawerOpen}
                    isMobile={true}
                    hasPermission={hasPermission} // Pass permission checker
                  />
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="px-6 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between bg-black/20 gap-4">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">
              Entries {indexOfFirstUser + 1}—{Math.min(indexOfLastUser, users.length)} / {users.length}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg border border-white/10 bg-white/5 disabled:opacity-20 text-gray-400 hover:text-white transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg border border-white/10 bg-white/5 disabled:opacity-20 text-gray-400 hover:text-white transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* MODALS */}
        <div className="relative z-[50]">
          <UserFormDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            userData={editingUser}
            onSuccess={() => { fetchUsers(); triggerNotify(editingUser ? "User updated" : "User created"); }}
            onError={(msg) => triggerNotify(msg, "error")}
          />
          <ResetPasswordModal
            userId={resetPwdId}
            onClose={() => setResetPwdId(null)}
            onSuccess={() => triggerNotify("Credentials reset successfully")}
            onError={(msg) => triggerNotify(msg, "error")}
          />
        </div>
      </div>
    </div>
  );
}

// Sub-component updated with permission checks
function ActionButtons({ user, confirmDeleteId, setConfirmDeleteId, handleDelete, setResetPwdId, handleBlockToggle, setEditingUser, setIsDrawerOpen, hasPermission, isMobile = false }) {
  if (confirmDeleteId === user.id) {
    return (
      <div className="flex items-center gap-1 bg-rose-500/10 p-1 rounded-lg border border-rose-500/20 animate-in fade-in zoom-in duration-200">
        <button onClick={() => handleDelete(user.id)} className="bg-rose-600 text-white px-3 py-1.5 rounded text-[9px] font-black uppercase">Confirm</button>
        <button onClick={() => setConfirmDeleteId(null)} className="text-gray-400 p-1 hover:text-white transition-colors"><XCircle size={16} /></button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${!isMobile && 'justify-end md:opacity-0 group-hover:opacity-100 transition-opacity'}`}>
      {/* user:password */}
      {hasPermission("user:password") && (
        <button onClick={() => setResetPwdId(user.id)} title="Reset Password"
          className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all">
          <Key size={14} />
        </button>
      )}

      {/* user:edit */}
      {hasPermission("user:edit") && (
        <button onClick={() => { setEditingUser(user); setIsDrawerOpen(true); }} title="Edit User"
          className="p-2 text-gray-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all">
          <UserPen size={14} />
        </button>
      )}

      {/* user:status */}
      {hasPermission("user:status") && (
        <button onClick={() => handleBlockToggle(user)} title={user.status === 'active' ? 'Block' : 'Unblock'}
          className={`p-2 rounded-lg transition-all ${user.status === 'active' ? 'text-gray-500 hover:text-orange-400 hover:bg-orange-400/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}>
          {user.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
        </button>
      )}

      {/* user:delete */}
      {hasPermission("user:delete") && (
        <button onClick={() => setConfirmDeleteId(user.id)} title="Delete"
          className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}