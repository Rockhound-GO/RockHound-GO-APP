
export interface WeatherData {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
}

export const fetchLocalWeather = async (lat: number, lng: number): Promise<WeatherData> => {
  try {
    // OpenMeteo is a free, open-source weather API that requires no key for basic usage
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    );
    const data = await response.json();
    return {
      temperature: data.current_weather.temperature,
      windSpeed: data.current_weather.windspeed,
      weatherCode: data.current_weather.weathercode,
      isDay: data.current_weather.is_day === 1
    };
  } catch (error) {
    console.error("Weather fetch failed", error);
    // Return fallback data if fetch fails
    return {
      temperature: 20,
      windSpeed: 5,
      weatherCode: 0,
      isDay: true
    };
  }
};

export const getWeatherIconProps = (code: number, isDay: boolean) => {
  // WMO Weather interpretation codes
  // 0: Clear sky
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  // 45, 48: Fog
  // 51, 53, 55: Drizzle
  // 61, 63, 65: Rain
  // 71, 73, 75: Snow fall
  // 95: Thunderstorm

  if (code === 0) return { label: 'Clear', iconName: isDay ? 'Sun' : 'Moon', color: isDay ? 'text-amber-400' : 'text-slate-300' };
  if (code <= 3) return { label: 'Cloudy', iconName: 'Cloud', color: 'text-slate-400' };
  if (code <= 48) return { label: 'Fog', iconName: 'CloudFog', color: 'text-slate-500' };
  if (code <= 67) return { label: 'Rain', iconName: 'CloudRain', color: 'text-blue-400' };
  if (code <= 77) return { label: 'Snow', iconName: 'Snowflake', color: 'text-cyan-200' };
  if (code <= 82) return { label: 'Showers', iconName: 'CloudRain', color: 'text-blue-400' };
  if (code >= 95) return { label: 'Storm', iconName: 'CloudLightning', color: 'text-purple-400' };
  
  return { label: 'Unknown', iconName: 'Cloud', color: 'text-slate-400' };
};
