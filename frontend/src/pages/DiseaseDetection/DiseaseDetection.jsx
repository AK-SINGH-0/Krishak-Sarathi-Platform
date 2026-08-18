import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsCloudUpload, BsCheckCircleFill, BsExclamationTriangleFill } from 'react-icons/bs';
import api from '../../utils/api';
import './DiseaseDetection.css';

/* The English name stays the value (it keys MOCK_DIAGNOSES and goes to the
   API); `key` is only used to look up the translated label shown to the farmer. */
const CROPS = [
  { value: 'Wheat', key: 'wheat' },
  { value: 'Rice (Paddy)', key: 'rice' },
  { value: 'Cotton', key: 'cotton' },
  { value: 'Sugarcane', key: 'sugarcane' },
  { value: 'Maize', key: 'maize' },
  { value: 'Mustard', key: 'mustard' },
  { value: 'Soybean', key: 'soybean' },
  { value: 'Groundnut', key: 'groundnut' },
  { value: 'Potato', key: 'potato' },
  { value: 'Chickpea (Gram)', key: 'chickpea' },
  { value: 'Pearl Millet (Bajra)', key: 'bajra' },
  { value: 'Tomato', key: 'tomato' },
];

// Mock diagnoses keyed by crop until a real image-classification model is wired up.
const MOCK_DIAGNOSES = {
  Wheat: { disease: 'Wheat Rust (Puccinia triticina)', confidence: '94%', severity: 'High', remedy: 'Apply fungicide (Propiconazole 25% EC) at 1ml per liter of water. Ensure proper drainage in the field.' },
  'Rice (Paddy)': { disease: 'Rice Blast (Magnaporthe oryzae)', confidence: '91%', severity: 'High', remedy: 'Spray Tricyclazole 75% WP at 0.6g per liter of water. Avoid excess nitrogen and maintain 20x15 cm spacing.' },
  Cotton: { disease: 'Cotton Leaf Curl Virus', confidence: '88%', severity: 'Medium', remedy: 'Control the whitefly vector with Diafenthiuron or neem-based sprays. Remove and destroy infected plants.' },
  Sugarcane: { disease: 'Red Rot (Colletotrichum falcatum)', confidence: '90%', severity: 'High', remedy: 'No chemical cure. Uproot and burn affected clumps, avoid waterlogging, and replant with resistant certified setts.' },
  Maize: { disease: 'Turcicum Leaf Blight', confidence: '89%', severity: 'Medium', remedy: 'Spray Mancozeb 75% WP at 2.5g per liter of water. Use resistant hybrids in the next season.' },
  Mustard: { disease: 'White Rust (Albugo candida)', confidence: '87%', severity: 'Medium', remedy: 'Spray Metalaxyl + Mancozeb at 2.5g per liter of water at first symptoms. Follow crop rotation.' },
  Soybean: { disease: 'Yellow Mosaic Virus', confidence: '86%', severity: 'High', remedy: 'Control the whitefly vector with Thiamethoxam. Rogue out infected plants and sow tolerant varieties.' },
  Groundnut: { disease: 'Tikka Leaf Spot (Cercospora)', confidence: '92%', severity: 'Medium', remedy: 'Spray Mancozeb or Chlorothalonil at 2g per liter of water at first symptoms, repeat after 15 days.' },
  Potato: { disease: 'Late Blight (Phytophthora infestans)', confidence: '95%', severity: 'High', remedy: 'Spray Metalaxyl + Mancozeb at 2.5g per liter immediately. Ensure good drainage and avoid overhead irrigation.' },
  'Chickpea (Gram)': { disease: 'Fusarium Wilt', confidence: '85%', severity: 'High', remedy: 'No cure once wilted. Use resistant varieties and seed treatment with Trichoderma or Carbendazim next season.' },
  'Pearl Millet (Bajra)': { disease: 'Downy Mildew (Green Ear)', confidence: '88%', severity: 'Medium', remedy: 'Rogue out infected plants. Use resistant hybrids and seed treatment with Metalaxyl before sowing.' },
  Tomato: { disease: 'Early Blight (Alternaria solani)', confidence: '93%', severity: 'Medium', remedy: 'Spray Mancozeb 75% WP at 2.5g per liter of water. Mulch to prevent soil splash and stake plants for airflow.' },
};

const DiseaseDetection = () => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile || !selectedCrop) return;

    setIsAnalyzing(true);
    // Mock image analysis until a real classification model is available
    setTimeout(async () => {
      const diagnosis = MOCK_DIAGNOSES[selectedCrop];
      setIsAnalyzing(false);
      setResult(diagnosis);

      try {
        await api.post('/detections', {
          crop: selectedCrop,
          disease: diagnosis.disease,
          confidence: diagnosis.confidence,
          severity: diagnosis.severity,
        });
      } catch (err) {
        // A failed save shouldn't hide the diagnosis the farmer just asked for
      }
    }, 2500);
  };

  return (
    <div className="container disease-page">
      <div className="section-header text-center">
        <h2>{t('diseaseDetection.title')}</h2>
        <p className="text-muted">{t('diseaseDetection.subtitle')}</p>
      </div>

      <div className="grid-layout cols-2 mt-4 detection-grid">
        {/* Upload Section */}
        <div className="glass-panel upload-section">
          <h3>{t('diseaseDetection.uploadTitle')}</h3>

          <div className="crop-select-group">
            <label htmlFor="crop-select">{t('diseaseDetection.whichCrop')}</label>
            <select
              id="crop-select"
              value={selectedCrop}
              onChange={(e) => { setSelectedCrop(e.target.value); setResult(null); }}
            >
              <option value="">{t('diseaseDetection.selectCrop')}</option>
              {CROPS.map((crop) => (
                <option key={crop.value} value={crop.value}>{t(`crops.${crop.key}`)}</option>
              ))}
            </select>
          </div>

          <div className="upload-box">
            <input 
              type="file" 
              id="file-upload" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="file-input"
            />
            <label htmlFor="file-upload" className="upload-label">
              {selectedFile ? (
                <div className="preview-container">
                  <img src={selectedFile} alt={t('diseaseDetection.previewAlt')} className="image-preview" />
                  <div className="change-img-text">{t('diseaseDetection.changeImage')}</div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <BsCloudUpload className="upload-icon" />
                  <h4>{t('diseaseDetection.dropHere')}</h4>
                  <p>{t('diseaseDetection.supports')}</p>
                </div>
              )}
            </label>
          </div>

          <button
            className="btn-primary w-100 mt-4 analyze-btn"
            disabled={!selectedFile || !selectedCrop || isAnalyzing}
            onClick={handleAnalyze}
          >
            {isAnalyzing ? (
              <><span className="loading-spinner-small"></span> {t('diseaseDetection.analyzing')}</>
            ) : (
              t('diseaseDetection.analyze')
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="glass-panel result-section">
          <h3>{t('diseaseDetection.resultTitle')}</h3>

          {!result && !isAnalyzing && (
            <div className="empty-result">
              <p className="text-muted">{t('diseaseDetection.emptyResult')}</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="analyzing-result">
              <div className="scanner-line"></div>
              <p>{t('diseaseDetection.scanning')}</p>
            </div>
          )}

          {result && (
            <div className="diagnosis-report">
              <div className="report-header">
                <BsExclamationTriangleFill className="text-red warning-icon" />
                <div>
                  <h4 className="disease-name">{result.disease}</h4>
                  <p className="confidence-level">{t('diseaseDetection.confidence')}: {result.confidence}</p>
                </div>
              </div>

              <div className="severity-badge">{t('diseaseDetection.severity')}: {result.severity}</div>

              <div className="remedy-box">
                <h4><BsCheckCircleFill className="text-green" /> {t('diseaseDetection.remedy')}</h4>
                <p>{result.remedy}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
