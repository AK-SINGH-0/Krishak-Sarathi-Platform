import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  BsSearch, BsBell, BsGlobe, BsPersonCircle, 
  BsList, BsX, BsMoonFill, BsSunFill, BsBoxArrowRight
} from 'react-icons/bs';
import './Header.css';
import logoImg from '../../assets/images/logo_ks1.png';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { UI_LANGUAGES, getLanguage } from '../../locales/languages';

const Header = ({ isDarkMode, toggleDarkMode }) => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // The full interface is available in all of these — see locales/languages.js
  const languages = UI_LANGUAGES;
  const currentLang = getLanguage(i18n.language);

  // Handle scroll for sticky effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch live notification count from backend (re-fetches when auth state changes)
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications');
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        // Silent fail - notifications badge just stays at 0
      }
    };
    fetchUnread();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    toast.info(t('common.loggedOut'));
    navigate('/');
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang.code);
    setIsLangMenuOpen(false);
  };

  const navLinks = [
    { name: t('header.nav.home'), path: '/' },
    { name: t('header.nav.aiAdvisor'), path: '/ai-advisor' },
    { name: t('header.nav.voiceAdvisor'), path: '/voice-advisor' },
    { name: t('header.nav.weather'), path: '/weather' },
    { name: t('header.nav.marketPrices'), path: '/market-prices' },
    { name: t('header.nav.schemes'), path: '/schemes' },
    { name: t('header.nav.services'), path: '/services' },
    { name: t('header.nav.about'), path: '/about' },
    { name: t('header.nav.contact'), path: '/contact' },
  ];

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery || !searchQuery.trim()) return;

    const query = searchQuery.trim();
    const lowerQuery = query.toLowerCase();

    // Check crop keywords first
    const cropKeywords = ['wheat', 'rice', 'paddy', 'cotton', 'sugarcane', 'maize', 'mustard', 'crop', 'disease', 'pest', 'sow', 'harvest', 'soil', 'fertilizer', 'paak', 'fasal'];
    const weatherKeywords = ['weather', 'rain', 'temp', 'forecast', 'mausam', 'humidity', 'monsoon', 'climate', 'hava'];
    const priceKeywords = ['price', 'mandi', 'bhav', 'market', 'rate', 'cost', 'kismat', 'bazar'];
    const schemeKeywords = ['scheme', 'yojana', 'subsidy', 'bima', 'insurance', 'kcc', 'pmkisan', 'loan', 'credit'];

    if (cropKeywords.some(k => lowerQuery.includes(k))) {
      navigate(`/crop-library?q=${encodeURIComponent(query)}`);
    } else if (weatherKeywords.some(k => lowerQuery.includes(k))) {
      navigate(`/weather?q=${encodeURIComponent(query)}`);
    } else if (priceKeywords.some(k => lowerQuery.includes(k))) {
      navigate(`/market-prices?q=${encodeURIComponent(query)}`);
    } else if (schemeKeywords.some(k => lowerQuery.includes(k))) {
      navigate(`/schemes?q=${encodeURIComponent(query)}`);
    } else {
      navigate(`/voice-advisor?q=${encodeURIComponent(query)}`, {
        state: { initialQuery: query }
      });
    }
    setSearchQuery('');
  };

  return (
    <header className={`header ${isScrolled ? 'glass-panel scrolled' : ''}`}>
      <div className="container header-container">
        
        {/* Row 1: Logo + Search + Actions */}
        <div className="header-top-row">
          {/* Left: Logo */}
          <div className="header-logo">
            <Link to="/">
              <img src={logoImg} alt={t('common.logoAlt')} className="logo-img" />
              <h1>{t('header.title1')}<span>{t('header.title2')}</span></h1>
            </Link>
          </div>

          {/* Center: Search */}
          <div className="header-search">
            <form onSubmit={handleSearchSubmit} className="search-bar glass-panel">
              <input 
                type="text" 
                placeholder={t('header.searchPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn" title={t('common.search')}><BsSearch /></button>
            </form>
          </div>

          {/* Right: Actions */}
          <div className="header-actions">
            {/* Theme Toggle */}
            <button className="icon-btn" onClick={toggleDarkMode} title={t('common.toggleTheme')}>
              {isDarkMode ? <BsSunFill className="text-yellow" /> : <BsMoonFill />}
            </button>

            {/* Notification */}
            <Link to="/notifications" className="icon-btn notification-btn">
              <BsBell />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </Link>

            {/* Language Toggle */}
            <div className="language-toggle">
              <button
                className="icon-btn"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                title={t('common.changeLanguage')}
                aria-label={t('common.changeLanguage')}
              >
                <BsGlobe />
                <span className="lang-text">{currentLang.code.toUpperCase()}</span>
              </button>
              {isLangMenuOpen && (
                <ul className="lang-dropdown glass-panel">
                  {languages.map(lang => (
                    <li
                      key={lang.code}
                      className={lang.code === currentLang.code ? 'active' : ''}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang.native}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Profile / Login */}
            {isAuthenticated ? (
              <>
                <button className="icon-btn" title={t('common.logout')} onClick={handleLogout}>
                  <BsBoxArrowRight />
                </button>
                <Link to="/profile" className="icon-btn profile-btn" title={user?.name}>
                  <BsPersonCircle />
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-primary login-btn">{t('header.login')}</Link>
                <Link to="/profile" className="icon-btn profile-btn"><BsPersonCircle /></Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <BsX size={28} /> : <BsList size={28} />}
            </button>
          </div>
        </div>

        {/* Row 2: Navigation (Desktop) */}
        <div className="header-bottom-row">
          <nav className="desktop-nav">
            <ul>
              {navLinks.map((link, index) => (
                <li key={index}>
                  <NavLink to={link.path} className={({isActive}) => isActive ? "active-link" : ""}>
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav glass-panel ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul>
          {navLinks.map((link, index) => (
            <li key={index} onClick={() => setIsMobileMenuOpen(false)}>
              <NavLink to={link.path} className={({isActive}) => isActive ? "active-link" : ""}>
                {link.name}
              </NavLink>
            </li>
          ))}
          <li className="mobile-auth-links" onClick={() => setIsMobileMenuOpen(false)}>
            {isAuthenticated ? (
              <button className="btn-primary" style={{ width: '100%' }} onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-outline" style={{width: '100%', marginBottom: '10px'}}>{t('header.login')}</Link>
                <Link to="/register" className="btn-primary" style={{width: '100%'}}>{t('header.register')}</Link>
              </>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
