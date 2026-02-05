import React, { useState, useEffect } from "react";
import { X, Camera, Trash2, Check, RotateCcw } from "lucide-react";
import api from "../../../services/api";

export default function UserFormDrawer({
  isOpen,
  onClose,
  userData,
  onSuccess,
  onError,
}) {
  const initialForm = {
    name: "",
    phone: "",
    password: "",
    role: "main_boy",
    branch: "",
    starting_point: "",
    blood_group: "O+",
    dob: "",
    status: "active",
  };

  const [formData, setFormData] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPreview(null);

      return;
    }
    const objectUrl = URL.createObjectURL(photo);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  useEffect(() => {
    if (userData) {
      const formattedDob = userData.dob ? userData.dob.split("T")[0] : "";
      setFormData({
        name: userData.name || "",
        phone: userData.phone || "",
        password: "",
        role: userData.role || "main_boy",
        branch: userData.branch || "",
        starting_point: userData.starting_point || "",
        blood_group: userData.blood_group || "O+",
        dob: formattedDob,
        status: userData.status || "active",
      });
    } else {
      setFormData(initialForm);
    }
    setPhoto(null);
  }, [userData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const jsonPayload = {
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      branch: formData.branch,
      starting_point: formData.starting_point,
      blood_group: formData.blood_group,
      dob: formData.dob,
    };

    if (!userData) {
      jsonPayload.password = formData.password;
    } else {
      jsonPayload.status = formData.status;
    }

    const data = new FormData();
    data.append("json", JSON.stringify(jsonPayload));

    if (photo) {
      data.append("photo", photo);
    }

    try {
      if (userData) {
        await api.put(`/admin/users/${userData.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/admin/users", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Operation failed";
      if (onError) onError(errMsg);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await api.delete(`/admin/users/${userData.id}/photo`);

      setShowConfirmDelete(false);
      userData.photo = "";
      setPhoto(null);

      if (onSuccess) onSuccess();
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to remove photo";
      if (onError) onError(errMsg);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div
        className={`w-full max-w-sm bg-[#0a0a0c] h-screen p-8 shadow-2xl border-l border-white/10 transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl italic md:text-1xl font-bold tracking-tight text-white uppercase">
            {userData ? `Edit: ${userData.name}` : "Create New User"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pb-10">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center mb-6 space-y-3">
            <div className="relative h-24 w-24 rounded-full bg-[#161B26] border-2 border-dashed border-blue-600/50 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-all cursor-pointer group shadow-sm">
              {preview ? (
                <img
                  src={preview}
                  className="h-full w-full object-cover"
                  alt="preview"
                />
              ) : userData?.photo ? (
                <img
                  src={`http://localhost:8080/uploads/${userData.photo}`}
                  className="h-full w-full object-cover opacity-80"
                  alt="profile"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center">
                  <Camera
                    className="text-gray-500 group-hover:text-blue-500 transition-colors"
                    size={28}
                  />
                  <span className="text-[8px] font-bold text-gray-500 uppercase mt-1">
                    Upload
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {userData?.photo && !photo && (
              <div className="flex items-center bg-[#161B26] border border-white/5 rounded-full p-1 min-h-[32px] transition-all">
                {!showConfirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="flex items-center gap-2 px-3 py-1 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                  >
                    <Trash2 size={12} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      Remove Photo
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-1 px-3 py-1 bg-rose-600 text-white rounded-full hover:bg-rose-500 transition-colors"
                    >
                      <Check size={12} />
                      <span className="text-[9px] font-black uppercase">
                        Confirm
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      className="p-1 text-gray-400 hover:text-white rounded-full transition-colors"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-3 bg-[#161B26] rounded-xl border border-white/5 text-white font-medium text-xs focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600 outline-none transition-all"
                placeholder="Enter name"
                required
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full p-3 bg-[#161B26] rounded-xl border border-white/5 text-white font-medium text-xs focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600 outline-none transition-all"
                placeholder="10-digit mobile"
                required
              />
            </div>

            {/* Password - Only shown on Create */}
            {!userData && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-3 bg-[#161B26] rounded-xl border border-white/5 text-white font-medium text-xs focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600 outline-none transition-all"
                  placeholder="Security key"
                  required
                />
              </div>
            )}

            {/* Branch & Starting Point */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                  className="w-full p-3 bg-[#161B26] rounded-xl border border-white/5 text-white font-medium text-xs focus:ring-2 focus:ring-blue-600/40 outline-none"
                  placeholder="Location"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Starting Point
                </label>
                <input
                  type="text"
                  value={formData.starting_point}
                  onChange={(e) =>
                    setFormData({ ...formData, starting_point: e.target.value })
                  }
                  className="w-full p-3 bg-[#161B26] rounded-xl border border-white/5 text-white font-medium text-xs focus:ring-2 focus:ring-blue-600/40 outline-none"
                  placeholder="City"
                />
              </div>
            </div>

            {/* Blood Group & DOB */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Blood Group
                </label>
                <select
                  value={formData.blood_group}
                  onChange={(e) =>
                    setFormData({ ...formData, blood_group: e.target.value })
                  }
                  className="w-full p-3 bg-[#161B26] rounded-xl text-xs font-semibold text-white outline-none cursor-pointer border border-white/5 focus:ring-2 focus:ring-blue-600/40"
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (bg) => (
                      <option key={bg} value={bg} className="bg-[#161B26]">
                        {bg}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  className="w-full p-3 bg-[#161B26] rounded-xl border border-white/5 text-white font-medium text-xs focus:ring-2 focus:ring-blue-600/40 outline-none"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                Access Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full p-3 bg-[#161B26] rounded-xl text-xs font-semibold text-white outline-none cursor-pointer border border-white/5 focus:ring-2 focus:ring-blue-600/40"
              >
                <option value="admin" disabled className="bg-[#161B26]">
                  Admin
                </option>
                <option value="captain" className="bg-[#161B26]">
                  Captain
                </option>
                <option value="sub_captain" className="bg-[#161B26]">
                  Sub Captain
                </option>
                <option value="main_boy" className="bg-[#161B26]">
                  Main Boy
                </option>
                <option value="junior_boy" className="bg-[#161B26]">
                  Junior Boy
                </option>
              </select>
            </div>

            {/* Status Selection - Only shown on Edit */}
            {userData && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Account Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full p-3 bg-[#161B26] rounded-xl text-xs font-semibold text-white outline-none cursor-pointer border border-white/5 focus:ring-2 focus:ring-blue-600/40"
                >
                  <option
                    value="active"
                    className="bg-[#161B26] text-emerald-400"
                  >
                    Active
                  </option>
                  <option
                    value="blocked"
                    className="bg-[#161B26] text-rose-400"
                  >
                    Blocked / Suspended
                  </option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 active:scale-[0.98] transition-all mt-6 shadow-lg shadow-blue-900/20"
          >
            {userData ? "Save Changes" : "Register Member"}
          </button>
        </form>
      </div>
    </div>
  );
}
