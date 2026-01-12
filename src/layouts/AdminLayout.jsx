import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";

export default function AdminLayout() {
  return (
<div className="flex h-screen w-full overflow-hidden bg-gray-200">   
     <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto p-4 md:p-10 pt-24 md:pt-28 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
