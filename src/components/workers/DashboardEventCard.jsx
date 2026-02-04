import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardEventCard = ({ event, onClick }) => {
  const { role } = useAuth();
  
  const eventDate = new Date(event.date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString('default', { month: 'short' });

  const getRemainingSlots = () => {
    switch (role) {
      case 'sub_captain': return event.remaining_sub_captains;
      case 'main_boy': return event.remaining_main_boys;
      case 'junior_boy': return event.remaining_juniors; 
      default: return 0;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; 
    return `${h}:${minutes} ${ampm}`;
  };

  const remainingSlots = getRemainingSlots();

  return (
    <div 
      onClick={() => onClick(event.id)}
      className="bg-[#8B2318] hover:bg-[#6b1b12] text-white rounded-xl p-4 mb-3 flex items-center transition-colors cursor-pointer shadow-md active:scale-[0.99] group"
    >
      <div className="flex flex-col items-center justify-center border-r border-white/20 pr-4 mr-4 min-w-[65px]">
        <span className="text-5xl font-bold leading-none tracking-tighter">
          {day}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest opacity-80 -mt-1">
          {month}
        </span>
      </div>

      {/* CENTER CONTENT SECTION */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5 truncate">
            <h3 className="text-xl font-bold capitalize leading-tight tracking-tight truncate">
              {event.name} 
            </h3>
             <p className="text-xs font-bold uppercase opacity-90">
              {event.time_slot}
            </p>
            
            {/* DYNAMIC ROLE-BASED SLOTS */}
           <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${remainingSlots > 0 ? 'text-gray-400' : 'text-gray-600'}`}>
              {remainingSlots > 0 
                ? `(${remainingSlots}) SLOTS AVAILABLE` 
                : `FULL`}
            </p>
          </div>
          
          <div className="text-right flex flex-col items-end flex-shrink-0 ml-2">
            <p className="text-sm font-bold whitespace-nowrap">
              {formatTime(event.reporting_time)}
            </p>
            {event.transport_provided && event.transport_type && (
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1">
                [{event.transport_type}]
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* END SECTION */}
      <div className="ml-2 opacity-30 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={20} />
      </div>
    </div>
  );
};

export default DashboardEventCard;