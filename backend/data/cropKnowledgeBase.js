/**
 * Lightweight local knowledge base used for Retrieval-Augmented Generation (RAG).
 * Each entry is a "chunk" of agronomy knowledge focused on Indian farming conditions.
 * utils/rag.js scores these chunks against the farmer's question and the
 * top matches are injected into the Gemini prompt as grounding context.
 *
 * You can freely add more chunks here (e.g. from ICAR / Krishi Vigyan Kendra
 * publications) to improve the quality of answers — no retraining needed.
 */

const cropKnowledgeBase = [
  {
    id: 'wheat-sowing',
    crop: 'Wheat',
    topic: 'Sowing & Season',
    content:
      'Wheat is a rabi crop in India, sown from late October to November after the monsoon retreats. Ideal sowing temperature is 18-22°C. Timely sown wheat gives the highest yield; sowing after 25th November reduces yield by ~1-1.5% per day of delay. Seed rate is typically 100 kg/ha for timely sowing.',
  },
  {
    id: 'wheat-irrigation',
    crop: 'Wheat',
    topic: 'Irrigation',
    content:
      'Wheat needs about 4-6 irrigations. The most critical stage is Crown Root Initiation (CRI) at 20-25 days after sowing — never skip this irrigation. Other critical stages are tillering, jointing, flowering and grain filling (milk stage). Avoid irrigation during grain maturity to prevent lodging.',
  },
  {
    id: 'wheat-fertilizer',
    crop: 'Wheat',
    topic: 'Fertilizer',
    content:
      'Recommended NPK dose for wheat is about 120:60:40 kg/ha for irrigated conditions. Apply full phosphorus and potassium plus half nitrogen as basal dose at sowing; remaining nitrogen in two split doses at first and second irrigation (CRI and tillering stage).',
  },
  {
    id: 'wheat-pests',
    crop: 'Wheat',
    topic: 'Pests & Diseases',
    content:
      'Common wheat problems: yellow rust (yellow stripes on leaves, spray Propiconazole 25EC), aphids (spray Imidacloprid), and termites in sandy soils (seed treatment with Chlorpyriphos). Loose smut is controlled by seed treatment with Carboxin or Tebuconazole before sowing.',
  },
  {
    id: 'rice-sowing',
    crop: 'Rice',
    topic: 'Sowing & Season',
    content:
      'Rice (paddy) is mainly a kharif crop, transplanted in June-July after monsoon onset, with harvest in October-November. Nursery is raised 25-30 days before transplanting. Maintain 2-3 cm standing water after transplanting. System of Rice Intensification (SRI) uses 8-12 day old single seedlings for water saving.',
  },
  {
    id: 'rice-water',
    crop: 'Rice',
    topic: 'Water Management',
    content:
      'Rice needs continuous shallow standing water (2-5 cm) during vegetative and reproductive stages, especially at panicle initiation and flowering (most water-sensitive stages). Alternate Wetting and Drying (AWD) can save 15-30% irrigation water without yield loss if done correctly — drain and re-irrigate when water level drops 15 cm below soil surface, except during flowering.',
  },
  {
    id: 'rice-pests',
    crop: 'Rice',
    topic: 'Pests & Diseases',
    content:
      'Major rice pests are stem borer (deadheart/whitehead symptom, use Cartap Hydrochloride), brown plant hopper (BPH - use Pymetrozine, avoid excess nitrogen), and blast disease (diamond shaped lesions, spray Tricyclazole). Maintain proper spacing (20x15 cm) to reduce humidity and disease pressure.',
  },
  {
    id: 'cotton-sowing',
    crop: 'Cotton',
    topic: 'Sowing & Season',
    content:
      'Cotton is sown as a kharif crop between May (irrigated, South India) and June (rainfed, Central/North India) with the onset of monsoon. Bt cotton hybrid seed rate is about 1.5-2 kg/ha, spacing 90-120 cm x 45-60 cm depending on hybrid vigor and soil.',
  },
  {
    id: 'cotton-pests',
    crop: 'Cotton',
    topic: 'Pests & Diseases',
    content:
      'Pink bollworm is the most destructive cotton pest — install pheromone traps (5/acre) for monitoring, destroy crop residue after harvest, and avoid late sowing. Whitefly transmits Cotton Leaf Curl Virus — control with Diafenthiuron or neem-based sprays. Avoid indiscriminate pyrethroid use which can flare up sucking pests.',
  },
  {
    id: 'sugarcane-basics',
    crop: 'Sugarcane',
    topic: 'Sowing & Irrigation',
    content:
      'Sugarcane is planted Feb-March (spring) or Oct-Nov (autumn, higher yielding) using healthy 2-3 budded setts treated with fungicide. It is a heavy water user needing 1500-2500 mm over the crop cycle; drip irrigation can cut water use by 30-40% and boost yield. Earthing up and propping prevent lodging.',
  },
  {
    id: 'sugarcane-pests',
    crop: 'Sugarcane',
    topic: 'Pests & Diseases',
    content:
      'Early shoot borer and top borer cause deadheart symptoms — use Chlorantraniliprole granules in the whorl. Red rot disease causes internal reddening with a rotten smell; the only solution is planting resistant/disease-free certified seed setts and avoiding waterlogging.',
  },
  {
    id: 'soybean-basics',
    crop: 'Soybean',
    topic: 'Sowing & Care',
    content:
      'Soybean is a kharif crop sown with onset of monsoon (last week June to first week July) in Central India (MP, Maharashtra). Seed rate 65-80 kg/ha, row spacing 30-45 cm. It is sensitive to waterlogging — ensure field drainage, since even 24-48 hours of standing water can cause major yield loss.',
  },
  {
    id: 'soil-health',
    crop: 'General',
    topic: 'Soil Health',
    content:
      'Get soil tested every 2-3 years via the Soil Health Card scheme (free) to know N, P, K, pH, organic carbon and micronutrient status. Maintain soil pH 6.5-7.5 for most crops. Add farmyard manure or compost 5-10 tonnes/ha every year to improve organic carbon and soil structure. Avoid excess urea without balancing with phosphorus/potassium.',
  },
  {
    id: 'organic-farming',
    crop: 'General',
    topic: 'Organic & Sustainable Practices',
    content:
      'For organic pest control use neem oil (3-5 ml/litre), Trichoderma for soil-borne fungal disease, and Pheromone traps for moths. Crop rotation with legumes (chana, moong) fixes atmospheric nitrogen and breaks pest-disease cycles. Vermicompost improves soil microbial activity and water holding capacity.',
  },
  {
    id: 'irrigation-general',
    crop: 'General',
    topic: 'Water Saving Irrigation',
    content:
      'Drip irrigation saves 30-60% water compared to flood irrigation and can be subsidized up to 55% under PMKSY - Per Drop More Crop scheme. Mulching (plastic or straw) reduces evaporation losses and suppresses weeds. Irrigate early morning or evening to reduce evaporation losses.',
  },
  {
    id: 'weather-risk',
    crop: 'General',
    topic: 'Weather Related Risk Management',
    content:
      'Register under Pradhan Mantri Fasal Bima Yojana (PMFBY) before the cut-off date each season to insure against drought, flood, hailstorm and pest attack. Delay top-dressing of nitrogen fertilizer if heavy rain is forecast within 48 hours to prevent nutrient runoff and water pollution. Harvest is best avoided just before a forecast storm.',
  },
  {
    id: 'fertilizer-general',
    crop: 'General',
    topic: 'Balanced Fertilization',
    content:
      'Follow the 4R principle: Right source, Right rate, Right time, Right place. Excess nitrogen without potassium makes crops prone to lodging and pest attack. Split nitrogen application (2-3 doses) is more efficient than a single dose which is prone to leaching, especially in sandy or high-rainfall areas.',
  },
  {
    id: 'pest-ipm',
    crop: 'General',
    topic: 'Integrated Pest Management (IPM)',
    content:
      'IPM combines cultural (crop rotation, resistant varieties), mechanical (pheromone/light traps), biological (Trichogramma, NPV) and need-based chemical control. Spray chemical pesticides only after crossing the Economic Threshold Level (ETL), not on a fixed calendar, to reduce cost and preserve natural predators.',
  },
  {
    id: 'market-msp',
    crop: 'General',
    topic: 'Market & MSP',
    content:
      'Check Minimum Support Price (MSP) and mandi (market) prices on the eNAM portal (enam.gov.in) before selling produce, and compare across nearby mandis. Store grain in a clean, dry, pest-free warehouse — consider e-NWR backed warehouse receipts to get loans against stored produce instead of distress selling right after harvest.',
  },
];

module.exports = cropKnowledgeBase;
