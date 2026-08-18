import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BsX, BsDroplet, BsThermometerHalf, BsCalendarEvent, BsBugFill, BsBarChartFill } from 'react-icons/bs';
import { GiFertilizerBag, GiScythe } from 'react-icons/gi';

const CropModal = ({ crop, onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!crop) return null;

  const sections = [
    { icon: <BsCalendarEvent />, label: 'Sowing Time', value: crop.sowingTime },
    { icon: <BsDroplet />, label: 'Irrigation', value: crop.irrigation },
    { icon: <GiFertilizerBag />, label: 'Fertilizer', value: crop.fertilizer },
    { icon: <BsBugFill />, label: 'Pests & Diseases', value: crop.pestsAndDiseases },
    { icon: <GiScythe />, label: 'Harvesting', value: crop.harvesting },
    { icon: <BsBarChartFill />, label: 'Expected Yield', value: crop.expectedYield },
  ];

  return (
    <div className="crop-modal-overlay" onClick={onClose}>
      <div className="crop-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="crop-modal-close" onClick={onClose} aria-label={t('common.close')}>
          <BsX />
        </button>

        {crop.image && (
          <div className="crop-modal-img-container">
            <img src={crop.image} alt={crop.name} className="crop-modal-img" />
          </div>
        )}

        <div className="crop-modal-body">
          <span className="crop-season-badge crop-modal-badge">{crop.season}</span>
          <h3>{crop.name}</h3>
          {crop.description && <p className="crop-modal-description">{crop.description}</p>}

          <div className="crop-modal-quickfacts">
            <div className="detail-item">
              <BsDroplet className="detail-icon" />
              <span>{crop.soilType} Soil</span>
            </div>
            <div className="detail-item">
              <BsThermometerHalf className="detail-icon" />
              <span>{crop.duration}</span>
            </div>
          </div>

          {sections
            .filter((s) => s.value)
            .map((s) => (
              <div className="crop-modal-section" key={s.label}>
                <h4>{s.icon} {s.label}</h4>
                <p>{s.value}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CropModal;
