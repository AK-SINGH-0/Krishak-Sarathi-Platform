import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  BsSearch, BsDropletHalf, BsWind, BsSun, BsCloudSun, BsThermometerHalf, BsMoisture,
  BsCloud, BsCloudRain, BsSnow, BsCloudLightning, BsGeoAlt
} from 'react-icons/bs';
import api, { getErrorMessage } from '../../utils/api';
import './Weather.css';

// Maps the "icon" key returned by the backend to a react-icon component
const ICONS = {
  sun: <BsSun />,
  'cloud-sun': <BsCloudSun />,
  cloud: <BsCloud />,
  'cloud-rain': <BsCloudRain />,
  snow: <BsSnow />,
  storm: <BsCloudLightning />,
};
const renderIcon = (key) => ICONS[key] || <BsCloudSun />;

const Weather = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(t('weather.defaultLocation'));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState(t('weather.defaultLocation'));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      // Clean up words like 'weather', 'forecast' if typed by user
      const cleanCity = q.replace(/weather|rain|forecast|mausam/gi, '').trim();
      if (cleanCity) {
        setSearchQuery(cleanCity);
      }
    }
  }, [location]);

  const [weatherData, setWeatherData] = useState({
    temp: 0,
    humidity: 0,
    wind: 0,
    uvIndex: 0,
    soilMoisture: 0,
    evapotranspiration: 0,
    condition: '—',
    icon: 'cloud-sun',
  });
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [weeklyForecast, setWeeklyForecast] = useState([]);

  // Live clock only (real weather values come from the backend, not simulated)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeather = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await api.get('/weather', { params });
      setWeatherData(data.current);
      setHourlyForecast(data.hourlyForecast);
      setWeeklyForecast(data.weeklyForecast);
      setLocationLabel(data.location);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load default location's weather on first mount
  useEffect(() => {
    fetchWeather({ city: searchQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      fetchWeather({ city: searchQuery.trim() });
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('weather.geoUnsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => toast.error(t('weather.geoDenied'))
    );
  };

  return (
    <div className="container weather-page">
      <div className="weather-header-section">
        <div>
          <h2>{t('weather.title')}</h2>
          <p className="text-muted">{t('weather.liveUpdates', { time: currentTime.toLocaleTimeString() })}</p>
        </div>
        <form className="weather-search glass-panel" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder={t('weather.searchPlaceholder')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="button" className="icon-btn" title={t('weather.useMyLocation')} onClick={handleUseMyLocation}>
            <BsGeoAlt />
          </button>
          <button type="submit" disabled={loading}><BsSearch /></button>
        </form>
      </div>

      <div className="grid-layout cols-3 weather-main-grid">
        {/* Current Weather Card */}
        <div className="glass-panel current-weather-card col-span-2">
          <div className="current-header">
            <h3>{locationLabel}</h3>
            <span className="live-indicator"><span className="live-dot"></span> {loading ? '...' : t('weather.live')}</span>
          </div>
          <div className="current-body">
            <div className="temp-display">
              <span className="main-weather-icon">{renderIcon(weatherData.icon)}</span>
              <div>
                <h1 className="huge-temp">{weatherData.temp}°C</h1>
                <p className="condition-text">{weatherData.condition}</p>
              </div>
            </div>
            <div className="weather-metrics-grid">
              <div className="metric-item">
                <BsDropletHalf className="metric-icon" />
                <div>
                  <p>{t('weather.metrics.humidity')}</p>
                  <h4>{weatherData.humidity}%</h4>
                </div>
              </div>
              <div className="metric-item">
                <BsWind className="metric-icon" />
                <div>
                  <p>{t('weather.metrics.wind')}</p>
                  <h4>{weatherData.wind} km/h</h4>
                </div>
              </div>
              <div className="metric-item">
                <BsSun className="metric-icon text-yellow" />
                <div>
                  <p>{t('weather.metrics.uvIndex')}</p>
                  <h4>{weatherData.uvIndex}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agricultural Metrics */}
        <div className="glass-panel agri-metrics-card">
          <h3>{t('weather.metrics.title')}</h3>
          <div className="agri-metric">
            <div className="agri-metric-header">
              <BsMoisture className="metric-icon" />
              <span>{t('weather.metrics.soilMoisture')}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${weatherData.soilMoisture}%`, background: weatherData.soilMoisture < 30 ? '#e74c3c' : 'var(--primary-green)'}}></div>
            </div>
            <p className="metric-value">{weatherData.soilMoisture}% <span className="text-muted">({weatherData.soilMoisture < 30 ? t('weather.metrics.irrigationNeeded') : t('weather.metrics.optimal')})</span></p>
          </div>
          
          <div className="agri-metric mt-4">
            <div className="agri-metric-header">
              <BsThermometerHalf className="metric-icon" />
              <span>{t('weather.metrics.evapotranspiration')}</span>
            </div>
            <h3 className="metric-value">{weatherData.evapotranspiration} mm/day</h3>
            <p className="text-muted text-sm">{t('weather.metrics.waterLoss')}</p>
          </div>
        </div>
      </div>

      {/* Forecast Section */}
      <div className="grid-layout cols-2 forecast-grid mt-4">
        <div className="glass-panel hourly-forecast">
          <h3>{t('weather.forecast.hourly')}</h3>
          <div className="hourly-list">
            {hourlyForecast.length === 0 && <p className="text-muted">{loading ? 'Loading...' : 'No data'}</p>}
            {hourlyForecast.map((hour, idx) => (
              <div className="hourly-item" key={idx}>
                <p>{hour.time}</p>
                <div className="hourly-icon">{renderIcon(hour.icon)}</div>
                <h4>{hour.temp}°</h4>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel weekly-forecast">
          <h3>{t('weather.forecast.weekly')}</h3>
          <div className="weekly-list">
            {weeklyForecast.map((day, idx) => (
              <div className="weekly-item" key={idx}>
                <span className="day-name">{day.day}</span>
                <span className="day-condition">{day.condition}</span>
                <div className="day-temps">
                  <span className="min-temp">{day.min}°</span>
                  <span className="max-temp">{day.max}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
