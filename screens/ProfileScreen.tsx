import React from 'react';
import { UserStats, Mineral, RarityTier } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, Award, Target } from 'lucide-react';

interface ProfileScreenProps {
  stats: UserStats;
  inventory: Mineral[];
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ stats, inventory }) => {
  
  // Calculate rarity distribution
  const rarityData = [
    { name: 'Common', value: inventory.filter(i => i.rarity === RarityTier.Common).length, color: '#94a3b8' },
    { name: 'Uncommon', value: inventory.filter(i => i.rarity === RarityTier.Uncommon).length, color: '#10b981' },
    { name: 'Rare', value: inventory.filter(i => i.rarity === RarityTier.Rare).length, color: '#3b82f6' },
    { name: 'Epic', value: inventory.filter(i => i.rarity === RarityTier.Epic).length, color: '#a855f7' },
    { name: 'Legendary', value: inventory.filter(i => i.rarity === RarityTier.Legendary).length, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto min-h-screen space-y-6">
      <div className="text-center py-6">
        <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-emerald-600 to-cyan-700 rounded-full p-1 shadow-2xl shadow-emerald-900/50">
           <img 
            src="https://picsum.photos/id/64/200/200" 
            alt="Avatar" 
            className="w-full h-full rounded-full border-4 border-slate-900 object-cover"
           />
        </div>
        <h1 className="text-2xl font-bold text-white mt-3">Geologist Cody</h1>
        <p className="text-emerald-400 font-medium">Level {stats.level} {stats.class}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 p-3 rounded-xl text-center border border-slate-700">
            <Trophy className="mx-auto text-amber-400 mb-1" size={20} />
            <div className="text-xl font-bold text-white">{stats.gemBits}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">GemBits</div>
        </div>
        <div className="bg-slate-800 p-3 rounded-xl text-center border border-slate-700">
            <Award className="mx-auto text-purple-400 mb-1" size={20} />
            <div className="text-xl font-bold text-white">{inventory.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Finds</div>
        </div>
        <div className="bg-slate-800 p-3 rounded-xl text-center border border-slate-700">
            <Target className="mx-auto text-red-400 mb-1" size={20} />
            <div className="text-xl font-bold text-white">{stats.streak}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Day Streak</div>
        </div>
      </div>

      {/* Collection Chart */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
        <h3 className="text-white font-bold mb-4">Collection Composition</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rarityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {rarityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
            {rarityData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-xs text-slate-400">{d.name}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Badges Placeholder */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
        <h3 className="text-white font-bold mb-4">Recent Achievements</h3>
        <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
                    <Award size={20} />
                </div>
                <div>
                    <h4 className="text-white text-sm font-bold">Mohs Master</h4>
                    <p className="text-xs text-slate-400">Collected minerals of hardness 1-7.</p>
                </div>
             </div>
             <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg opacity-50">
                <div className="w-10 h-10 bg-slate-600/20 rounded-full flex items-center justify-center text-slate-500">
                    <Trophy size={20} />
                </div>
                <div>
                    <h4 className="text-white text-sm font-bold">Sedimentary Specialist</h4>
                    <p className="text-xs text-slate-400">Locked - Find 5 more sedimentary rocks.</p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;