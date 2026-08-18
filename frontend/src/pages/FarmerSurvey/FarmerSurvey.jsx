import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  BsCheckCircle, BsPersonFill, BsGeoAltFill, BsChatLeftTextFill,
  BsStarFill, BsLightbulbFill, BsPeopleFill, BsCloudCheckFill, BsPencilSquare,
} from 'react-icons/bs';
import { GiPlantSeed } from 'react-icons/gi';
import ImageSlider from '../../components/ImageSlider/ImageSlider';
import api, { getErrorMessage } from '../../utils/api';
import './FarmerSurvey.css';
import survey1 from "../../assets/images/survey1.jpeg";
import survey2 from "../../assets/images/survey2.jpeg";
import survey3 from "../../assets/images/survey3.jpeg";

const SURVEY_SLIDES = [
  { url: survey1, titleKey: 'survey.slides.voices.title', subtitleKey: 'survey.slides.voices.subtitle' },
  { url: survey2, titleKey: 'survey.slides.challenges.title', subtitleKey: 'survey.slides.challenges.subtitle' },
  { url: survey3, titleKey: 'survey.slides.next.title', subtitleKey: 'survey.slides.next.subtitle' },
];

const EMPTY_FORM = {
  fullName: '',
  location: '',
  primaryCrop: '',
  biggestChallenge: '',
  advisorUsefulness: '',
  suggestions: '',
};

const REQUIRED_FIELDS = ['fullName', 'location', 'primaryCrop', 'biggestChallenge', 'advisorUsefulness'];
const DRAFT_KEY = 'ks_survey_draft';
const MAX_CHALLENGE = 500;
const MAX_SUGGESTIONS = 300;

const FarmerSurvey = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [responseCount, setResponseCount] = useState(null);

  // Restore any draft the farmer left behind on a previous visit
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) return { ...EMPTY_FORM, ...JSON.parse(saved) };
    } catch (err) {
      // A corrupt draft shouldn't block the form
    }
    return EMPTY_FORM;
  });

  const fetchCount = useCallback(async () => {
    try {
      const { data } = await api.get('/stats');
      setResponseCount(data.surveys);
    } catch (err) {
      setResponseCount(null);
    }
  }, []);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  // Autosave the draft (debounced) so a refresh never loses answers
  useEffect(() => {
    const hasContent = Object.values(formData).some((v) => v.trim() !== '');
    if (!hasContent) return undefined;

    setDraftSaved(false);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        setDraftSaved(true);
      } catch (err) {
        // Storage full or blocked — the form still works, just without a draft
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      // Nothing to clean up
    }
    setDraftSaved(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/survey', formData);
      clearDraft();
      setSubmitted(true);
      fetchCount();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM);
    clearDraft();
    setSubmitted(false);
  };

  const answered = REQUIRED_FIELDS.filter((f) => formData[f].trim() !== '').length;
  const progress = Math.round((answered / REQUIRED_FIELDS.length) * 100);

  return (
    <div className="container page-container survey-page">
      <motion.div
        className="survey-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>{t('survey.title')}</h1>
        <p>{t('survey.subtitle')}</p>

        {responseCount !== null && (
          <div className="survey-count-badge">
            <BsPeopleFill />
            <span>{t('survey.responseCount', { count: responseCount })}</span>
          </div>
        )}

        <div className="survey-media">
          <ImageSlider images={SURVEY_SLIDES} className="survey-slider" interval={4500} />
        </div>
      </motion.div>

      <motion.div
        className="survey-content glass-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {submitted ? (
          <div className="survey-success">
            <BsCheckCircle className="success-icon" />
            <h2>{t('survey.success.title')}</h2>
            <p>{t('survey.success.text')}</p>
            <button className="btn-primary mt-4" onClick={handleReset}>{t('survey.success.again')}</button>
          </div>
        ) : (
          <>
            <div className="survey-progress">
              <div className="survey-progress-top">
                <span className="survey-progress-label">
                  <BsPencilSquare />{' '}
                  {t('survey.progress', { answered, total: REQUIRED_FIELDS.length })}
                </span>
                <span className="survey-progress-pct">{progress}%</span>
              </div>
              <div className="survey-progress-track">
                <div className="survey-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              {draftSaved && (
                <span className="survey-draft-hint"><BsCloudCheckFill /> {t('survey.draftSaved')}</span>
              )}
            </div>

            <form className="survey-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label><BsPersonFill className="label-icon" /> {t('survey.fields.fullName')}</label>
                  <input type="text" name="fullName" className="input-field" placeholder={t('survey.fields.fullNamePlaceholder')} value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label><BsGeoAltFill className="label-icon" /> {t('survey.fields.location')}</label>
                  <input type="text" name="location" className="input-field" placeholder={t('survey.fields.locationPlaceholder')} value={formData.location} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label><GiPlantSeed className="label-icon" /> {t('survey.fields.primaryCrop')}</label>
                <select name="primaryCrop" className="input-field" value={formData.primaryCrop} onChange={handleChange} required>
                  <option value="">{t('survey.crops.select')}</option>
                  <option value="maize">{t('survey.crops.maize')}</option>
                  <option value="wheat">{t('survey.crops.wheat')}</option>
                  <option value="rice">{t('survey.crops.rice')}</option>
                  <option value="sugarcane">{t('survey.crops.sugarcane')}</option>
                  <option value="cotton">{t('survey.crops.cotton')}</option>
                  <option value="soyabean">{t('survey.crops.soyabean')}</option>
                  <option value="other">{t('survey.crops.other')}</option>
                </select>
              </div>

              <div className="form-group">
                <label><BsChatLeftTextFill className="label-icon" /> {t('survey.fields.challenge')}</label>
                <textarea name="biggestChallenge" className="input-field textarea" rows="4" maxLength={MAX_CHALLENGE} placeholder={t('survey.fields.challengePlaceholder')} value={formData.biggestChallenge} onChange={handleChange} required></textarea>
                <span className={`char-counter ${formData.biggestChallenge.length >= MAX_CHALLENGE ? 'at-limit' : ''}`}>
                  {formData.biggestChallenge.length} / {MAX_CHALLENGE}
                </span>
              </div>

              <div className="form-group">
                <label><BsStarFill className="label-icon" /> {t('survey.fields.usefulness')}</label>
                <div className="radio-group">
                  <label><input type="radio" name="advisorUsefulness" value="very" checked={formData.advisorUsefulness === 'very'} onChange={handleChange} required /> {t('survey.usefulness.very')}</label>
                  <label><input type="radio" name="advisorUsefulness" value="somewhat" checked={formData.advisorUsefulness === 'somewhat'} onChange={handleChange} /> {t('survey.usefulness.somewhat')}</label>
                  <label><input type="radio" name="advisorUsefulness" value="not_very" checked={formData.advisorUsefulness === 'not_very'} onChange={handleChange} /> {t('survey.usefulness.notVery')}</label>
                  <label><input type="radio" name="advisorUsefulness" value="havent_used" checked={formData.advisorUsefulness === 'havent_used'} onChange={handleChange} /> {t('survey.usefulness.notUsed')}</label>
                </div>
              </div>

              <div className="form-group">
                <label><BsLightbulbFill className="label-icon" /> {t('survey.fields.suggestions')}</label>
                <textarea name="suggestions" className="input-field textarea" rows="3" maxLength={MAX_SUGGESTIONS} placeholder={t('survey.fields.suggestionsPlaceholder')} value={formData.suggestions} onChange={handleChange}></textarea>
                <span className={`char-counter ${formData.suggestions.length >= MAX_SUGGESTIONS ? 'at-limit' : ''}`}>
                  {formData.suggestions.length} / {MAX_SUGGESTIONS}
                </span>
              </div>

              <button type="submit" className="btn-primary submit-btn" disabled={loading}>
                {loading ? t('common.submitting') : t('survey.submit')}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default FarmerSurvey;
