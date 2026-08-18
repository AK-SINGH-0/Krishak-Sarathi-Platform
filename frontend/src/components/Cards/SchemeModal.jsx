import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BsX } from 'react-icons/bs';

const CATEGORY_CLASS = {
  Financial: 'badge-financial',
  Insurance: 'badge-insurance',
  'Farming Assistance': 'badge-farming',
  Infrastructure: 'badge-infrastructure',
};

const SchemeModal = ({ scheme, onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!scheme) return null;

  return (
    <div className="scheme-modal-overlay" onClick={onClose}>
      <div className="scheme-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="scheme-modal-close" onClick={onClose} aria-label={t('common.close')}>
          <BsX />
        </button>

        {scheme.category && (
          <span className={`scheme-badge ${CATEGORY_CLASS[scheme.category] || ''}`}>{scheme.category}</span>
        )}
        <h3>{scheme.title}</h3>
        <p className="scheme-modal-description">{scheme.description}</p>

        <div className="scheme-modal-section">
          <h4>{t('schemes.eligibility', 'Eligibility')}</h4>
          <p>{scheme.eligibility || '—'}</p>
        </div>

        <div className="scheme-modal-section">
          <h4>{t('schemes.benefits', 'Benefits')}</h4>
          <p>{scheme.benefits || '—'}</p>
        </div>

        <div className="scheme-modal-footer">
          <span className="scheme-deadline">{t('schemes.deadlineLabel', 'Deadline')}: {scheme.deadline}</span>
          <a href={scheme.link} className="scheme-link" target="_blank" rel="noopener noreferrer">
            {t('schemes.applyNow', 'Apply Now')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default SchemeModal;
