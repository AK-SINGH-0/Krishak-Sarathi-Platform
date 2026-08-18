import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BsMicFill, BsRobot, BsCloudSun, BsGraphUp, BsBook, BsShieldPlus } from 'react-icons/bs';
import './Services.css';

const Services = () => {
  const { t } = useTranslation();

  const servicesData = [
    {
      id: 1,
      title: t('services.cards.voice.title'),
      description: t('services.cards.voice.description'),
      icon: <BsMicFill />,
      link: '/voice-advisor',
      color: '#e74c3c'
    },
    {
      id: 2,
      title: t('services.cards.ai.title'),
      description: t('services.cards.ai.description'),
      icon: <BsRobot />,
      link: '/ai-advisor',
      color: '#3498db'
    },
    {
      id: 3,
      title: t('services.cards.weather.title'),
      description: t('services.cards.weather.description'),
      icon: <BsCloudSun />,
      link: '/weather',
      color: '#f1c40f'
    },
    {
      id: 4,
      title: t('services.cards.market.title'),
      description: t('services.cards.market.description'),
      icon: <BsGraphUp />,
      link: '/market-prices',
      color: '#2ecc71'
    },
    {
      id: 5,
      title: t('services.cards.cropLibrary.title'),
      description: t('services.cards.cropLibrary.description'),
      icon: <BsBook />,
      link: '/crop-library',
      color: '#9b59b6'
    },
    {
      id: 6,
      title: t('services.cards.disease.title'),
      description: t('services.cards.disease.description'),
      icon: <BsShieldPlus />,
      link: '/disease-detection',
      color: '#e67e22'
    }
  ];
  return (
    <div className="container services-page">
      <div className="section-header text-center">
        <h2>{t('services.title')}</h2>
        <p className="text-muted">{t('services.subtitle')}</p>
      </div>

      <div className="grid-layout cols-3 mt-4">
        {servicesData.map(service => (
          <Link to={service.link} key={service.id} className="service-card glass-panel card-hover">
            <div className="service-icon-wrapper" style={{ backgroundColor: `${service.color}15`, color: service.color }}>
              {service.icon}
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <span className="service-link-text">{t('services.explore')}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Services;
