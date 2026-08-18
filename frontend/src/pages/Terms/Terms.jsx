import React from 'react';
import { useTranslation } from 'react-i18next';
import './Terms.css';

const Terms = () => {
  const { t } = useTranslation();
  return (
    <div className="container terms-page">
      <div className="glass-panel content-panel">
        <h2 className="text-center mb-4">{t('terms.title')}</h2>
        <p className="last-updated">{t('terms.lastUpdated')}</p>

        <div className="policy-content">
          <h3>{t('terms.sections.acceptance.title')}</h3>
          <p>{t('terms.sections.acceptance.text')}</p>

          <h3>{t('terms.sections.service.title')}</h3>
          <p>{t('terms.sections.service.text')}</p>

          <h3>{t('terms.sections.accounts.title')}</h3>
          <p>{t('terms.sections.accounts.text')}</p>

          <h3>{t('terms.sections.aiAdvice.title')}</h3>
          <p>{t('terms.sections.aiAdvice.text')}</p>

          <h3>{t('terms.sections.changes.title')}</h3>
          <p>{t('terms.sections.changes.text')}</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
