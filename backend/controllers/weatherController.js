const axios = require('axios');

// WMO weather codes -> human readable condition + a simple icon key the frontend can map
const WMO_CODES = {
  0: { text: 'Clear Sky', icon: 'sun' },
  1: { text: 'Mainly Clear', icon: 'sun' },
  2: { text: 'Partly Cloudy', icon: 'cloud-sun' },
  3: { text: 'Overcast', icon: 'cloud' },
  45: { text: 'Fog', icon: 'cloud' },
  48: { text: 'Depositing Rime Fog', icon: 'cloud' },
  51: { text: 'Light Drizzle', icon: 'cloud-rain' },
  53: { text: 'Moderate Drizzle', icon: 'cloud-rain' },
  55: { text: 'Dense Drizzle', icon: 'cloud-rain' },
  61: { text: 'Slight Rain', icon: 'cloud-rain' },
  63: { text: 'Moderate Rain', icon: 'cloud-rain' },
  65: { text: 'Heavy Rain', icon: 'cloud-rain' },
  71: { text: 'Slight Snow', icon: 'snow' },
  73: { text: 'Moderate Snow', icon: 'snow' },
  75: { text: 'Heavy Snow', icon: 'snow' },
  80: { text: 'Rain Showers', icon: 'cloud-rain' },
  81: { text: 'Moderate Rain Showers', icon: 'cloud-rain' },
  82: { text: 'Violent Rain Showers', icon: 'cloud-rain' },
  95: { text: 'Thunderstorm', icon: 'storm' },
  96: { text: 'Thunderstorm with Hail', icon: 'storm' },
  99: { text: 'Thunderstorm with Heavy Hail', icon: 'storm' },
};

const codeToCondition = (code) => WMO_CODES[code] || { text: 'Clear', icon: 'sun' };

const dayName = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

const hourLabel = (dateStr) =>
  new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

// @desc   Get current + forecast weather for a city name or lat/lon
// @route  GET /api/weather?city=Rajkot   OR   /api/weather?lat=22.3&lon=70.8
// @access Public
const getWeather = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    let latitude = lat;
    let longitude = lon;
    let resolvedName = city || 'Your Location';

    // 1. Resolve city name -> coordinates using Open-Meteo's free geocoding API
    if (!latitude || !longitude) {
      if (!city) {
        return res.status(400).json({ message: 'Please provide a "city" or "lat"/"lon" query parameter' });
      }
      const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name: city, count: 1, language: 'en', format: 'json' },
      });

      const place = geoRes.data?.results?.[0];
      if (!place) {
        return res.status(404).json({ message: `Could not find location "${city}". Try a nearby larger town/city.` });
      }
      latitude = place.latitude;
      longitude = place.longitude;
      resolvedName = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
    }

    // 2. Fetch current + hourly + daily forecast (includes agricultural fields!)
    const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
        hourly:
          'temperature_2m,weather_code,uv_index,soil_moisture_0_to_1cm,et0_fao_evapotranspiration',
        daily: 'temperature_2m_max,temperature_2m_min,weather_code,et0_fao_evapotranspiration',
        forecast_days: 6,
        timezone: 'auto',
      },
    });

    const current = data.current;
    const condition = codeToCondition(current.weather_code);

    // Find the hourly index closest to "now" to read UV index / soil moisture / evapotranspiration
    const nowIso = current.time;
    let nowIdx = data.hourly.time.indexOf(nowIso);
    if (nowIdx === -1) nowIdx = 0;

    const soilMoistureRaw = data.hourly.soil_moisture_0_to_1cm?.[nowIdx] ?? 0.25; // m3/m3
    const soilMoisturePct = Math.min(100, Math.round(soilMoistureRaw * 100 * 2)); // rough % scale for UI bar
    const uvIndex = Math.round(data.hourly.uv_index?.[nowIdx] ?? 0);
    const evapotranspiration = data.daily.et0_fao_evapotranspiration?.[0] ?? 0;

    // Next 6 hours forecast starting from current hour
    const hourlyForecast = [];
    for (let i = nowIdx; i < Math.min(nowIdx + 6, data.hourly.time.length); i++) {
      hourlyForecast.push({
        time: hourLabel(data.hourly.time[i]),
        temp: Math.round(data.hourly.temperature_2m[i]),
        icon: codeToCondition(data.hourly.weather_code[i]).icon,
      });
    }

    // Next 5 days
    const weeklyForecast = data.daily.time.slice(0, 5).map((d, i) => ({
      day: dayName(d),
      max: Math.round(data.daily.temperature_2m_max[i]),
      min: Math.round(data.daily.temperature_2m_min[i]),
      condition: codeToCondition(data.daily.weather_code[i]).text,
    }));

    return res.json({
      location: resolvedName,
      coordinates: { lat: latitude, lon: longitude },
      current: {
        temp: Math.round(current.temperature_2m * 10) / 10,
        humidity: Math.round(current.relative_humidity_2m),
        wind: Math.round(current.wind_speed_10m * 10) / 10,
        uvIndex,
        soilMoisture: soilMoisturePct,
        evapotranspiration: Math.round(evapotranspiration * 10) / 10,
        condition: condition.text,
        icon: condition.icon,
      },
      hourlyForecast,
      weeklyForecast,
      source: 'Open-Meteo (open-meteo.com)',
    });
  } catch (error) {
    console.error('Weather API error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch weather data. Please try again.' });
  }
};

module.exports = { getWeather };
