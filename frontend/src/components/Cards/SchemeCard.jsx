import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from './Card';

const CATEGORY_CLASS = {
  Financial: 'badge-financial',
  Insurance: 'badge-insurance',
  'Farming Assistance': 'badge-farming',
  Infrastructure: 'badge-infrastructure',
};

const SchemeCard = ({ title, category, description, deadline, link, onViewDetails }) => {
  const { t } = useTranslation();

  return (
    <Card className="scheme-card">
      <div className="scheme-content">
        {category && (
          <span className={`scheme-badge ${CATEGORY_CLASS[category] || ''}`}>{category}</span>
        )}
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="scheme-footer">
          <span className="scheme-deadline">{t('schemes.deadlineLabel', 'Deadline')}: {deadline}</span>
          <div className="scheme-actions">
            <button type="button" className="scheme-details-btn" onClick={onViewDetails}>
              {t('schemes.viewDetails', 'View Details')}
            </button>
            <a href={link} className="scheme-link" target="_blank" rel="noopener noreferrer">
              {t('schemes.applyNow', 'Apply Now')}
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SchemeCard;
