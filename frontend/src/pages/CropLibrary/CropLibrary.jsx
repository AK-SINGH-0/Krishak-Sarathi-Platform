import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import CropCard from '../../components/Cards/CropCard';
import CropModal from '../../components/Cards/CropModal';
import { BsSearch, BsFilter } from 'react-icons/bs';
import './CropLibrary.css';

const cropData = [
  {
    id: 1,
    name: 'Wheat',
    season: 'Rabi',
    soilType: 'Loamy',
    duration: '120-150 Days',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    description: 'India\'s primary rabi cereal, grown widely across the Indo-Gangetic plains for both domestic consumption and export.',
    sowingTime: 'Late October to November, after the monsoon retreats. Ideal soil temperature is 18-22°C. Seed rate is around 100 kg/ha for timely sowing.',
    irrigation: '4-6 irrigations needed. The Crown Root Initiation (CRI) stage at 20-25 days after sowing is the most critical — never skip it. Other key stages: tillering, jointing, flowering, and grain filling.',
    fertilizer: 'Recommended NPK dose is ~120:60:40 kg/ha. Apply full phosphorus and potassium plus half nitrogen as basal dose at sowing; remaining nitrogen split across two doses at CRI and tillering.',
    pestsAndDiseases: 'Yellow rust (spray Propiconazole 25EC), aphids (spray Imidacloprid), termites in sandy soil (seed treatment with Chlorpyriphos), and loose smut (seed treatment with Carboxin or Tebuconazole).',
    harvesting: 'Harvest when grains are hard and straw turns golden-yellow, typically 120-150 days after sowing. Avoid irrigation near maturity to prevent lodging.',
    expectedYield: '35-55 quintals/hectare under irrigated, well-managed conditions.',
  },
  {
    id: 2,
    name: 'Rice (Paddy)',
    season: 'Kharif',
    soilType: 'Clayey',
    duration: '100-150 Days',
    image: 'https://images.unsplash.com/photo-1536214249767-f4e91bc4c274?auto=format&fit=crop&q=80&w=600',
    description: 'The staple kharif crop of India, thriving in clayey, water-retentive soils across the eastern and southern regions.',
    sowingTime: 'Nursery raised 25-30 days before transplanting, with transplanting in June-July after monsoon onset. Harvest typically falls in October-November.',
    irrigation: 'Needs continuous shallow standing water (2-5 cm), especially at panicle initiation and flowering. Alternate Wetting and Drying (AWD) can save 15-30% water without yield loss outside the flowering stage.',
    fertilizer: 'Apply balanced NPK with nitrogen split into 3 doses (basal, tillering, panicle initiation) to reduce leaching losses in standing water.',
    pestsAndDiseases: 'Stem borer (deadheart/whitehead symptom, use Cartap Hydrochloride), brown plant hopper (use Pymetrozine, avoid excess nitrogen), and blast disease (diamond-shaped lesions, spray Tricyclazole).',
    harvesting: 'Harvest when 80-85% of grains turn golden and moisture content drops to around 20-25%.',
    expectedYield: '25-40 quintals/hectare depending on variety and management.',
  },
  {
    id: 3,
    name: 'Cotton',
    season: 'Kharif',
    soilType: 'Black Cotton',
    duration: '150-180 Days',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=600',
    description: 'A major cash crop grown in black cotton (regur) soils, especially across Gujarat, Maharashtra, and Telangana.',
    sowingTime: 'Sown May (irrigated, South India) to June (rainfed, Central/North India) with monsoon onset. Bt cotton seed rate ~1.5-2 kg/ha, spacing 90-120 cm x 45-60 cm.',
    irrigation: 'Requires consistent moisture during flowering and boll development; drip irrigation improves water-use efficiency and can boost yield significantly.',
    fertilizer: 'Balanced NPK application with higher potassium requirement during boll development to improve fiber quality and boll retention.',
    pestsAndDiseases: 'Pink bollworm (install pheromone traps, destroy crop residue post-harvest), whitefly transmitting Cotton Leaf Curl Virus (control with Diafenthiuron or neem-based sprays).',
    harvesting: 'Picked in 3-4 rounds as bolls mature and burst open, typically starting 150 days after sowing.',
    expectedYield: '15-25 quintals/hectare of seed cotton (kapas) under good management.',
  },
  {
    id: 4,
    name: 'Sugarcane',
    season: 'Zaid',
    soilType: 'Deep Loam',
    duration: '10-18 Months',
    image: 'https://images.unsplash.com/photo-1596704153093-0182dc7d3dff?auto=format&fit=crop&q=80&w=600',
    description: 'A long-duration cash crop needing deep, fertile loam soil and heavy water availability throughout its growing cycle.',
    sowingTime: 'Planted Feb-March (spring) or Oct-Nov (autumn, higher yielding) using healthy 2-3 budded setts treated with fungicide.',
    irrigation: 'A heavy water user needing 1500-2500 mm over the crop cycle. Drip irrigation can cut water use by 30-40% while boosting yield.',
    fertilizer: 'High nitrogen requirement (~250-300 kg/ha) applied in split doses, along with phosphorus and potassium at planting and earthing-up stages.',
    pestsAndDiseases: 'Early shoot borer and top borer (use Chlorantraniliprole granules in the whorl), and red rot disease (plant resistant/disease-free certified setts, avoid waterlogging).',
    harvesting: 'Harvested at 10-18 months when sucrose content peaks, cutting close to the ground for optimum ratoon regrowth.',
    expectedYield: '700-1000 quintals/hectare depending on variety and irrigation.',
  },
  {
    id: 5,
    name: 'Maize',
    season: 'Kharif',
    soilType: 'Well-drained Loam',
    duration: '90-110 Days',
    image: 'https://images.unsplash.com/photo-1601369324707-bd2451fdbf38?auto=format&fit=crop&q=80&w=600',
    description: 'A versatile cereal grown across seasons in well-drained loamy soils, used for food, feed, and industrial purposes.',
    sowingTime: 'Kharif sowing with monsoon onset (June-July); can also be grown in rabi and spring seasons with irrigation. Seed rate ~20-25 kg/ha.',
    irrigation: 'Sensitive to moisture stress at knee-high, tasseling, and grain-filling stages — irrigate at these critical stages if rainfall is insufficient.',
    fertilizer: 'Recommended NPK ~120:60:40 kg/ha with nitrogen split into 3 doses (basal, knee-high, tasseling).',
    pestsAndDiseases: 'Fall armyworm (scout regularly, spray Emamectin Benzoate on young larvae), stem borer, and turcicum leaf blight (use resistant hybrids and Mancozeb spray).',
    harvesting: 'Harvest when husk turns straw-colored and kernels harden, typically 90-110 days after sowing.',
    expectedYield: '25-45 quintals/hectare depending on hybrid and irrigation.',
  },
  {
    id: 6,
    name: 'Mustard',
    season: 'Rabi',
    soilType: 'Sandy Loam',
    duration: '100-120 Days',
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=600',
    description: 'A key rabi oilseed crop, well suited to sandy loam soils in low-rainfall regions of North and Central India.',
    sowingTime: 'Sown mid-October to early November in well-prepared, moist seedbeds. Seed rate ~4-5 kg/ha.',
    irrigation: '2-3 irrigations are usually sufficient — the first at 25-30 days after sowing (pre-flowering) is the most critical.',
    fertilizer: 'Recommended NPK ~80:40:40 kg/ha with a sulfur dose of 40 kg/ha, which significantly improves oil content.',
    pestsAndDiseases: 'Mustard aphid (spray Imidacloprid or Dimethoate before infestation peaks), and white rust (spray Metalaxyl + Mancozeb).',
    harvesting: 'Harvest when pods turn yellow-brown and seeds rattle inside, around 100-120 days after sowing.',
    expectedYield: '12-20 quintals/hectare depending on variety and management.',
  },
  {
    id: 7,
    name: 'Soybean',
    season: 'Kharif',
    soilType: 'Well-drained Black Soil',
    duration: '90-110 Days',
    description: 'A major kharif oilseed and protein crop, extensively cultivated in Madhya Pradesh and Maharashtra.',
    sowingTime: 'Sown with monsoon onset (last week of June to first week of July). Seed rate 65-80 kg/ha, row spacing 30-45 cm.',
    irrigation: 'Mostly rainfed; ensure good field drainage since even 24-48 hours of waterlogging can cause major yield loss.',
    fertilizer: 'Low nitrogen requirement (~20-25 kg/ha as basal, since it fixes nitrogen) with phosphorus ~60-80 kg/ha for nodulation and pod development.',
    pestsAndDiseases: 'Girdle beetle and stem fly (seed treatment with Thiamethoxam), yellow mosaic virus (control whitefly vector, use tolerant varieties).',
    harvesting: 'Harvest when pods turn brown and leaves shed, typically 90-110 days after sowing.',
    expectedYield: '15-25 quintals/hectare under good rainfall conditions.',
  },
  {
    id: 8,
    name: 'Groundnut',
    season: 'Kharif',
    soilType: 'Sandy Loam',
    duration: '100-130 Days',
    description: 'An important oilseed and legume crop grown in well-drained sandy loam soils across Gujarat, Andhra Pradesh, and Tamil Nadu.',
    sowingTime: 'Sown with monsoon onset in kharif (June-July) or as a summer crop (Jan-Feb) with irrigation. Seed rate 100-120 kg/ha for bold-seeded varieties.',
    irrigation: 'Critical stages are flowering, pegging (when pods form), and pod development — moisture stress during pegging severely reduces yield.',
    fertilizer: 'Low nitrogen (~20 kg/ha), phosphorus ~40 kg/ha, and gypsum (~400-500 kg/ha) applied at flowering for healthy pod/kernel development.',
    pestsAndDiseases: 'Leaf miner and thrips (spray Imidacloprid), and tikka leaf spot disease (spray Mancozeb or Chlorothalonil at first symptoms).',
    harvesting: 'Harvest when the inside of pod shells shows dark veining and leaves start yellowing, around 100-130 days after sowing.',
    expectedYield: '15-25 quintals/hectare (pod yield) under good management.',
  },
  {
    id: 9,
    name: 'Potato',
    season: 'Rabi',
    soilType: 'Sandy Loam',
    duration: '70-100 Days',
    description: 'A high-value rabi tuber crop that thrives in loose, well-drained sandy loam soils with cool growing temperatures.',
    sowingTime: 'Planted mid-October to November using certified disease-free seed tubers, at a spacing of 60 cm x 20 cm.',
    irrigation: 'Needs light, frequent irrigation (7-10 day intervals) — critical stages are stolon formation and tuber bulking; avoid water stress during bulking.',
    fertilizer: 'High nutrient demand: NPK ~180:80:100 kg/ha. Apply nitrogen and potassium in split doses, with earthing-up done alongside the second nitrogen dose.',
    pestsAndDiseases: 'Late blight (spray Mancozeb preventively, Metalaxyl + Mancozeb curatively during humid weather), and aphids (which spread viral diseases — control with Imidacloprid).',
    harvesting: 'Harvest when the crop haulm dries and skin sets firmly, typically 70-100 days after planting depending on variety.',
    expectedYield: '200-350 quintals/hectare under irrigated, well-managed conditions.',
  },
  {
    id: 10,
    name: 'Chickpea (Gram)',
    season: 'Rabi',
    soilType: 'Sandy Loam to Clay Loam',
    duration: '90-120 Days',
    description: 'A drought-tolerant rabi pulse crop and India\'s most widely grown legume, valued for its nitrogen-fixing ability.',
    sowingTime: 'Sown mid-October to mid-November on residual soil moisture. Seed rate 65-100 kg/ha depending on seed size.',
    irrigation: 'Mostly grown on conserved soil moisture; if irrigated, 1-2 irrigations at branching and pod-filling stages are enough — avoid excess water which promotes vegetative growth over pods.',
    fertilizer: 'Low nitrogen (~20 kg/ha as basal starter dose) with phosphorus ~40-60 kg/ha; seed treatment with Rhizobium culture improves nodulation.',
    pestsAndDiseases: 'Pod borer (Helicoverpa) is the most damaging pest — use pheromone traps and spray Emamectin Benzoate; wilt disease is managed with resistant varieties and seed treatment.',
    harvesting: 'Harvest when plants turn yellow-brown and leaves shed, around 90-120 days after sowing.',
    expectedYield: '15-22 quintals/hectare under good management.',
  },
  {
    id: 11,
    name: 'Pearl Millet (Bajra)',
    season: 'Kharif',
    soilType: 'Sandy',
    duration: '75-90 Days',
    description: 'A hardy, drought-resistant kharif cereal well suited to arid and semi-arid sandy soils of Rajasthan, Gujarat, and Haryana.',
    sowingTime: 'Sown with monsoon onset (June-July). Seed rate 4-5 kg/ha, row spacing 45 cm.',
    irrigation: 'Highly drought tolerant and mostly rainfed; if irrigation is available, watering at flowering and grain-filling stages improves yield.',
    fertilizer: 'Recommended NPK ~40:20:0 kg/ha for rainfed conditions, higher under irrigation, with nitrogen split into basal and top-dressing doses.',
    pestsAndDiseases: 'Shoot fly (seed treatment with Imidacloprid) and downy mildew (green ear disease — use resistant hybrids and seed treatment with Metalaxyl).',
    harvesting: 'Harvest when grains harden and ear heads turn grey-brown, typically 75-90 days after sowing.',
    expectedYield: '15-25 quintals/hectare depending on rainfall and hybrid.',
  },
  {
    id: 12,
    name: 'Tomato',
    season: 'Zaid',
    soilType: 'Well-drained Loam',
    duration: '90-120 Days',
    description: 'A widely grown vegetable crop valued for high market returns, cultivated across multiple seasons with irrigation.',
    sowingTime: 'Nursery-raised and transplanted 25-30 days later; can be grown year-round with irrigation, though summer (Zaid) crop fetches the best prices. Spacing 60 cm x 45 cm.',
    irrigation: 'Needs regular light irrigation (5-7 day intervals); drip irrigation with mulching greatly improves water efficiency and reduces fruit cracking.',
    fertilizer: 'Recommended NPK ~120:60:60 kg/ha with nitrogen split into 3-4 doses through the crop cycle; calcium sprays help prevent blossom-end rot.',
    pestsAndDiseases: 'Fruit borer (use pheromone traps and Emamectin Benzoate), whitefly transmitting leaf curl virus, and early/late blight (spray Mancozeb preventively).',
    harvesting: 'Harvest fruits at breaker to red stage depending on transport distance, in multiple pickings every 4-5 days.',
    expectedYield: '400-600 quintals/hectare under good irrigation and staking practices.',
  },
];

/* The crop records below stay in English: those values are the filter keys and
   the lookup keys for the guide content. Only what the farmer sees is
   translated, via these small mappers. */
const CROP_KEYS = {
  'Wheat': 'wheat', 'Rice (Paddy)': 'rice', 'Cotton': 'cotton', 'Sugarcane': 'sugarcane',
  'Maize': 'maize', 'Mustard': 'mustard', 'Soybean': 'soybean', 'Groundnut': 'groundnut',
  'Potato': 'potato', 'Chickpea (Gram)': 'chickpea', 'Pearl Millet (Bajra)': 'bajra',
  'Tomato': 'tomato',
};

const SOIL_KEYS = {
  'Loamy': 'loamy', 'Clayey': 'clay', 'Black Cotton': 'blackCotton', 'Deep Loam': 'deepLoam',
  'Well-drained Loam': 'wellDrainedLoam', 'Sandy Loam': 'sandyLoam',
  'Well-drained Black Soil': 'blackSoil', 'Sandy Loam to Clay Loam': 'sandyToClayLoam',
  'Sandy': 'sandy',
};

const CropLibrary = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeason, setFilterSeason] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      // Clean up common search terms like 'crop', 'library' if entered
      const cleanTerm = q.replace(/crop|library|fasal|paak/gi, '').trim();
      setSearchTerm(cleanTerm || q);
    }
  }, [location]);

  const seasons = ['All', 'Kharif', 'Rabi', 'Zaid'];

  // "120-150 Days" / "10-18 Months" -> the same range with a translated unit
  const translateDuration = (value) => {
    const match = /^([\d-]+)\s*(Days|Months)$/i.exec(value || '');
    if (!match) return value;
    const unit = match[2].toLowerCase() === 'months' ? 'months' : 'days';
    return t(`cropLibrary.duration.${unit}`, { count: match[1] });
  };

  const filteredCrops = cropData.filter(crop => {
    return (
      (filterSeason === 'All' || crop.season === filterSeason) &&
      (crop.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="container crop-library-page">
      <div className="section-header text-center">
        <h2>{t('cropLibrary.title')}</h2>
        <p className="text-muted">{t('cropLibrary.subtitle')}</p>
      </div>

      <div className="library-controls glass-panel">
        <div className="search-bar">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('cropLibrary.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label><BsFilter /> {t('cropLibrary.season')}</label>
          <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}>
            {seasons.map(season => (
              <option key={season} value={season}>
                {t(`cropLibrary.seasons.${season.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-layout cols-3 mt-4">
        {filteredCrops.length > 0 ? (
          filteredCrops.map(crop => (
            <div key={crop.id} className="crop-card-wrapper">
              <CropCard
                {...crop}
                name={t(`crops.${CROP_KEYS[crop.name]}`, crop.name)}
                season={t(`cropLibrary.seasons.${crop.season.toLowerCase()}`, crop.season)}
                soilType={t(`soilTypes.${SOIL_KEYS[crop.soilType]}`, crop.soilType)}
                duration={translateDuration(crop.duration)}
              />
              <button
                className="btn-outline w-100 mt-2 view-details-btn"
                onClick={() => setSelectedCrop(crop)}
              >
                {t('cropLibrary.viewGuide')}
              </button>
            </div>
          ))
        ) : (
          <div className="no-results col-span-3">
            <p>{t('cropLibrary.noResults')}</p>
          </div>
        )}
      </div>

      <CropModal crop={selectedCrop} onClose={() => setSelectedCrop(null)} />
    </div>
  );
};

export default CropLibrary;
