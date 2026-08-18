import React from 'react';
import { motion } from 'framer-motion';
import { BsMicFill } from 'react-icons/bs';
import './HeroSection.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageSlider from '../ImageSlider/ImageSlider';

const HeroSection = () => {
  const { t } = useTranslation();
  return (
    <section className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('home.hero.titlePart1')} <br/> <span className="text-highlight">{t('home.hero.titlePart2')}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-subtitle"
          >
            {t('home.hero.subtitle')}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hero-buttons"
          >
            <Link
  to="/voice-advisor"
  className="btn-primary hero-btn-main"
  style={{ color: "blue" }}
>
          <BsMicFill size={20} />
          {t('home.hero.primaryButton')}
            </Link>
            <Link to="/services" className="btn-outline hero-btn-secondary">
              {t('home.hero.secondaryButton')}
            </Link>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="hero-image-wrapper"
        >
          <Link to="/voice-advisor" className="hero-mic-link">
            <div className="glass-panel hero-image-placeholder">
                <div className="pulse-ring"></div>
                <BsMicFill size={50} className="hero-mic-icon" />
                <h3>{t('home.hero.micText')}</h3>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Image Slider Added Below */}
      <div className="container slider-container-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <ImageSlider />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;