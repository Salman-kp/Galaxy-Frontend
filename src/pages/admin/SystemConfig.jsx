import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

const SystemConfig = () => {
  const [settings, setSettings] = useState({
    maintenance_mode: "false",
    worker_access_disabled: "false",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/admin/settings");
      const fetchedSettings = {};
      response.data.settings.forEach((s) => {
        fetchedSettings[s.key] = s.value;
      });
      // Merge with defaults to ensure keys exist
      setSettings((prev) => ({ ...prev, ...fetchedSettings }));
    } catch (error) {
      console.error("Failed to fetch settings", error);
      toast.error("Could not load system settings");
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key, currentValue) => {
    const newValue = currentValue === "true" ? "false" : "true";
    try {
      await api.put("/admin/settings", { key, value: newValue });
      setSettings((prev) => ({ ...prev, [key]: newValue }));
      
      if (key === "maintenance_mode" && newValue === "true") {
        toast.warning("System is now in Maintenance Mode!");
      } else if (key === "worker_access_disabled" && newValue === "true") {
        toast.warning("Worker access has been disabled!");
      } else {
        toast.success("Settings updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update setting");
    }
  };
  if (loading) {
  return <div className="text-white p-6">Loading system settings...</div>;
}
  return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto  p-6">
          <div className="container mx-auto px-6 py-8">
             <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">System Configuration</h1>

            <div className="grid pt-7 gap-6 mb-8 md:grid-cols-2">
              {/* Maintenance Mode Card */}
              <div className={`p-6 rounded-lg shadow-lg border-l-4 ${settings.maintenance_mode === "true" ? "bg-red-50 border-red-500" : "bg-white border-green-500"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">Maintenance Mode</h4>
                    <p className="text-gray-600 mt-2 text-sm">
                      When enabled, only Administrators can access the system. All other users (Captains, Workers) will see a "Under Maintenance" screen.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => toggleSetting("maintenance_mode", settings.maintenance_mode)}
                      className={`relative inline-flex items-center h-8 rounded-full w-14 transition-colors focus:outline-none ${
                        settings.maintenance_mode === "true" ? "bg-red-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform ${
                          settings.maintenance_mode === "true" ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-sm font-semibold">
                  Status: <span className={settings.maintenance_mode === "true" ? "text-red-600" : "text-green-600"}>
                    {settings.maintenance_mode === "true" ? "ACTIVE (System Down)" : "NORMAL"}
                  </span>
                </div>
              </div>

              {/* Disable Worker Access Card */}
              <div className={`p-6 rounded-lg shadow-lg border-l-4 ${settings.worker_access_disabled === "true" ? "bg-orange-50 border-orange-500" : "bg-white border-blue-500"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">Disable Worker Access</h4>
                    <p className="text-gray-600 mt-2 text-sm">
                     Prevents all non-admin users (Captains & Workers) from accessing the upcoimg Events.
                    </p>

                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => toggleSetting("worker_access_disabled", settings.worker_access_disabled)}
                      className={`relative inline-flex items-center h-8 rounded-full w-14 transition-colors focus:outline-none ${
                        settings.worker_access_disabled === "true" ? "bg-orange-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform ${
                          settings.worker_access_disabled === "true" ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-sm font-semibold">
                  Status: <span className={settings.worker_access_disabled === "true" ? "text-orange-600" : "text-blue-600"}>
                    {settings.worker_access_disabled === "true" ? "LOCKED (Workers Blocked)" : "OPEN"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
};

export default SystemConfig;