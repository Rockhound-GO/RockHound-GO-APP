import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import IdentifyScreen from './screens/IdentifyScreen';
import InventoryScreen from './screens/InventoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import { UserStats, Mineral } from './types';
import { INITIAL_STATS, MOCK_INVENTORY } from './constants';

const AppContent: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [inventory, setInventory] = useState<Mineral[]>(MOCK_INVENTORY);
  const location = useLocation();

  // Simple scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleAddMineral = (mineral: Mineral, xp: number) => {
    setInventory(prev => [mineral, ...prev]);
    setStats(prev => {
      const newXp = prev.xp + xp;
      // Simple level up logic
      const didLevelUp = newXp >= prev.xpToNext;
      return {
        ...prev,
        xp: newXp,
        level: didLevelUp ? prev.level + 1 : prev.level,
        xpToNext: didLevelUp ? prev.xpToNext * 1.5 : prev.xpToNext,
        gemBits: prev.gemBits + 10 // Tiny bonus for finding anything
      };
    });
    
    // Alert for the demo (in prod use a toast)
    setTimeout(() => {
        alert(`🎉 You earned ${xp} XP and added ${mineral.name} to your collection!`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30">
      <Header stats={stats} />
      
      <main>
        <Routes>
          <Route path="/" element={<HomeScreen stats={stats} />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/identify" element={<IdentifyScreen onAddMineral={handleAddMineral} />} />
          <Route path="/inventory" element={<InventoryScreen inventory={inventory} />} />
          <Route path="/profile" element={<ProfileScreen stats={stats} inventory={inventory} />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;