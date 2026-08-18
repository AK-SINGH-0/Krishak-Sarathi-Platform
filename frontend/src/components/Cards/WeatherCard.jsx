import React from 'react';
import Card from './Card';
import { BsCloudSun, BsWind, BsDropletHalf } from 'react-icons/bs';

const WeatherCard = ({ location, temp, condition, humidity, wind }) => {
  return (
    <Card className="weather-card">
      <div className="weather-header">
        <h4>{location}</h4>
        <BsCloudSun className="weather-main-icon" />
      </div>
      <div className="weather-body">
        <h2 className="weather-temp">{temp}°C</h2>
        <p className="weather-condition">{condition}</p>
      </div>
      <div className="weather-footer">
        <div className="weather-stat">
          <BsDropletHalf />
          <span>{humidity}%</span>
        </div>
        <div className="weather-stat">
          <BsWind />
          <span>{wind} km/h</span>
        </div>
      </div>
    </Card>
  );
};

export default WeatherCard;
