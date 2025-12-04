import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import { GeoNode, RarityTier } from '../types';
import L from 'leaflet';
import Supercluster from 'supercluster';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Moon, Navigation, Loader2, Wind, Thermometer, Download, Check, AlertTriangle, MapPin, Signal, SignalHigh, SignalLow, SignalMedium, Info, Pickaxe } from 'lucide-react';
import { fetchLocalWeather, getWeatherIconProps, WeatherData } from '../services/weatherService';
import { MINERAL_DATABASE } from '../constants';

// Use CDN URLs for Leaflet markers as fallbacks
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper for styling based on rarity
const getRarityColors = (rarity?: RarityTier) => {
    switch (rarity) {
      case RarityTier.Uncommon: 
        return { border: 'border-emerald-400', bg: 'bg-emerald-400', shadow: 'shadow-emerald-500/50', text: 'text-emerald-400', bgSoft: 'bg-emerald-950/50' };
      case RarityTier.Rare: 
        return { border: 'border-blue-400', bg: 'bg-blue-400', shadow: 'shadow-blue-500/50', text: 'text-blue-400', bgSoft: 'bg-blue-950/50' };
      case RarityTier.Epic: 
        return { border: 'border-purple-400', bg: 'bg-purple-400', shadow: 'shadow-purple-500/60', text: 'text-purple-400', bgSoft: 'bg-purple-950/50' };
      case RarityTier.Legendary: 
        return { border: 'border-amber-400', bg: 'bg-amber-400', shadow: 'shadow-amber-500/70', text: 'text-amber-400', bgSoft: 'bg-amber-950/50' };
      default: 
        return { border: 'border-slate-400', bg: 'bg-slate-400', shadow: 'shadow-slate-500/40', text: 'text-slate-400', bgSoft: 'bg-slate-800' };
    }
};

// --- Custom Icons ---

const createClusterIcon = (count: number) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-12 h-12">
        <div class="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping"></div>
        <div class="relative w-10 h-10 bg-slate-900 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
          <span class="text-white font-bold font-mono text-sm">${count}</span>
        </div>
        <div class="absolute -bottom-1 text-[8px] bg-slate-900 px-1 rounded text-emerald-400 font-bold border border-emerald-900">
           CLUSTER
        </div>
      </div>
    `,
    className: 'bg-transparent',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });
};

const createNodeIcon = (node: GeoNode) => {
  const mineral = node.mineralId ? MINERAL_DATABASE[node.mineralId] : null;

  // Hazard: Diamond shape, pulsing red, highly visible warning
  if (node.type === 'Hazard') {
    return L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="relative flex items-center justify-center w-14 h-14">
          <div class="absolute inset-0 bg-red-500/30 rounded-full animate-ping"></div>
          <div class="relative z-10 w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 transform rotate-45 border-2 border-white shadow-[0_0_15px_rgba(220,38,38,0.6)] flex items-center justify-center group hover:scale-110 transition-transform duration-200">
             <div class="transform -rotate-45 text-white drop-shadow-md">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
             </div>
          </div>
        </div>
      `,
      iconSize: [56, 56],
      iconAnchor: [28, 28],
      popupAnchor: [0, -28]
    });
  }

  // POI: Classic Pin shape, large click target
  if (node.type === 'Point of Interest' && !mineral) {
    return L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="relative flex flex-col items-center group -mt-12 w-14 h-[70px]">
           <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center relative z-10 transition-transform group-hover:-translate-y-2 group-hover:scale-105">
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
           </div>
           <div class="w-1 h-4 bg-blue-700/80 shadow-sm"></div>
           <div class="w-5 h-2 bg-black/30 rounded-[50%] blur-[2px]"></div>
        </div>
      `,
      iconSize: [56, 70],
      iconAnchor: [28, 65],
      popupAnchor: [0, -65]
    });
  }

  // Mineral Deposit: Detailed Token
  if (mineral) {
    const colors = getRarityColors(mineral.rarity);
    const isLegendary = mineral.rarity === RarityTier.Legendary;
    const isEpic = mineral.rarity === RarityTier.Epic;
    
    // Outer glow/pulse for high tiers
    const pulseEffect = (isEpic || isLegendary) 
      ? `<div class="absolute inset-0 rounded-full ${colors.bg} opacity-40 animate-pulse"></div>` 
      : '';
      
    // Shadow intensity based on rarity
    const shadowClass = isLegendary ? 'shadow-[0_0_25px_rgba(251,191,36,0.8)]' : 'shadow-xl';
    
    // Border thickness varies by rarity
    const borderClass = isLegendary ? 'border-[3px]' : 'border-2';

    return L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="relative group w-[64px] h-[64px] flex items-center justify-center hover:z-50">
          ${pulseEffect}
          
          <!-- Outer Halo/Glass Effect -->
          <div class="absolute inset-1 rounded-full ${borderClass} ${colors.border} ${colors.bgSoft} backdrop-blur-sm opacity-90 box-border transition-all group-hover:opacity-100"></div>
          
          <!-- Image Container -->
          <div class="w-[46px] h-[46px] rounded-full overflow-hidden border-2 border-slate-900 relative z-10 ${shadowClass} transition-transform duration-300 group-hover:scale-110 bg-slate-900">
            <img src="${mineral.imageUrl}" class="w-full h-full object-cover" alt="${mineral.name}" />
            <!-- Shine/Gloss Overlay -->
            <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50"></div>
          </div>

          <!-- Rarity Gem Badge -->
          <div class="absolute bottom-1.5 right-1.5 z-20 transform transition-transform group-hover:scale-110">
             <div class="w-5 h-5 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center shadow-md">
                <div class="w-2.5 h-2.5 rounded-full ${colors.bg} ${isLegendary ? 'animate-spin' : ''}" style="animation-duration: 3s;"></div>
             </div>
          </div>
        </div>
      `,
      iconSize: [64, 64],
      iconAnchor: [32, 32],
      popupAnchor: [0, -32]
    });
  }

  // Generic Deposit: Improved appearance
  return L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="group relative w-12 h-12 flex items-center justify-center">
           <!-- Pulse for discoverability -->
           <div class="absolute inset-2 bg-emerald-500/20 rounded-full animate-pulse"></div>
           
           <!-- Main Icon -->
           <div class="relative w-11 h-11 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-full border-2 border-emerald-300 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm"><path d="m2 22 1-1h3l9-9"/><path d="M13 6h4"/><path d="M13 10v4"/><path d="M13 14h4"/></svg>
           </div>
           
           <!-- Question mark badge -->
           <div class="absolute top-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border border-emerald-800 flex items-center justify-center shadow-sm">
             <span class="text-[9px] font-black text-emerald-950">?</span>
           </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24]
  });
};

// Component to handle map view updates
const MapController = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      // Use current zoom level to avoid annoying zoom resets during tracking
      map.flyTo(center, map.getZoom(), { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

// Component to handle user interactions and clustering state
const MapClusterManager = ({ 
  nodes, 
  onClusterUpdate, 
  onUserInteraction 
}: { 
  nodes: GeoNode[], 
  onClusterUpdate: (bounds: any, zoom: number) => void,
  onUserInteraction: () => void 
}) => {
  const map = useMap();
  
  // Update clusters when the map moves or zooms
  const updateMap = useCallback(() => {
    const b = map.getBounds();
    const z = map.getZoom();
    
    // Convert Leaflet bounds to format [minLng, minLat, maxLng, maxLat] for Supercluster
    const bbox = [
      b.getWest(),
      b.getSouth(),
      b.getEast(),
      b.getNorth()
    ];
    
    onClusterUpdate(bbox, z);
  }, [map, onClusterUpdate]);

  useMapEvents({
    dragstart: () => onUserInteraction(),
    zoomstart: () => onUserInteraction(),
    moveend: updateMap,
  });

  // Initial update
  useEffect(() => {
    updateMap();
  }, [updateMap]);

  return null;
};

// Icon Mapping Component
const WeatherIcon = ({ name, className }: { name: string, className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Sun: <Sun className={className} size={24} />,
    Moon: <Moon className={className} size={24} />,
    Cloud: <Cloud className={className} size={24} />,
    CloudRain: <CloudRain className={className} size={24} />,
    CloudLightning: <CloudLightning className={className} size={24} />,
    Snowflake: <Snowflake className={className} size={24} />,
    CloudFog: <CloudFog className={className} size={24} />,
  };
  return <>{icons[name] || <Cloud className={className} size={24} />}</>;
};

const MapScreen: React.FC = () => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [viewCenter, setViewCenter] = useState<[number, number] | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [localNodes, setLocalNodes] = useState<GeoNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Cluster State
  const [clusters, setClusters] = useState<any[]>([]);
  const [mapZoom, setMapZoom] = useState(14);
  const [mapBounds, setMapBounds] = useState<any>(null);
  
  // Supercluster Instance
  const superclusterRef = useRef(new Supercluster({
    radius: 60,
    maxZoom: 16,
  }));
  
  // Offline Map States
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  
  // Refs to prevent re-initialization
  const hasInitializedData = useRef(false);
  const mapRef = useRef<L.Map | null>(null);

  // Load points into Supercluster
  useEffect(() => {
    const points = localNodes.map(node => ({
      type: 'Feature' as const,
      properties: { 
        cluster: false, 
        nodeId: node.id,
        ...node 
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [node.lng, node.lat],
      },
    }));

    superclusterRef.current.load(points);
    
    // Refresh clusters if bounds exist
    if (mapBounds) {
        setClusters(superclusterRef.current.getClusters(mapBounds, mapZoom));
    }
  }, [localNodes]);

  // Handle cluster updates from the map events
  const handleClusterUpdate = useCallback((bounds: any, zoom: number) => {
    setMapBounds(bounds);
    setMapZoom(zoom);
    if (superclusterRef.current) {
        setClusters(superclusterRef.current.getClusters(bounds, zoom));
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const watcherId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy: locAccuracy } = pos.coords;
        const userPos: [number, number] = [latitude, longitude];
        
        setPosition(userPos);
        setAccuracy(locAccuracy);
        setLoading(false);

        // Update view if tracking is enabled or if it's the first fix
        if (isTracking || !hasInitializedData.current) {
             setViewCenter(userPos);
        }

        // Initial Data Load (Nodes + Weather) - Only runs once
        if (!hasInitializedData.current) {
             hasInitializedData.current = true;
             
             // Fetch Weather
             try {
                const weatherData = await fetchLocalWeather(latitude, longitude);
                setWeather(weatherData);
             } catch (e) {
                console.error("Failed to load weather");
             }

             // Generate Local Nodes (Simulated for Demo)
             const generatedNodes: GeoNode[] = [
              { id: 'n1', lat: latitude + 0.002, lng: longitude + 0.002, type: 'Deposit', name: 'Quartz Vein', description: 'A distinct white vein cutting through the bedrock.', mineralId: 'quartz' },
              { id: 'n2', lat: latitude - 0.003, lng: longitude + 0.001, type: 'Deposit', name: 'Amethyst Geode', description: 'A hollow cavity likely containing crystals.', mineralId: 'amethyst' },
              { id: 'n3', lat: latitude + 0.001, lng: longitude - 0.004, type: 'Hazard', name: 'Steep Embankment', description: 'Loose soil, proceed with caution.' },
              { id: 'n4', lat: latitude - 0.0015, lng: longitude - 0.002, type: 'Point of Interest', name: 'Historic Placer', description: 'Site of old panning operations.', mineralId: 'gold' },
              { id: 'n5', lat: latitude + 0.004, lng: longitude - 0.001, type: 'Deposit', name: 'Copper Oxidization', description: 'Green staining on rocks indicating copper presence.', mineralId: 'malachite' },
              // Extra nodes to demonstrate clustering
              { id: 'n6', lat: latitude + 0.0022, lng: longitude + 0.0022, type: 'Deposit', name: 'Small Quartz', description: 'Fragmented quartz.', mineralId: 'quartz' },
              { id: 'n7', lat: latitude + 0.0021, lng: longitude + 0.0019, type: 'Deposit', name: 'Quartz Outcrop', description: 'Large outcrop.', mineralId: 'quartz' },
            ];
            setLocalNodes(generatedNodes);
        }
      },
      (err) => {
        console.warn("Geolocation error or timeout:", err);
        if (!position) {
            setErrorMsg("Weak GPS signal. Trying to acquire lock...");
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 20000, 
        maximumAge: 0 
      }
    );

    return () => {
        navigator.geolocation.clearWatch(watcherId);
    };
  }, [isTracking]);

  useEffect(() => {
    if (position && isTracking) {
        setViewCenter([...position]);
    }
  }, [position, isTracking]);


  const handleRecenter = () => {
      if (position) {
          setIsTracking(true);
          setViewCenter([...position]); 
      }
  };
  
  const handleDownloadMap = () => {
    if (isOfflineReady) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Simulate download process
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setIsOfflineReady(true);
          return 100;
        }
        return prev + 5; // Increment progress
      });
    }, 100);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="text-slate-400 font-mono text-sm animate-pulse">Acquiring GPS Satellite Lock...</p>
      </div>
    );
  }

  const weatherDisplay = weather ? getWeatherIconProps(weather.weatherCode, weather.isDay) : null;

  const displayTemperature = weather 
    ? Math.round(isCelsius ? weather.temperature : (weather.temperature * 9/5) + 32)
    : 0;
    
  const getGpsStatus = (acc: number) => {
    if (acc <= 15) return { color: 'bg-emerald-500', text: 'Strong', icon: SignalHigh };
    if (acc <= 50) return { color: 'bg-amber-500', text: 'Fair', icon: SignalMedium };
    return { color: 'bg-red-500', text: 'Weak', icon: SignalLow };
  };
  
  const gpsStatus = getGpsStatus(accuracy);

  return (
    <div className="h-screen w-full relative bg-slate-900 pb-20">
      
      {/* Top Left: Survey & GPS Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl w-[160px]">
            <h2 className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">Geological Survey</h2>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${gpsStatus.color} animate-pulse shadow-[0_0_8px_currentColor]`}></div>
                    <span className="text-slate-300 text-[10px] font-mono uppercase">GPS Lock</span>
                </div>
                <span className="text-white text-xs font-mono font-bold">±{Math.round(accuracy)}m</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-500">
                <gpsStatus.icon size={10} />
                <span>Signal: {gpsStatus.text}</span>
            </div>
        </div>

        {/* Offline Map Control */}
        <button 
          onClick={handleDownloadMap}
          disabled={isDownloading || isOfflineReady}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl border shadow-lg backdrop-blur-md transition-all w-[160px] ${
            isOfflineReady 
              ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-400' 
              : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {isDownloading ? (
            <Loader2 size={18} className="animate-spin text-emerald-500" />
          ) : isOfflineReady ? (
            <Check size={18} />
          ) : (
            <Download size={18} />
          )}
          
          <div className="flex flex-col items-start">
             <span className="text-[10px] font-bold uppercase tracking-wider">
               {isDownloading ? `Downloading ${downloadProgress}%` : isOfflineReady ? "Offline Ready" : "Offline Map"}
             </span>
             {isDownloading && (
               <div className="w-full h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                 <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
               </div>
             )}
          </div>
        </button>
      </div>

      {/* Top Right: Weather Overlay */}
      {weather && weatherDisplay && (
        <button 
          onClick={() => setIsCelsius(!isCelsius)}
          className="absolute top-4 right-4 z-[400] bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl flex flex-col items-end min-w-[120px] cursor-pointer hover:bg-slate-800/90 transition-colors group text-right"
          aria-label="Toggle Temperature Unit"
        >
          <div className="flex items-center gap-2 mb-1 justify-end">
            <span className="text-slate-200 font-bold text-lg tabular-nums">{displayTemperature}°{isCelsius ? 'C' : 'F'}</span>
            <WeatherIcon name={weatherDisplay.iconName} className={weatherDisplay.color} />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 justify-end">
             <span className="font-medium">{weatherDisplay.label}</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500 justify-end">
             <Wind size={10} />
             <span>{weather.windSpeed} km/h</span>
          </div>
          
          <div className="mt-2 flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
            <Thermometer size={10} />
            {isCelsius ? 'Metric' : 'Imperial'}
          </div>
        </button>
      )}

      {/* Map */}
      <MapContainer 
        center={viewCenter || [51.505, -0.09]} 
        zoom={14} 
        scrollWheelZoom={true} 
        className="h-full w-full z-0"
        zoomControl={false}
        ref={mapRef}
      >
        <MapController center={viewCenter} />
        <MapClusterManager 
          nodes={localNodes} 
          onClusterUpdate={handleClusterUpdate}
          onUserInteraction={() => setIsTracking(false)}
        />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark" 
        />
        
        {/* User Location */}
        {position && (
          <>
            <Circle 
                center={position} 
                radius={accuracy} 
                pathOptions={{ 
                  color: '#10b981', 
                  fillColor: '#10b981', 
                  fillOpacity: 0.05, 
                  weight: 1, 
                  dashArray: '5, 5' 
                }} 
            />
            <Circle 
                center={position} 
                radius={Math.min(accuracy / 2, 10)} 
                pathOptions={{ 
                  color: '#10b981', 
                  fillColor: '#10b981', 
                  fillOpacity: 0.2, 
                  weight: 0, 
                  className: 'animate-pulse' 
                }} 
            />
            
            <Marker position={position} icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px #10b981;"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            })}>
                <Popup className="custom-popup">
                <div className="text-center">
                    <strong className="text-slate-100">Current Location</strong>
                    <div className="text-xs text-slate-400 mt-1">Accuracy: ±{Math.round(accuracy)}m</div>
                    <div className="text-[10px] text-emerald-400 mt-1">{isTracking ? 'Tracking Active' : 'Tracking Paused'}</div>
                </div>
                </Popup>
            </Marker>
          </>
        )}

        {/* Clusters & Markers */}
        {clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, point_count: pointCount, nodeId } = cluster.properties;

            // Render Cluster
            if (isCluster) {
                return (
                    <Marker
                        key={`cluster-${cluster.id}`}
                        position={[latitude, longitude]}
                        icon={createClusterIcon(pointCount)}
                        eventHandlers={{
                            click: () => {
                                const expansionZoom = Math.min(
                                    superclusterRef.current.getClusterExpansionZoom(cluster.id),
                                    17
                                );
                                mapRef.current?.flyTo([latitude, longitude], expansionZoom);
                            }
                        }}
                    />
                );
            }

            // Render Individual Marker
            // We need to find the original node object to pass to createNodeIcon
            const originalNode = localNodes.find(n => n.id === nodeId);
            if (!originalNode) return null;

            const mineral = originalNode.mineralId ? MINERAL_DATABASE[originalNode.mineralId] : null;
            const rarityColors = mineral ? getRarityColors(mineral.rarity) : getRarityColors();

            return (
              <Marker key={originalNode.id} position={[originalNode.lat, originalNode.lng]} icon={createNodeIcon(originalNode)}>
                <Popup className="custom-popup" closeButton={false}>
                  <div className="text-slate-100 min-w-[200px] p-1">
                    {/* Popup Header with Image */}
                    {mineral && (
                        <div className={`relative h-24 -mx-5 -mt-5 mb-3 overflow-hidden rounded-t-lg border-b-2 ${rarityColors.border}`}>
                            <div className={`absolute inset-0 ${rarityColors.bg} opacity-20`}></div>
                            <img src={mineral.imageUrl} className="w-full h-full object-cover" alt={mineral.name} />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent h-12"></div>
                            <div className="absolute bottom-2 left-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border bg-slate-900/80 backdrop-blur-sm ${rarityColors.text} ${rarityColors.border}`}>
                                    {mineral.rarity}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <strong className="block text-base leading-tight">{originalNode.name}</strong>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wide">{originalNode.type}</span>
                        </div>
                        {originalNode.type === 'Hazard' && <AlertTriangle size={18} className="text-red-500" />}
                    </div>
                    
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed opacity-90">{originalNode.description}</p>
                    
                    <button className={`w-full ${rarityColors.bg} hover:opacity-90 text-white text-xs py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg`}>
                        <Pickaxe size={14} />
                        {originalNode.type === 'Deposit' ? 'Excavate Deposit' : 'Log Visit'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
        })}
      </MapContainer>

      {/* Recenter Button */}
      <button 
        onClick={handleRecenter}
        className={`absolute bottom-24 right-4 z-[400] p-3 rounded-full text-white shadow-lg border active:scale-95 transition-all ${
           isTracking 
             ? 'bg-emerald-600 border-emerald-500 ring-2 ring-emerald-500/20' 
             : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
        }`}
        aria-label="Recenter Map"
      >
        <Navigation size={24} className={isTracking ? "text-white" : "text-emerald-400"} />
      </button>

      {errorMsg && (
        <div className="absolute bottom-24 left-4 right-16 z-[400] bg-red-900/90 text-white p-3 rounded-xl border border-red-500 text-xs">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default MapScreen;