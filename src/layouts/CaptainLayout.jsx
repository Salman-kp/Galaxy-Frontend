import { Outlet } from "react-router-dom";
import CaptainSidebar from "../components/captain/CaptainSidebar";
import CaptainTopbar from "../components/captain/CaptainTopbar";

export default function CaptainLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#ffffff]">   
      <CaptainSidebar/>
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <CaptainTopbar />
        <main className="flex-1 overflow-y-auto bg-[#fdfdfd] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#ffffff] [&::-webkit-scrollbar-thumb]:bg-[#1d1d21] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-600">
          <div className="max-w-7xl mx-auto p-4 md:p-10 pt-24 md:pt-28 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}