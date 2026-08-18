import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BsFacebook, BsTwitter, BsInstagram, BsYoutube } from 'react-icons/bs';
import './Footer.css';
import logoImg from '../../assets/images/logo_ks1.png';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer glass-panel">
      <div className="container">
        <div className="grid-layout cols-4 footer-top">
          {/* Logo & About */}
          <div className="footer-col">
            <Link to="/" className="footer-logo">
              <img
                src={logoImg}
                alt={t('common.logoAlt')}
                className="logo-img-footer"
              />
              <h2>
                {t('header.title1')}<span>{t('header.title2')}</span>
              </h2>
            </Link>

            <p className="footer-about">{t('footer.about')}</p>

            <Link to="/team" className="team-btn">
              👨‍💻 {t('footer.meetTeam')}
            </Link>

          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3>{t('footer.quickLinks.title')}</h3>
            <ul>
              <li><Link to="/about">{t('footer.quickLinks.about')}</Link></li>
              <li><Link to="/services">{t('footer.quickLinks.services')}</Link></li>
              <li><Link to="/faq">{t('footer.quickLinks.faq')}</Link></li>
              <li><Link to="/terms">{t('footer.quickLinks.terms')}</Link></li>
              <li><Link to="/privacy">{t('footer.quickLinks.privacy')}</Link></li>
              <li><Link to="/contact">{t('footer.quickLinks.contact')}</Link></li>
              <li><Link to="/farmer-survey">{t('footer.quickLinks.survey')}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-col">
            <h3>{t('footer.resources.title')}</h3>
            <ul>
              <li><Link to="/crop-library">{t('footer.resources.cropLibrary')}</Link></li>
              <li><Link to="/market-prices">{t('footer.resources.marketPrices')}</Link></li>
              <li><Link to="/schemes">{t('footer.resources.schemes')}</Link></li>
              <li><Link to="/weather">{t('footer.resources.weather')}</Link></li>
              <li><Link to="/voice-advisor">{t('footer.resources.voiceAdvisor')}</Link></li>
              <li><Link to="/ai-advisor">{t('footer.resources.aiAdvisor')}</Link></li>
              <li><Link to="/settings">{t('footer.resources.settings')}</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="footer-col">
            <h3>{t('footer.contactUs.title')}</h3>
            <p>{t('footer.contactUs.email')}</p>
            <p>{t('footer.contactUs.phone')}</p>
            <p>{t('footer.contactUs.telephone')}</p>
            <p>{t('footer.contactUs.location')}</p>
            <p>{t('footer.contactUs.pin')}</p>

            
            <div className="social-links">
              <a href="https://www.facebook.com/krishaksarathi" target="_blank" rel="noopener noreferrer">
                <BsFacebook />
              </a>
              <a href="https://twitter.com/krishaksarathi" target="_blank" rel="noopener noreferrer">
                <BsTwitter />
              </a>
              <a href="https://www.instagram.com/krishaksarathi" target="_blank" rel="noopener noreferrer">
                <BsInstagram />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                <BsYoutube />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-links">
            <Link to="/faq">{t('footer.bottomLinks.faq')}</Link>
            <Link to="/terms">{t('footer.bottomLinks.terms')}</Link>
            <Link to="/privacy">{t('footer.bottomLinks.privacy')}</Link>
          </div>
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
