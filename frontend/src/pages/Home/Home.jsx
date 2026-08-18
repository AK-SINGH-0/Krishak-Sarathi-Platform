import React from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../../components/HeroSection/HeroSection';
import CropCard from '../../components/Cards/CropCard';
import WeatherCard from '../../components/Cards/WeatherCard';
import SchemeCard from '../../components/Cards/SchemeCard';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();
  return (
    <div className="home-page">
      <HeroSection />
      <section className="dashboard-section container">
        <div className="section-header">
          <h2>{t('home.dashboard.title')}</h2>
          <p className="text-muted">{t('home.dashboard.subtitle')}</p>
        </div>

        <div className="grid-layout cols-3">
          <div className="dashboard-widget">
            <h3 className="widget-title">{t('home.dashboard.weather')}</h3>
            <WeatherCard 
              location={t('weather.defaultLocation')}
              temp={28}
              condition={t('weather.weekly.partlyCloudy')}
              humidity={65}
              wind={12}
            />
          </div>
          
          <div className="dashboard-widget">
            <h3 className="widget-title">{t('home.dashboard.crop')}</h3>
            <CropCard 
              name={t('crops.wheat')}
              season={t('cropLibrary.seasons.rabi')}
              soilType={t('soilTypes.loamy')}
              duration={t('home.dashboard.duration', { days: '120-150' })}
            />
          </div>

          <div className="dashboard-widget">
            <h3 className="widget-title">{t('home.dashboard.scheme')}</h3>
            <SchemeCard 
              title={t('schemes.cards.pmKisan.title')}
              description={t('schemes.cards.pmKisan.description')}
              deadline={t('schemes.cards.pmKisan.deadline')}
              link="#"
            />
          </div>
        </div>
      </section>

      <section className="features-section glass-panel">
        <div className="container">
          <div className="section-header text-center">
            <h2>{t('home.features.title')}</h2>
          </div>
          <div className="grid-layout cols-4 text-center mt-4">
            <div className="feature-item">
              <div className="feature-icon">🎤</div>
              <h4>{t('home.features.voice.title')}</h4>
              <p>{t('home.features.voice.text')}</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <h4>{t('home.features.ai.title')}</h4>
              <p>{t('home.features.ai.text')}</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📈</div>
              <h4>{t('home.features.market.title')}</h4>
              <p>{t('home.features.market.text')}</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <h4>{t('home.features.disease.title')}</h4>
              <p>{t('home.features.disease.text')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
