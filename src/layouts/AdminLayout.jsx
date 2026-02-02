import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0c]">   
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto bg-[#0a0a0c] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#000000] [&::-webkit-scrollbar-thumb]:bg-[#1d1d21] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-600">
          <div className="max-w-7xl mx-auto p-4 md:p-10 pt-24 md:pt-28 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}