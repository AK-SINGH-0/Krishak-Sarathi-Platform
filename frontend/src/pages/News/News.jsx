import React from 'react';
import { useTranslation } from 'react-i18next';
import './News.css';

const News = () => {
  const { t } = useTranslation();

  return (
    <div className="container page-container news-page">
      <div className="glass-panel p-8 mt-4">
        <h2>{t('news.title')}</h2>
        <p>{t('news.text')}</p>
      </div>
    </div>
  );
};

export default News;
