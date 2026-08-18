import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaSeedling, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../utils/api';
import '../Login/Login.css';
import './Register.css';

const Register = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    farmSize: '',
    primaryCrops: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('register.errors.passwordMismatch'));
      return;
    }
    if (formData.password.length < 6) {
      toast.error(t('register.errors.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const { data } = await api.post('/auth/register', payload);
      login(data);
      toast.success(t('register.success', { name: data.name }));
      navigate('/profile');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-container register-page">
      <motion.div
        className="login-glass-panel register-glass-panel"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            {t('register.title')}
          </motion.h2>
          <p>{t('register.subtitle')}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-row-2">
            <div className="input-group">
              <div className="input-icon"><FaUser /></div>
              <input type="text" name="name" placeholder={t('register.fields.fullName')} value={formData.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <div className="input-icon"><FaPhone /></div>
              <input type="tel" name="phone" placeholder={t('register.fields.phone')} value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon"><FaEnvelope /></div>
            <input type="email" name="email" placeholder={t('register.fields.email')} value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-row-2">
            <div className="input-group">
              <div className="input-icon"><FaLock /></div>
              <input type="password" name="password" placeholder={t('register.fields.password')} value={formData.password} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <div className="input-icon"><FaLock /></div>
              <input type="password" name="confirmPassword" placeholder={t('register.fields.confirmPassword')} value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row-2">
            <div className="input-group">
              <div className="input-icon"><FaMapMarkerAlt /></div>
              <input type="text" name="location" placeholder={t('register.fields.location')} value={formData.location} onChange={handleChange} />
            </div>
            <div className="input-group">
              <div className="input-icon"><FaSeedling /></div>
              <input type="text" name="farmSize" placeholder={t('register.fields.farmSize')} value={formData.farmSize} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon"><FaSeedling /></div>
            <input type="text" name="primaryCrops" placeholder={t('register.fields.primaryCrops')} value={formData.primaryCrops} onChange={handleChange} />
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary login-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? t('register.creating') : t('register.signUp')} <FaArrowRight className="btn-icon" />
          </motion.button>
        </form>

        <div className="register-link">
          {t('register.haveAccount')} <Link to="/login">{t('login.signIn')}</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
