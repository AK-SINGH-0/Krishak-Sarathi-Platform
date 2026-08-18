import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../utils/api';
import './Login.css';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      login(data);
      toast.success(t('login.welcomeBack', { name: data.name }));
      navigate('/profile');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-container login-page">
      <motion.div 
        className="login-glass-panel"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('login.welcome')}
          </motion.h2>
          <p>{t('login.subtitle')}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-icon">
              <FaEnvelope />
            </div>
            <input 
              type="email" 
              name="email"
              placeholder={t('login.emailPlaceholder')} 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="input-group">
            <div className="input-icon">
              <FaLock />
            </div>
            <input 
              type="password" 
              name="password"
              placeholder={t('login.passwordPlaceholder')} 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>{t('login.rememberMe')}</span>
            </label>
            <a href="forgot-password" className="forgot-password">{t('login.forgotPassword')}</a>
          </div>

          <motion.button 
            type="submit" 
            className="btn btn-primary login-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : t('login.signIn')} <FaArrowRight className="btn-icon" />
          </motion.button>
        </form>

        <div className="register-link">
          {t('login.noAccount')} <Link to="/register">{t('login.signUp')}</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
