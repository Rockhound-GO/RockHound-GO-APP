import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, XCircle, Info, ScanLine, Zap } from 'lucide-react';
import Button from '../components/Button';
import { identifySpecimen } from '../services/geminiService';
import { IdentificationResult, Mineral, RarityTier } from '../types';

interface IdentifyScreenProps {
  onAddMineral: (mineral: Mineral, xp: number) => void;
}

const IdentifyScreen: React.FC<IdentifyScreenProps> = ({ onAddMineral }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Clean base64 string for API
        const cleanedBase64 = base64String.split(',')[1];
        setImage(cleanedBase64);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    
    try {
      const data = await identifySpecimen(image);
      setResult(data);
    } catch (err) {
      setError("Failed to identify the specimen. Please check your connection or try a clearer photo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = () => {
    if (result && result.isRock) {
      const newMineral: Mineral = {
        id: crypto.randomUUID(),
        name: result.name,
        description: result.description,
        rarity: calculateRarity(result.xpValue),
        hardness: 5, // Default as Gemini might not return exact hardness in schema
        type: 'Mineral', // Simplification
        imageUrl: `data:image/jpeg;base64,${image}`,
        dateFound: new Date().toISOString().split('T')[0],
        confidence: result.confidence,
        cloverComment: result.cloverComment
      };
      
      onAddMineral(newMineral, result.xpValue);
      // Reset after collecting
      setImage(null);
      setResult(null);
    }
  };

  const calculateRarity = (xp: number): RarityTier => {
    if (xp >= 1000) return RarityTier.Legendary;
    if (xp >= 500) return RarityTier.Epic;
    if (xp >= 250) return RarityTier.Rare;
    if (xp >= 100) return RarityTier.Uncommon;
    return RarityTier.Common;
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto min-h-screen flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <ScanLine className="text-emerald-400" />
        <h1 className="text-2xl font-bold text-white tracking-wide">SCANNER<span className="text-emerald-500">.AI</span></h1>
      </div>

      {/* Scanner Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">
        <div className="relative w-full aspect-[4/5] bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-2xl group">
          
          {/* HUD Overlay */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Corner Brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-500/80 rounded-tl-sm"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-500/80 rounded-tr-sm"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-500/80 rounded-bl-sm"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-500/80 rounded-br-sm"></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

            {/* Status Text */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-emerald-500/30 px-3 py-1 rounded text-[10px] font-mono text-emerald-400 uppercase tracking-widest z-30">
              {loading ? "Analyzing..." : image ? "Subject Locked" : "Standby"}
            </div>

            {/* Active Scanning Visuals */}
            {loading && (
               <>
                 {/* Central Scanner Ring */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 z-20 opacity-80">
                    <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-2 border-t-2 border-emerald-400 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute inset-6 border-b-2 border-emerald-500/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></div>
                 </div>
                 
                 {/* Scanning Laser */}
                 <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)] z-30 animate-scan"></div>
                 
                 {/* Pulsing Grid Overlay */}
                 <div className="absolute inset-0 bg-emerald-500/5 z-10 animate-pulse"></div>
                 
                 {/* Processing Text */}
                 <div className="absolute bottom-20 left-1/2 -translate-x-1/2 font-mono text-xs text-emerald-400/80 tracking-widest uppercase animate-pulse w-full text-center">
                    Processing Spectral Data...
                 </div>
               </>
            )}
          </div>

          {/* Image Content */}
          {image ? (
            <img 
              src={`data:image/jpeg;base64,${image}`} 
              alt="Specimen" 
              className={`w-full h-full object-cover transition-all duration-700 ${
                loading 
                  ? 'opacity-50 grayscale contrast-125 sepia-[.5] hue-rotate-90 scale-105' 
                  : 'opacity-100 scale-100'
              }`} 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50">
              <div className="w-24 h-24 rounded-full border border-slate-600 flex items-center justify-center mb-4">
                 <Camera size={32} className="text-slate-500 opacity-50" />
              </div>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">No Signal</p>
            </div>
          )}
          
          {/* Result Badge Overlay */}
          {result && result.isRock && (
             <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 bg-emerald-500 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-bounce">
               {calculateRarity(result.xpValue)} SPECIMEN
             </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full space-y-3 z-30">
          {!result && (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group"
                disabled={loading}
              >
                <Upload size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                <span className="text-xs font-bold font-mono uppercase tracking-wide">Upload Log</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group"
                disabled={loading}
              >
                <Camera size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                <span className="text-xs font-bold font-mono uppercase tracking-wide">Capture</span>
              </button>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>
          )}

          {image && !result && (
            <Button 
              onClick={handleAnalyze} 
              isLoading={loading}
              className="w-full py-4 text-lg border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <Zap className="mr-2" size={20} fill="currentColor" />
              INITIATE SCAN
            </Button>
          )}

          {error && (
             <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm text-center backdrop-blur-sm">
               {error}
               <button onClick={() => setError(null)} className="block w-full mt-2 font-bold underline hover:text-white">RETRY SEQUENCE</button>
             </div>
          )}
        </div>
      </div>

      {/* Results Panel */}
      {result && (
        <div className="bg-slate-800/95 backdrop-blur-xl rounded-t-3xl border-t border-slate-700 -mx-4 mt-6 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-slide-up relative z-40">
          <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-6"></div>
          {result.isRock ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{result.name}</h2>
                  <p className="text-slate-400 font-mono text-xs uppercase tracking-wider">{result.scientificName}</p>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-lg font-mono">+{result.xpValue} XP</div>
                  <div className="text-slate-500 text-[10px] uppercase">Confidence {result.confidence}%</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border-l-2 border-emerald-500">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                    <Info size={14} />
                    <span>Field Guide Analysis</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    "{result.cloverComment}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-900/50 p-3 rounded-lg">
                   <div>
                     <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Origin</span>
                     <span className="text-white font-medium">{result.geologicalOrigin}</span>
                   </div>
                   <div>
                     <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Est. Value</span>
                     <span className="text-amber-400 font-medium">{Math.floor(result.xpValue / 10)} GemBits</span>
                   </div>
                </div>

                <Button onClick={handleCollect} className="w-full mt-2">
                  <CheckCircle size={20} />
                  LOG SPECIMEN
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
               <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                 <XCircle size={32} className="text-red-500" />
               </div>
               <h3 className="text-xl font-bold text-white">Target Invalid</h3>
               <p className="text-slate-300 text-sm">{result.cloverComment}</p>
               <Button variant="secondary" onClick={() => { setImage(null); setResult(null); }} className="w-full">
                 Reset Scanner
               </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IdentifyScreen;