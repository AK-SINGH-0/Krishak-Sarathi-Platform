import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { BsGeoAlt, BsTelephone, BsEnvelope, BsSend } from 'react-icons/bs';
import api, { getErrorMessage } from '../../utils/api';
import './Contact.css';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container contact-page">
      <div className="section-header text-center">
        <h2>{t('contact.title')}</h2>
        <p className="text-muted">{t('contact.subtitle')}</p>
      </div>

      <div className="grid-layout cols-2 mt-4 contact-grid">
        <div className="contact-info">
          <div className="glass-panel contact-card">
            <div className="contact-icon"><BsGeoAlt /></div>
            <div>
              <h4>{t('contact.cards.office.title')}</h4>
              <p className="text-muted">{t('contact.cards.office.text')}</p>
            </div>
          </div>
          
          <div className="glass-panel contact-card">
            <div className="contact-icon"><BsTelephone /></div>
            <div>
              <h4>{t('contact.cards.phone.title')}</h4>
              <p className="text-muted">{t('contact.cards.phone.text')}</p>
            </div>
          </div>
          
          <div className="glass-panel contact-card">
            <div className="contact-icon"><BsEnvelope /></div>
            <div>
              <h4>{t('contact.cards.email.title')}</h4>
              <p className="text-muted">{t('contact.cards.email.text')}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel contact-form-container">
          <h3>{t('contact.form.title')}</h3>
          {isSubmitted ? (
            <div className="success-message">
              <h4>{t('contact.form.successTitle')}</h4>
              <p>{t('contact.form.successText')}</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('contact.form.nameLabel')}</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder={t('contact.form.namePlaceholder')} 
                />
              </div>
              <div className="form-group">
                <label>{t('contact.form.contactLabel')}</label>
                <input 
                  type="text" 
                  required 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder={t('contact.form.contactPlaceholder')} 
                />
              </div>
              <div className="form-group">
                <label>{t('contact.form.subjectLabel')}</label>
                <input 
                  type="text" 
                  required 
                  value={formData.subject} 
                  onChange={e => setFormData({...formData, subject: e.target.value})} 
                  placeholder={t('contact.form.subjectPlaceholder')} 
                />
              </div>
              <div className="form-group">
                <label>{t('contact.form.messageLabel')}</label>
                <textarea 
                  rows="4" 
                  required 
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                  placeholder={t('contact.form.messagePlaceholder')}
                ></textarea>
              </div>
              <button
  type="submit"
  className="btn-primary w-100 mt-4"
  style={{
    color: "green",
    border: "2px solid green",
    borderRadius: "8px"
  }}
  disabled={loading}
>
  <BsSend /> {loading ? "Sending..." : t("contact.form.submit")}
</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
