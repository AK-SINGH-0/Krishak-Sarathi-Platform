import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudShowersHeavy, FaRupeeSign, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './Notifications.css';

const DEFAULT_NOTIFICATIONS = (t) => [
  {
    id: 1,
    type: 'weather',
    title: t('notifications.notif1Title'),
    message: t('notifications.notif1Msg'),
    time: t('notifications.time1'),
    read: false,
  },
  {
    id: 2,
    type: 'market',
    title: t('notifications.notif2Title'),
    message: t('notifications.notif2Msg'),
    time: t('notifications.time2'),
    read: false,
  },
  {
    id: 3,
    type: 'alert',
    title: t('notifications.notif3Title'),
    message: t('notifications.notif3Msg'),
    time: t('notifications.time3'),
    read: true,
  },
  {
    id: 4,
    type: 'system',
    title: t('notifications.notif4Title'),
    message: t('notifications.notif4Msg'),
    time: t('notifications.time4'),
    read: true,
  }
];

const Notifications = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        if (data.notifications && data.notifications.length > 0) {
          setNotifications(
            data.notifications.map((n) => ({
              id: n._id,
              type: n.type === 'scheme' ? 'alert' : n.type,
              title: n.title,
              message: n.message,
              time: new Date(n.createdAt).toLocaleString(),
              read: n.read,
            }))
          );
        } else {
          // No notifications seeded yet in the DB - show helpful sample content
          setNotifications(DEFAULT_NOTIFICATIONS(t));
        }
      } catch (err) {
        setNotifications(DEFAULT_NOTIFICATIONS(t));
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = async (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    if (isAuthenticated && typeof id === 'string' && id.length === 24) {
      try {
        await api.put(`/notifications/${id}/read`);
      } catch (err) {
        // Non-critical - UI already updated optimistically
      }
    }
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'weather': return <FaCloudShowersHeavy className="icon-weather" />;
      case 'market': return <FaRupeeSign className="icon-market" />;
      case 'alert': return <FaExclamationTriangle className="icon-alert" />;
      case 'system': return <FaCheckCircle className="icon-system" />;
      default: return <FaInfoCircle className="icon-default" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container page-container notifications-page">
      <div className="notifications-header">
        <div className="title-area">
          <h2>{t('notifications.title')}</h2>
          {unreadCount > 0 && <span className="badge">{unreadCount} {t('notifications.new')}</span>}
        </div>
        {notifications.length > 0 && (
          <button className="btn btn-outline btn-clear" onClick={clearAll}>
            {t('notifications.clearAll')}
          </button>
        )}
      </div>

      <div className="notifications-list">
        <AnimatePresence>
          {loading ? (
            <div className="empty-state glass-panel"><p>{t('notifications.loading')}</p></div>
          ) : notifications.length === 0 ? (
            <motion.div 
              className="empty-state glass-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FaInfoCircle className="empty-icon" />
              <h3>{t('notifications.allCaughtUp')}</h3>
              <p>{t('notifications.noNewNotifs')}</p>
            </motion.div>
          ) : (
            notifications.map((notif) => (
              <motion.div
                key={notif.id}
                className={`notification-item glass-panel ${notif.read ? 'read' : 'unread'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                onClick={() => markAsRead(notif.id)}
                layout
              >
                <div className="notif-icon-wrapper">
                  {getIcon(notif.type)}
                </div>
                
                <div className="notif-content">
                  <div className="notif-content-header">
                    <h4>{notif.title}</h4>
                    <span className="notif-time">{notif.time}</span>
                  </div>
                  <p>{notif.message}</p>
                </div>
                
                <button 
                  className="delete-btn" 
                  onClick={(e) => deleteNotification(notif.id, e)}
                  title={t('common.delete')}
                >
                  <FaTrashAlt />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;
