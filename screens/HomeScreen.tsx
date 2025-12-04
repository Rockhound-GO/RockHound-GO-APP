import React from 'react';
import { Map, Scroll, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { UserStats } from '../types';

interface HomeScreenProps {
  stats: UserStats;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-emerald-400">RockHound</span>.
        </h1>
        <p className="text-slate-400">
          Clover here. The geological forecast is perfect for field work today.
        </p>
      </div>

      {/* Daily Bounty Card */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-8 -mt-8 group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h3 className="text-amber-400 font-bold uppercase text-xs tracking-wider mb-1">Daily Bounty</h3>
            <h2 className="text-xl font-bold text-white mb-2">The Alluvial Search</h2>
            <p className="text-slate-300 text-sm mb-4">
              My maps show river deposits nearby. Find an <b>Agate</b> or <b>Jasper</b> for a 2x XP multiplier.
            </p>
          </div>
          <Scroll className="text-amber-400" size={32} />
        </div>
        <div className="w-full bg-slate-700 h-2 rounded-full mb-2">
          <div className="bg-amber-500 w-1/3 h-full rounded-full"></div>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Progress: 0/1</span>
          <span>Reward: 150 XP</span>
        </div>
      </div>

      {/* Safety Check */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex gap-4 items-center">
        <div className="p-3 bg-red-500/10 rounded-lg">
          <AlertTriangle className="text-red-400" size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-200 text-sm">Safety First</h4>
          <p className="text-xs text-slate-400">Confirm you have your safety goggles and water before heading out.</p>
        </div>
        <button className="text-emerald-400 text-sm font-bold hover:text-emerald-300">Confirm</button>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => navigate('/map')}
          className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700 hover:border-emerald-500 transition-all cursor-pointer"
        >
          <div className="bg-blue-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <Map className="text-blue-400" size={20} />
          </div>
          <h3 className="font-bold text-white">Scout Location</h3>
          <p className="text-xs text-slate-400 mt-1">Check nearby geological nodes.</p>
        </div>

        <div 
          onClick={() => navigate('/inventory')}
          className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700 hover:border-emerald-500 transition-all cursor-pointer"
        >
          <div className="bg-purple-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <Scroll className="text-purple-400" size={20} />
          </div>
          <h3 className="font-bold text-white">Review Logs</h3>
          <p className="text-xs text-slate-400 mt-1">Manage your collection.</p>
        </div>
      </div>
      
      {/* Tip Section */}
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
        <p className="text-xs text-slate-500 italic">
          "Clover Tip: Remember, if it fizzes with weak acid, it's likely calcite or limestone. Carry a small vinegar bottle for field tests!"
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;