import React, { useState, useEffect, useCallback } from "react";
import { 
  UserPlus, Search, Key, Trash2, SlidersHorizontal, 
  ChevronLeft, ChevronRight, UserPen, Ban, CheckCircle, 
  XCircle 
} from "lucide-react";
import api from "../../services/api";
import UserFormDrawer from "../../components/admin/users/UserFormDrawer";
import ResetPasswordModal from "../../components/admin/users/ResetPasswordModal";

export default function UserManagement() {
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

  const IMAGE_BASE_URL = "http://localhost:8080/uploads"; 

 const fetchUsers = useCallback(async () => {
     try {
    let url = "/api/admin/users";
    if (searchTerm) {
      url = `/api/admin/users/search?phone=${searchTerm}`;
    } else if (selectedRole !== "all") {
      url = `/api/admin/users/role/${selectedRole}`;
    }
    const res = await api.get(url);
    const data = res.data || [];
    setUsers(data);
    
    const maxPage = Math.ceil(data.length / usersPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
     }
    } catch (err) { 
     triggerNotify("Failed to sync user data with server", "error");
   }
  }, [searchTerm, selectedRole, currentPage]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBlockToggle = async (user) => {
    const action = user.status === "active" ? "block" : "unblock";
    try {
      await api.put(`/api/admin/users/${action}/${user.id}`);
      triggerNotify(`User access ${action === 'block' ? 'suspended' : 'restored'}`);
      fetchUsers();
    } catch (err) { 
      triggerNotify("System error: Could not update status", "error"); 
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/users/${id}`);
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

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 bg-gray-200  overflow-x-hidden min-h-screen p-2 md:p-0">
            {notification.show && (
        <div className="fixed top-4 right-4 md:top-6 md:right-6 z-[9999] animate-in slide-in-from-right-full duration-300 max-w-[calc(100vw-32px)]">
          <div className={`flex items-center gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
            notification.type === "success" ? "bg-white/90 border-emerald-100 text-emerald-900" : "bg-white/90 border-rose-100 text-rose-900"
          }`}>
            <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${
              notification.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            }`}>
              {notification.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-[9px] font-black uppercase opacity-50 mb-0.5 tracking-tighter">System Message</h4>
              <p className="text-xs md:text-sm font-bold leading-tight truncate">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-4 md:mb-8 gap-4 px-2 pt-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">User Directory</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Managing {users.length} staff members</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" placeholder="Search phone..." value={searchTerm}
              onChange={(e) =>{
                setSearchTerm(e.target.value);
                setCurrentPage(1)
               }}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none w-full sm:w-48 shadow-sm focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
            <SlidersHorizontal size={14} className="text-slate-600" />
            <select 
              value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer pr-2 text-slate-700 w-full"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="captain">Captain</option>
              <option value="sub_captain">Sub Captain</option>
              <option value="main_boy">Main Boy</option>
              <option value="junior_boy">Junior Boy</option>
            </select>
          </div>

          <button 
            onClick={() => { setEditingUser(null); setIsDrawerOpen(true); }}
            className="flex items-center justify-center gap-2 bg-[#2549CF] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition-all active:scale-95">
            <UserPlus size={16} />
            Add New User
          </button>
        </div>
      </div>

      {/* SECTION 2: DATA CONTAINER */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col flex-grow overflow-hidden mx-1 md:mx-2 mb-4">
        
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] text-center">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Profile</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] text-center">Worke</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px]">
              {currentUsers.map((user, index) => (
                <tr key={user.id} className="group hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-[13px] font-semibold text-slate-400 text-center">
                    {String(indexOfFirstUser + index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-10 w-10 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden ring-1 ring-slate-100">
                      <img src={`${IMAGE_BASE_URL}/${user.photo}`} className="h-full w-full object-cover" alt="" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[14px] text-slate-800 leading-tight">{user.name}</p>
                    <p className="font-medium text-[11px] text-slate-500 mt-0.5">{user.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200/50">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                      <span className="text-[10px] font-bold uppercase">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-black text-slate-700">{user.completed_work || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {confirmDeleteId !== user.id ? (
                        <>
                          <button onClick={() => setResetPwdId(user.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Key size={15} /></button>
                          <button onClick={() => { setEditingUser(user); setIsDrawerOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><UserPen size={15} /></button>
                          <button onClick={() => handleBlockToggle(user)} className={`p-2 rounded-xl transition-all ${user.status === 'active' ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                            {user.status === 'active' ? <Ban size={15} /> : <CheckCircle size={15} />}
                          </button>
                          <button onClick={() => setConfirmDeleteId(user.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={15} /></button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-100 animate-in fade-in zoom-in duration-200">
                          <span className="text-[9px] font-black uppercase text-rose-600 px-2">Confirm?</span>
                          <button onClick={() => handleDelete(user.id)} className="bg-rose-600 text-white p-1.5 rounded-lg hover:bg-rose-700 shadow-sm"><Trash2 size={13} /></button>
                          <button onClick={() => setConfirmDeleteId(null)} className="bg-white text-slate-400 p-1.5 rounded-lg border border-slate-200 hover:text-slate-600"><XCircle size={13} /></button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {currentUsers.map((user) => (
            <div key={user.id} className="p-4 space-y-4 hover:bg-slate-50/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden ring-1 ring-slate-100">
                    <img src={`${IMAGE_BASE_URL}/${user.photo}`} className="h-full w-full object-cover" alt="" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }} />
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-slate-800 leading-tight">{user.name}</p>
                    <p className="font-medium text-[11px] text-slate-500 mt-0.5">{user.phone}</p>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  <span className="text-[9px] font-bold uppercase tracking-tight">{user.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-2xl">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Role</span>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{user.role.replace('_', ' ')}</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Work</span>
                  <span className="text-[13px] font-black text-slate-700">{user.completed_work || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                {confirmDeleteId !== user.id ? (
                  <>
                    <button onClick={() => setResetPwdId(user.id)} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl active:bg-blue-50 active:text-blue-600"><Key size={16} /></button>
                    <button onClick={() => { setEditingUser(user); setIsDrawerOpen(true); }} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl active:bg-amber-50 active:text-amber-600"><UserPen size={16} /></button>
                    <button onClick={() => handleBlockToggle(user)} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl active:bg-orange-50 active:text-orange-600">
                       {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} className="text-emerald-600" />}
                    </button>
                    <button onClick={() => setConfirmDeleteId(user.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={16} /></button>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full bg-rose-50 p-2 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <span className="text-[10px] font-black uppercase text-rose-600 px-2">Permanently delete user?</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(user.id)} className="bg-rose-600 text-white p-2 rounded-xl shadow-sm"><Trash2 size={14} /></button>
                      <button onClick={() => setConfirmDeleteId(null)} className="bg-white text-slate-400 p-2 rounded-xl border border-slate-200"><XCircle size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="px-6 py-20 text-center text-slate-400 text-sm font-medium italic underline decoration-slate-200">No matching users found.</div>
        )}

        {/* PAGINATION FOOTER */}
        <div className="px-4 md:px-8 py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between mt-auto">
          <p className="hidden sm:block text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">
            Showing <span className="text-slate-900">{indexOfFirstUser + 1}</span> to <span className="text-slate-900">{Math.min(indexOfLastUser, users.length)}</span> of {users.length} Records
          </p>
          <p className="sm:hidden text-[10px] font-bold text-slate-500 uppercase">Page {currentPage} of {totalPages || 1}</p>
          <div className="flex gap-2 md:gap-3">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 hover:shadow-sm active:bg-slate-100 transition-all"><ChevronLeft size={18} /></button>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 disabled:opacity-30 hover:shadow-sm active:bg-slate-100 transition-all"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* --- FORMS & MODALS (Ensuring they sit above the relative content) --- */}
      <div className="relative z-[50]">
        <UserFormDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          userData={editingUser} 
          onSuccess={() => { fetchUsers(); triggerNotify(editingUser ? "User profile updated" : "New user created"); }} 
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
  );
}