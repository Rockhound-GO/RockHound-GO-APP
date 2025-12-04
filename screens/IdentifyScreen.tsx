import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, XCircle, Info } from 'lucide-react';
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
      <h1 className="text-2xl font-bold text-white mb-6">Specimen ID</h1>

      {/* Image Preview Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="relative w-full aspect-square bg-slate-800 rounded-2xl border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden shadow-inner">
          {image ? (
            <img 
              src={`data:image/jpeg;base64,${image}`} 
              alt="Specimen" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="text-center p-6">
              <Camera size={48} className="text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Tap below to capture or upload</p>
            </div>
          )}
          
          {/* Rarity Badge Overlay if Result exists */}
          {result && result.isRock && (
             <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
               {calculateRarity(result.xpValue)}
             </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full space-y-3">
          {!result && (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <Upload size={24} />
                <span className="text-sm font-bold">Select Photo</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
              >
                 {/* Note: In a real mobile app, we'd trigger camera specifically. Here we reuse input */}
                <Camera size={24} />
                <span className="text-sm font-bold">Take Photo</span>
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
              className="w-full py-4 text-lg"
            >
              Analyze Specimen
            </Button>
          )}

          {error && (
             <div className="bg-red-900/50 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm text-center">
               {error}
               <button onClick={() => setError(null)} className="block w-full mt-2 font-bold underline">Try Again</button>
             </div>
          )}
        </div>
      </div>

      {/* Results Panel */}
      {result && (
        <div className="bg-slate-800 rounded-t-3xl border-t border-slate-700 -mx-4 mt-6 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-slide-up">
          {result.isRock ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{result.name}</h2>
                  <p className="text-slate-400 italic text-sm">{result.scientificName}</p>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-lg">+{result.xpValue} XP</div>
                  <div className="text-slate-500 text-xs">Confidence: {result.confidence}%</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-sm">
                    <Info size={16} />
                    <span>Clover's Analysis</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    "{result.cloverComment}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="block text-slate-500 text-xs uppercase tracking-wider">Origin</span>
                     <span className="text-white font-medium">{result.geologicalOrigin}</span>
                   </div>
                </div>

                <Button onClick={handleCollect} className="w-full mt-2">
                  <CheckCircle size={20} />
                  Add to Collection
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
               <XCircle size={48} className="text-red-500 mx-auto" />
               <h3 className="text-xl font-bold text-white">Not a Geological Specimen</h3>
               <p className="text-slate-300 text-sm">{result.cloverComment}</p>
               <Button variant="secondary" onClick={() => { setImage(null); setResult(null); }} className="w-full">
                 Try Again
               </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IdentifyScreen;