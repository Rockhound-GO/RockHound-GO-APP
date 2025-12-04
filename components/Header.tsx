import React from 'react';
import { UserStats } from '../types';
import { Pickaxe, Gem } from 'lucide-react';

interface HeaderProps {
  stats: UserStats;
}

const Header: React.FC<HeaderProps> = ({ stats }) => {
  const progressPercent = Math.min(100, (stats.xp / stats.xpToNext) * 100);

  return (
    <header className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 z-40 px-4 py-3">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white font-bold border-2 border-slate-800">
            {stats.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100">{stats.class}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono flex items-center gap-1">
                 <Gem size={10} /> {stats.gemBits}
              </span>
            </div>
            <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400 text-sm">
           <Pickaxe size={16} className="text-emerald-500" />
           <span>Streak: <b className="text-white">{stats.streak}</b></span>
        </div>
      </div>
    </header>
  );
};

export default Header;