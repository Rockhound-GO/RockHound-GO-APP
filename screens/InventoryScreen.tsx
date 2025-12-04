import React, { useState } from 'react';
import { Mineral, RarityTier } from '../types';
import { Search, Filter, Hexagon } from 'lucide-react';

interface InventoryScreenProps {
  inventory: Mineral[];
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ inventory }) => {
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || item.rarity === filter;
    return matchesSearch && matchesFilter;
  });

  const getRarityColor = (rarity: RarityTier) => {
    switch (rarity) {
      case RarityTier.Common: return 'border-slate-500 text-slate-400';
      case RarityTier.Uncommon: return 'border-emerald-500 text-emerald-400';
      case RarityTier.Rare: return 'border-blue-500 text-blue-400';
      case RarityTier.Epic: return 'border-purple-500 text-purple-400';
      case RarityTier.Legendary: return 'border-amber-500 text-amber-400';
      default: return 'border-slate-500';
    }
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Field Collection</h1>
        <span className="text-slate-400 text-sm font-mono">{inventory.length} Specs</span>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search specimens..." 
            className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                filter === f 
                  ? 'bg-emerald-600 border-emerald-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredInventory.map((item) => (
          <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 group hover:border-slate-500 transition-colors">
            <div className="aspect-square relative overflow-hidden bg-slate-900">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className={`absolute top-2 right-2 p-1 bg-slate-900/80 rounded-full backdrop-blur-sm border ${getRarityColor(item.rarity)}`}>
                <Hexagon size={14} fill="currentColor" className="opacity-50" />
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-white truncate">{item.name}</h3>
              <p className="text-xs text-slate-500 truncate">{item.dateFound}</p>
              {item.cloverComment && (
                <div className="mt-2 text-[10px] text-slate-400 italic line-clamp-2 border-l-2 border-emerald-500 pl-2">
                  "{item.cloverComment}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="text-slate-500" />
          </div>
          <p className="text-slate-400">No specimens found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default InventoryScreen;