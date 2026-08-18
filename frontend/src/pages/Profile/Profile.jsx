import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserEdit, FaMapMarkerAlt, FaSeedling, FaCloudSun, FaHistory, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="container page-container profile-page">
        <div className="glass-panel p-8 mt-4 text-center">
          <h2>{t('profile.notLoggedIn')}</h2>
          <p className="text-muted mt-2">{t('profile.signInPrompt')}</p>
          <Link
            to="/login"
            className="mt-4"
            style={{
              display: 'inline-block',
              color: '#16a34a',
              border: '1px solid #16a34a',
              
              background: 'transparent',
              padding: '0.75rem 1.25rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            {t('profile.goToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.info(t('common.loggedOut'));
    navigate('/');
  };

  const activities = [
    { id: 1, action: t('profile.activities.act1'), time: '2 hours ago', icon: <FaCloudSun /> },
    { id: 2, action: t('profile.activities.act2'), time: 'Yesterday', icon: <FaSeedling /> },
    { id: 3, action: t('profile.activities.act3'), time: '3 days ago', icon: <FaUserEdit /> }
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <motion.div 
            className="tab-content overview-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="info-grid">
              <div className="info-card">
                <h4>{t('profile.farmSize')}</h4>
                <p>{user.farmSize || 'Not set yet'}</p>
              </div>
              <div className="info-card">
                <h4>{t('profile.primaryCrops')}</h4>
                <p>{user.primaryCrops || 'Not set yet'}</p>
              </div>
              <div className="info-card">
                <h4>{t('profile.memberSince')}</h4>
                <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</p>
              </div>
            </div>

            <div className="recent-activity-section">
              <h3>{t('profile.recentActivity')}</h3>
              <div className="activity-list">
                {activities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-details">
                      <p className="action">{activity.action}</p>
                      <p className="time">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div 
            className="tab-content settings-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="settings-options">
              <button className="settings-btn"><FaUserEdit /> {t('profile.editProfile')}</button>
              <button className="settings-btn"><FaCog /> {t('profile.accountPreferences')}</button>
              <button className="settings-btn danger" onClick={handleLogout}><FaSignOutAlt /> {t('profile.signOut')}</button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container page-container profile-page">
      <div className="profile-layout">
        
        {/* Sidebar / Profile Card */}
        <motion.div 
          className="profile-sidebar glass-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {user.name.charAt(0)}
            </div>
            <button className="edit-avatar-btn">
              <FaUserEdit />
            </button>
          </div>
          
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-location">
            <FaMapMarkerAlt /> {user.location || 'Location not set'}
          </p>

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-val">12</span>
              <span className="stat-label">{t('profile.analyses')}</span>
            </div>
            <div className="stat">
              <span className="stat-val">4</span>
              <span className="stat-label">{t('profile.saved')}</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          className="profile-main glass-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FaHistory /> {t('profile.overview')}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog /> {t('profile.settings')}
            </button>
          </div>

          <div className="tab-content-container">
            {renderTabContent()}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;
