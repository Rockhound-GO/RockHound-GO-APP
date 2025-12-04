import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { GeoNode } from '../types';
import L from 'leaflet';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Moon, Navigation, Loader2, Wind, Thermometer } from 'lucide-react';
import { fetchLocalWeather, getWeatherIconProps, WeatherData } from '../services/weatherService';

// Use CDN URLs for Leaflet markers
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

// Component to handle map view updates
const MapController = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
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
  const [accuracy, setAccuracy] = useState<number>(0);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [localNodes, setLocalNodes] = useState<GeoNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Refs to prevent re-initialization
  const hasInitializedData = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    // Use watchPosition for continuous high-accuracy updates
    const watcherId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy: locAccuracy } = pos.coords;
        const userPos: [number, number] = [latitude, longitude];
        
        setPosition(userPos);
        setAccuracy(locAccuracy);
        setLoading(false);

        // Only set view center on first fix to allow user panning
        if (!hasInitializedData.current) {
             setViewCenter(userPos);
             hasInitializedData.current = true;
             
             // Fetch Weather (Once on init)
             try {
                const weatherData = await fetchLocalWeather(latitude, longitude);
                setWeather(weatherData);
             } catch (e) {
                console.error("Failed to load weather");
             }

             // Generate Local Nodes (Once on init)
             const generatedNodes: GeoNode[] = [
              { 
                id: 'n1', 
                lat: latitude + 0.002, 
                lng: longitude + 0.002, 
                type: 'Deposit', 
                name: 'Local Creek Bed', 
                description: 'Potential for alluvial deposits.' 
              },
              { 
                id: 'n2', 
                lat: latitude - 0.003, 
                lng: longitude + 0.001, 
                type: 'Point of Interest', 
                name: 'Outcrop Formation', 
                description: 'Visible stratification.' 
              },
              { 
                id: 'n3', 
                lat: latitude + 0.001, 
                lng: longitude - 0.004, 
                type: 'Hazard', 
                name: 'Steep Embankment', 
                description: 'Loose soil, proceed with caution.' 
              },
            ];
            setLocalNodes(generatedNodes);
        }
      },
      (err) => {
        if (!position) {
            setErrorMsg("Unable to retrieve your location. " + err.message);
            setLoading(false);
            // Fallback to London
            const fallback: [number, number] = [51.505, -0.09];
            setPosition(fallback);
            setViewCenter(fallback);
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
  }, []);

  const handleRecenter = () => {
      if (position) {
          setViewCenter([...position]); // Create new array ref to trigger effect
      }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="text-slate-400 font-mono text-sm animate-pulse">Triangulating Position...</p>
      </div>
    );
  }

  const weatherDisplay = weather ? getWeatherIconProps(weather.weatherCode, weather.isDay) : null;

  const displayTemperature = weather 
    ? Math.round(isCelsius ? weather.temperature : (weather.temperature * 9/5) + 32)
    : 0;

  return (
    <div className="h-screen w-full relative bg-slate-900 pb-20">
      
      {/* Top Left: Survey Overlay */}
      <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl max-w-[150px]">
        <h2 className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider mb-1">Geological Survey</h2>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <p className="text-white text-xs">Scanning Area...</p>
        </div>
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
          
          {/* Toggle Indicator */}
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
      >
        <MapController center={viewCenter} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark" 
        />
        
        {/* User Location Marker - Represented as a pulsing circle */}
        {position && (
          <>
            <Circle 
                center={position} 
                radius={Math.max(accuracy, 20)} 
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 1 }} 
            />
            <Marker position={position} icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px #10b981;"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            })}>
                <Popup>
                <div className="text-center">
                    <strong className="text-slate-900">Current Location</strong>
                    <div className="text-xs text-slate-500 mt-1">Accuracy: ±{Math.round(accuracy)}m</div>
                </div>
                </Popup>
            </Marker>
          </>
        )}

        {/* Nodes */}
        {localNodes.map((node) => (
          <Marker key={node.id} position={[node.lat, node.lng]}>
            <Popup className="custom-popup">
              <div className="text-slate-900 min-w-[150px]">
                <strong className="block text-lg mb-1">{node.name}</strong>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded text-white mb-2 ${
                    node.type === 'Hazard' ? 'bg-red-500' : 
                    node.type === 'Point of Interest' ? 'bg-blue-500' : 'bg-emerald-500'
                }`}>
                    {node.type}
                </span>
                <p className="text-sm text-slate-600 mb-3">{node.description}</p>
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 rounded font-bold transition-colors">
                    Log Visit
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Recenter Button */}
      <button 
        onClick={handleRecenter}
        className="absolute bottom-24 right-4 z-[400] bg-slate-800 p-3 rounded-full text-white shadow-lg border border-slate-700 active:scale-95 transition-transform hover:bg-slate-700"
        aria-label="Recenter Map"
      >
        <Navigation size={24} className="text-emerald-400" />
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