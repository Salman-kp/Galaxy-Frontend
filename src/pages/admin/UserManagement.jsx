import React, { useState, useEffect } from "react";
import { UserPlus, Search, Key, Trash2, SlidersHorizontal, ChevronLeft, ChevronRight, UserPen, Ban, CheckCircle } from "lucide-react";
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      let url = "/api/admin/users";
      if (searchTerm) {
        url = `/api/admin/users/search?phone=${searchTerm}`;
      } else if (selectedRole !== "all") {
        url = `/api/admin/users/role/${selectedRole}`;
      }
      const res = await api.get(url);
      setUsers(res.data || []);
      setCurrentPage(1); 
    } catch (err) { 
      console.error("Fetch error:", err); 
    }
  };

  useEffect(() => { fetchUsers(); }, [selectedRole, searchTerm]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handleBlockToggle = async (user) => {
    const action = user.status === "active" ? "block" : "unblock";
    try {
      await api.put(`/api/admin/users/${action}/${user.id}`);
      fetchUsers();
    } catch (err) { console.error("Toggle failed:", err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this user?")) {
      try {
        await api.delete(`/api/admin/users/${id}`);
        fetchUsers();
      } catch (err) { console.error("Delete failed:", err); }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-200 text-[#1A1C21]">
      
      {/* SECTION 1: HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">Manage credentials of {users.length} Users</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" placeholder="Search phone..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none w-48 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border  border-gray-200 px-3 py-2 rounded-xl shadow-sm">
            <SlidersHorizontal size={14} className="text-black-500" />
            <select 
              value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent text-[11px] font-bold uppercase outline-none cursor-pointer  pr-2"
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
            className="flex items-center gap-2 bg-[#2549CF] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-blue-700 transition-all">
            <UserPlus size={16} />
            Create User
          </button>
        </div>
      </div>

      {/* SECTION 2: TABLE & PAGINATION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-grow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8F9FC] border-b border-gray-100">
             <tr>
                <th className="px-6 py-3.5 text-[11px] font-normal text-black uppercase tracking-widest text-center">#</th>
                <th className="px-6 py-3.5 text-[11px] font-normal text-black uppercase tracking-widest">Photo</th>
                <th className="px-6 py-3.5 text-[11px] font-normal text-black uppercase tracking-widest">Details</th>
                <th className="px-6 py-3.5 text-[11px] font-normal text-black uppercase tracking-widest">Role</th>
                <th className="px-6 py-3.5 text-[11px] font-normal text-black uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-3.5 text-[11px] font-normal text-black uppercase tracking-widest text-center">Work Done</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-normal text-black uppercase tracking-widest">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[13px]">
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user.id} className="border-b border-gray-50">
                    <td className="px-6 py-3.5 text-[14px] font-medium text-black uppercase tracking-widest text-center">
                      {indexOfFirstUser + index + 1}
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-9 w-9 rounded-full bg-gray-100 border border-white shadow-sm overflow-hidden">
                        {user.photo ? (
                          <img src={`/uploads/${user.photo}`} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-gray-400 uppercase">
                            {user.name ? user.name[0] : "?"}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-medium text-[15px] text-[#1d1d1d]">{user.name}</p>
                      <p className="font-medium text-[12px] text-gray-700 ">{user.phone}</p>
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] font-black uppercase border border-gray-100">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${user.status === 'active' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]'}`}>
                        <div className={`w-1 h-1 rounded-full ${user.status === 'active' ? 'bg-[#2E7D32]' : 'bg-[#C62828]'}`} />
                        <span className="text-[10px] font-bold uppercase">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center font-bold text-gray-600">
                      {user.completed_work || 0}
                    </td>
                    <td className="px-6 py-2 text-right">
                      {/* Removed opacity-0 and group-hover:opacity-100 */}
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setResetPwdId(user.id)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Reset Password"><Key size={14} /></button>
                        <button onClick={() => { setEditingUser(user); setIsDrawerOpen(true); }} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Update Profile"><UserPen size={14} /></button>
                        <button onClick={() => handleBlockToggle(user)} className={`p-1.5 rounded-lg transition-colors ${user.status === 'active' ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`} title={user.status === 'active' ? 'Block' : 'Unblock'}>
                          {user.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400 text-sm italic">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-6 py-3 bg-[#F8F9FC] border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            {users.length > 0 ? indexOfFirstUser + 1 : 0} - {Math.min(indexOfLastUser, users.length)} / {users.length}
          </p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 disabled:opacity-30"><ChevronLeft size={16} /></button>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <UserFormDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} userData={editingUser} onSuccess={fetchUsers} />
      <ResetPasswordModal userId={resetPwdId} onClose={() => setResetPwdId(null)} />
    </div>
  );
}