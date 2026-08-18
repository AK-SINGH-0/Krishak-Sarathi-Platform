import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import SchemeCard from '../../components/Cards/SchemeCard';
import SchemeModal from '../../components/Cards/SchemeModal';
import { BsSearch, BsFilter } from 'react-icons/bs';
import api, { getErrorMessage } from '../../utils/api';
import './GovernmentSchemes.css';

const GovernmentSchemes = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchTerm(q);
    }
  }, [location]);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/schemes', {
        params: {
          search: searchTerm || undefined,
          category: filterCategory !== 'All' ? filterCategory : undefined,
        },
      });
      setSchemes(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterCategory]);

  // Debounce search/filter requests slightly so we don't spam the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(fetchSchemes, 300);
    return () => clearTimeout(timer);
  }, [fetchSchemes]);

  const categories = ['All', 'Financial', 'Insurance', 'Farming Assistance', 'Infrastructure'];

  return (
    <div className="container schemes-page">
      <div className="section-header text-center">
        <h2>{t('schemes.title')}</h2>
        <p className="text-muted">{t('schemes.subtitle')}</p>
      </div>

      <div className="schemes-controls glass-panel">
        <div className="search-bar">
          <BsSearch className="search-icon" />
          <input 
            type="text" 
            placeholder={t('schemes.searchPlaceholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label><BsFilter /> {t('schemes.filters.categoryLabel')}</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-layout cols-3 mt-4">
        {loading ? (
          <div className="no-results col-span-3"><p>{t('schemes.loading')}</p></div>
        ) : schemes.length > 0 ? (
          schemes.map(scheme => (
            <SchemeCard
              key={scheme._id}
              title={scheme.title}
              category={scheme.category}
              description={scheme.description}
              deadline={scheme.deadline}
              link={scheme.link}
              onViewDetails={() => setSelectedScheme(scheme)}
            />
          ))
        ) : (
          <div className="no-results col-span-3">
            <p>{t('schemes.noResults')}</p>
          </div>
        )}
      </div>

      <SchemeModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />
    </div>
  );
};

export default GovernmentSchemes;
