import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Camera, LayoutGrid, User, Home } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex flex-col items-center justify-center w-full h-full space-y-1 ${
      isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-700 h-20 pb-2 z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        <NavLink to="/" className={navClass}>
          <Home size={24} />
          <span className="text-xs font-medium">Field HQ</span>
        </NavLink>
        <NavLink to="/map" className={navClass}>
          <Map size={24} />
          <span className="text-xs font-medium">Map</span>
        </NavLink>
        <NavLink to="/identify" className={navClass}>
          <div className="bg-emerald-600 p-3 rounded-full -mt-8 border-4 border-slate-900 shadow-lg shadow-emerald-500/20">
            <Camera size={28} className="text-white" />
          </div>
          <span className="text-xs font-medium">Scan</span>
        </NavLink>
        <NavLink to="/inventory" className={navClass}>
          <LayoutGrid size={24} />
          <span className="text-xs font-medium">Collection</span>
        </NavLink>
        <NavLink to="/profile" className={navClass}>
          <User size={24} />
          <span className="text-xs font-medium">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;