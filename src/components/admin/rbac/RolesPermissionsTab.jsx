import React, { useState } from "react";
import { Plus, Check, Shield, Fingerprint, Loader2, Edit3, X, Save } from "lucide-react";
import api from "../../../services/api";
import { toast } from "react-hot-toast";

export default function RolesPermissionsTab({ roles, permissions, onRefresh }) {
  // Creation State
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  // Edit/View State
  const [editingRole, setEditingRole] = useState(null); // Stores the role object being edited
  const [editName, setEditName] = useState("");
  const [editPerms, setEditPerms] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Stores ID of role awaiting deletion

  // Fetch details and enter Edit Mode
  const handleSelectRole = async (role) => {
    try {
      const { data } = await api.get(`/admin/rbac/roles/${role.id}`);
      setEditingRole(data);
      setEditName(data.name);
      // Map existing permissions to an array of IDs
      setEditPerms(data.permissions ? data.permissions.map(p => p.id) : []);
      setDeleteConfirm(null);
    } catch (err) {
      toast.error("Failed to load role details");
    }
  };

  const togglePerm = (id, type) => {
    if (type === "create") {
      setNewRolePerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    } else {
      setEditPerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName) return toast.error("Role name required");
    setIsCreating(true);
    try {
      await api.post("/admin/rbac/roles", { name: newRoleName, permission_ids: newRolePerms });
      toast.success("Security role created");
      setNewRoleName("");
      setNewRolePerms([]);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || "Creation failed");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editName) return toast.error("Role name required");
    setIsUpdating(true);
    try {
      await api.put(`/admin/rbac/roles/${editingRole.id}`, { 
        name: editName, 
        permission_ids: editPerms 
      });
      toast.success("Security policy updated");
      onRefresh();
      setEditingRole(null);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      await api.delete(`/admin/rbac/roles/${id}`);
      toast.success("Role purged");
      if (editingRole?.id === id) setEditingRole(null);
      setDeleteConfirm(null);
      onRefresh();
    } catch (err) {
      toast.error("Cannot delete role while in use");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* LEFT SIDE: List Existing Roles */}
      <div className="lg:w-1/3 space-y-4">
        <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">Active Security Roles</h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {roles.map(role => (
            <div 
              key={role.id} 
              onClick={() => handleSelectRole(role)}
              className={`group flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${
                editingRole?.id === role.id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Shield size={14} className={editingRole?.id === role.id ? "text-blue-400" : "text-gray-500"} />
                  <span className="text-sm font-bold text-gray-200">{role.name}</span>
                </div>
                <Edit3 size={14} className="opacity-0 group-hover:opacity-100 text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: Dynamic Panel (Edit or Create) */}
      <div className="lg:flex-1 space-y-6">
        
        {/* PANEL 1: EDIT / DETAILS (Only shows if a role is selected) */}
        {editingRole ? (
          <div className="bg-blue-900/5 border border-blue-500/20 p-6 rounded-2xl animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg"><Fingerprint size={20} className="text-blue-400" /></div>
                <h3 className="text-lg font-bold text-white">Modify: {editingRole.name}</h3>
              </div>
              <button onClick={() => setEditingRole(null)} className="text-gray-500 hover:text-white"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="rbac-label">Update Role Name</label>
                <input 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rbac-input mb-4"
                  placeholder="Role Name"
                />
                
                <div className="flex flex-col gap-2 mt-8">
                  <button 
                    onClick={handleUpdateRole}
                    disabled={isUpdating}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Apply Changes
                  </button>

                  {/* Inline Delete Confirmation */}
                  <div className="mt-2 border-t border-white/5 pt-4">
                    {deleteConfirm === editingRole.id ? (
                      <div className="flex items-center justify-between bg-red-500/10 p-2 rounded-lg border border-red-500/30">
                        <span className="text-[10px] text-red-400 font-bold uppercase">Confirm Purge?</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleDeleteRole(editingRole.id)} className="text-[10px] bg-red-600 px-3 py-1 rounded text-white font-bold">YES</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-[10px] bg-gray-700 px-3 py-1 rounded text-white">NO</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeleteConfirm(editingRole.id)}
                        className="w-full border border-red-500/20 hover:bg-red-500/10 text-red-500 text-[10px] font-bold uppercase py-2 rounded-lg transition-all"
                      >
                        Delete Role
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Permission Matrix for Editing */}
              <div className="space-y-3">
                <label className="rbac-label">Active Permissions</label>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {permissions.map(perm => (
                    <div 
                      key={perm.id} 
                      onClick={() => togglePerm(perm.id, "edit")}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        editPerms.includes(perm.id) ? 'bg-blue-600/20 border-blue-500/50' : 'bg-black/40 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <span className={`text-[11px] font-bold ${editPerms.includes(perm.id) ? 'text-blue-400' : 'text-gray-400'}`}>
                        {perm.slug.replace(/:/g, ' ')}
                      </span>
                      {editPerms.includes(perm.id) && <Check size={12} className="text-blue-400" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PANEL 2: CREATE NEW ROLE (Shows when no role is being edited) */
          <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-8">
              <Plus className="text-green-500" size={24} />
              <h3 className="text-lg font-bold text-white">Create New Security Role</h3>
            </div>

            <div className="mb-8">
              <label className="rbac-label">Role Designation</label>
              <input 
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="rbac-input"
                placeholder="e.g. Analytics Viewer"
              />
            </div>

            <label className="rbac-label">Assign Permissions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {permissions.map(perm => (
                <div 
                  key={perm.id} 
                  onClick={() => togglePerm(perm.id, "create")}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    newRolePerms.includes(perm.id) 
                      ? 'bg-blue-600/10 border-blue-500/40' 
                      : 'bg-white/[0.03] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${newRolePerms.includes(perm.id) ? 'text-blue-400' : 'text-gray-300'}`}>
                      {perm.slug.replace(/:/g, ' ')}
                    </span>
                    <span className="text-[9px] text-gray-600 font-mono mt-0.5 uppercase">{perm.slug}</span>
                  </div>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                    newRolePerms.includes(perm.id) ? 'bg-blue-600 border-blue-600' : 'border-white/10'
                  }`}>
                    {newRolePerms.includes(perm.id) && <Check size={10} className="text-white" strokeWidth={4} />}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleCreateRole}
              disabled={isCreating}
              className="mt-10 w-full bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] py-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              Generate Security Role
            </button>
          </div>
        )}
      </div>
      
      {/* Shared Styles for Input/Label (consistent with InviteUserTab) */}
      <style>{`
        .rbac-input {
          width: 100%;
          background-color: #0d0d0d;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #ffffff;
          outline: none;
        }
        .rbac-label {
          display: block;
          font-size: 10px;
          color: #666;
          margin-bottom: 6px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
      `}</style>
    </div>
  );
}