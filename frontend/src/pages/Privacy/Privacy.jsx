import React from 'react';
import { useTranslation } from 'react-i18next';
import '../Terms/Terms.css'; // Reusing the same CSS layout

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="container privacy-page">
      <div className="glass-panel content-panel">
        <h2 className="text-center mb-4">{t('privacy.title')}</h2>
        <p className="last-updated">{t('privacy.lastUpdated')}</p>

        <div className="policy-content">
          <h3>{t('privacy.sections.infoCollection.title')}</h3>
          <p>{t('privacy.sections.infoCollection.intro')}</p>
          <ul>
            <li><strong>{t('privacy.sections.infoCollection.personalDataLabel')}</strong> {t('privacy.sections.infoCollection.personalDataValue')}</li>
            <li><strong>{t('privacy.sections.infoCollection.farmingDataLabel')}</strong> {t('privacy.sections.infoCollection.farmingDataValue')}</li>
            <li><strong>{t('privacy.sections.infoCollection.usageDataLabel')}</strong> {t('privacy.sections.infoCollection.usageDataValue')}</li>
          </ul>

          <h3>{t('privacy.sections.useOfInfo.title')}</h3>
          <p>{t('privacy.sections.useOfInfo.intro')}</p>
          <ul>
            <li>{t('privacy.sections.useOfInfo.item1')}</li>
            <li>{t('privacy.sections.useOfInfo.item2')}</li>
            <li>{t('privacy.sections.useOfInfo.item3')}</li>
            <li>{t('privacy.sections.useOfInfo.item4')}</li>
          </ul>

          <h3>{t('privacy.sections.dataSecurity.title')}</h3>
          <p>{t('privacy.sections.dataSecurity.text')}</p>

          <h3>{t('privacy.sections.sharing.title')}</h3>
          <p>{t('privacy.sections.sharing.text')}</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
