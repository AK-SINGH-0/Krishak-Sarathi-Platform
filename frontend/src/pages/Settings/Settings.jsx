import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BsBell, BsGlobe, BsShieldLock, BsPalette, BsPersonCircle } from 'react-icons/bs';
import { UI_LANGUAGES } from '../../locales/languages';
import './Settings.css';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const tabs = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: <BsPersonCircle /> },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: <BsBell /> },
    { id: 'security', label: t('settings.tabs.security'), icon: <BsShieldLock /> },
    { id: 'appearance', label: t('settings.tabs.appearance'), icon: <BsPalette /> },
    { id: 'language', label: t('settings.tabs.language'), icon: <BsGlobe /> }
  ];

  return (
    <div className="container page-container settings-page">
      <motion.div
        className="settings-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </motion.div>

      <div className="settings-layout">
        <motion.div
          className="settings-sidebar glass-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ul className="settings-tabs">
            {tabs.map((tab) => (
              <li
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="settings-content glass-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>{t('settings.profile.title')}</h2>
              <div className="form-group">
                <label>{t('settings.profile.fullName')}</label>
                <input type="text" defaultValue="Raj" className="input-field" />
              </div>
              <div className="form-group">
                <label>{t('settings.profile.location')}</label>
                <input type="text" defaultValue="Rajkot, Gujarat, India" className="input-field" />
              </div>
              <div className="form-group">
                <label>{t('settings.profile.farmSize')}</label>
                <input type="text" defaultValue="15 Acres" className="input-field" />
              </div>
              <div className="form-group">
                <label>{t('settings.profile.primaryCrops')}</label>
                <input type="text" defaultValue="Wheat, Rice, Sugarcane" className="input-field" />
              </div>
              <button className="btn-primary mt-4">{t('common.saveChanges')}</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>{t('settings.notifications.title')}</h2>
              <div className="toggle-group">
                <label>{t('settings.notifications.email')}</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="toggle-group">
                <label>{t('settings.notifications.sms')}</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="toggle-group">
                <label>{t('settings.notifications.push')}</label>
                <input type="checkbox" />
              </div>
              <button className="btn-primary mt-4">{t('settings.notifications.save')}</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>{t('settings.security.title')}</h2>
              <div className="form-group">
                <label>{t('settings.security.currentPassword')}</label>
                <input type="password" placeholder="••••••••" className="input-field" />
              </div>
              <div className="form-group">
                <label>{t('settings.security.newPassword')}</label>
                <input type="password" placeholder="••••••••" className="input-field" />
              </div>
              <button className="btn-primary mt-4">{t('settings.security.update')}</button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>{t('settings.appearance.title')}</h2>
              <p>{t('settings.appearance.subtitle')}</p>
              <div className="theme-options">
                <div className="theme-card active">
                  <div className="theme-preview light"></div>
                  <span>{t('settings.appearance.light')}</span>
                </div>
                <div className="theme-card">
                  <div className="theme-preview dark"></div>
                  <span>{t('settings.appearance.dark')}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="settings-section">
              <h2>{t('settings.language.title')}</h2>
              <div className="form-group">
                <label>{t('settings.language.primary')}</label>
                <select className="input-field" value={i18n.language} onChange={handleLanguageChange}>
                  {UI_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.native}{lang.code === 'en' ? '' : ` (${lang.english})`}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-4" style={{color: 'var(--text-color)'}}>{t('settings.language.note')}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
