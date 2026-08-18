import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import api from '../../utils/api';
import './About.css';
import logoImg from '../../assets/images/logo_ks1.png';

const About = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  // Languages come from the app's own i18n bundle, so this stays correct as locales are added
  const languageCount = Object.keys(i18n.options.resources || {}).length;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats');
        setStats(data);
      } catch (err) {
        setStats(null);
      }
    };
    fetchStats();
  }, []);

  const showStat = (value) => (stats ? value : '—');

  return (
    <div className="container about-page">
      <div className="about-hero text-center">
        <img src={logoImg} alt={t('common.logoAlt')} className="about-logo" />
        <h2>{t('about.title')}</h2>
        <p className="about-subtitle text-muted">{t('about.subtitle')}</p>
      </div>

      <div className="grid-layout cols-2 about-content-grid">
        <div className="glass-panel about-mission">
          <h3>{t('about.mission.title')}</h3>
          <p>{t('about.mission.text1')}</p>
          <br/>
          <p>{t('about.mission.text2')}</p>
        </div>

        <div className="grid-layout cols-2 about-stats-grid">
          <div className="glass-panel stat-card text-center">
            <h2 className="stat-number">{showStat(stats?.farmers)}</h2>
            <p className="stat-label" style={{ color: "green" }}>{t('about.stats.farmers')}</p>
          </div>
          <div className="glass-panel stat-card text-center">
            <h2 className="stat-number">{languageCount}</h2>
            <p className="stat-label"style={{ color: "green" }}>{t('about.stats.languages')}</p>
          </div>
          <div className="glass-panel stat-card text-center">
            <h2 className="stat-number">{showStat(stats?.cropsMonitored)}</h2>
            <p className="stat-label" style={{ color: "green" }}>{t('about.stats.crops')}</p>
          </div>
          <div className="glass-panel stat-card text-center">
            <h2 className="stat-number">24/7</h2>
            <p className="stat-label" style={{ color: "green" }}>{t('about.stats.ai')}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel about-team mt-4 text-center">
        <h3>{t('about.story.title')}</h3>
        <p className="team-story">{t('about.story.text')}</p>
      </div>
    </div>
  );
};

export default About;
