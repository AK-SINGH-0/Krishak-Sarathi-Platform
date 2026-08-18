import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from './Card';
import { BsDroplet, BsThermometerHalf } from 'react-icons/bs';
import { GiPlantSeed } from 'react-icons/gi';

const CropCard = ({ name, image, season, soilType, duration }) => {
  const { t } = useTranslation();
  return (
    <Card className="crop-card">
      <div className="crop-img-container">
        {image ? (
          <img src={image} alt={name} className="crop-img" />
        ) : (
          <div className="crop-img-placeholder">
            <GiPlantSeed />
            <span>{name}</span>
          </div>
        )}
        <span className="crop-season-badge">{season}</span>
      </div>
      <div className="crop-info">
        <h3>{name}</h3>
        <div className="crop-details">
          <div className="detail-item">
            <BsDroplet className="detail-icon" />
            <span>{t('cropCard.soil', { type: soilType })}</span>
          </div>
          <div className="detail-item">
            <BsThermometerHalf className="detail-icon" />
            <span>{duration}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CropCard;
