require('dotenv').config();
const connectDB = require('../config/db');
const Scheme = require('../models/Scheme');

// Real, official Government of India scheme links.
const schemes = [
  {
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Financial',
    description:
      'Direct income support of ₹6,000 per year, paid in 3 equal installments of ₹2,000, transferred directly to the bank accounts of eligible landholding farmer families.',
    deadline: 'Ongoing enrollment',
    link: 'https://pmkisan.gov.in/',
    eligibility: 'All landholding farmer families (subject to exclusion criteria).',
    benefits: '₹6,000/year via Direct Benefit Transfer (DBT) in 3 installments.',
  },
  {
    title: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    category: 'Insurance',
    description:
      'Comprehensive crop insurance against crop failure due to natural calamities, pests and diseases, at very low premium rates (2% Kharif, 1.5% Rabi, 5% commercial/horticulture crops).',
    deadline: 'Before the seasonal cut-off date (varies by state & crop)',
    link: 'https://pmfby.gov.in/',
    eligibility: 'All farmers (loanee and non-loanee) growing notified crops in notified areas.',
    benefits: 'Low-premium crop insurance covering pre-sowing to post-harvest losses.',
  },
  {
    title: 'Soil Health Card Scheme',
    category: 'Farming Assistance',
    description:
      'Provides farmers with a free soil health report every 2-3 years detailing nutrient status (N, P, K, pH, micronutrients) along with crop-wise fertilizer recommendations.',
    deadline: 'Ongoing (apply via local Krishi Vigyan Kendra / Agriculture office)',
    link: 'https://soilhealth.dac.gov.in/',
    eligibility: 'All farmers with agricultural land.',
    benefits: 'Free soil testing and personalized fertilizer/nutrient recommendations.',
  },
  {
    title: 'Paramparagat Krishi Vikas Yojana (PKVY) - Organic Farming',
    category: 'Farming Assistance',
    description:
      'Promotes cluster-based organic farming with certification support and financial assistance for adopting organic inputs, reducing dependency on chemical fertilizers/pesticides.',
    deadline: 'Ongoing, cluster-based enrollment through state agriculture department',
    link: 'https://pgsindia-ncof.gov.in/pkvy/index.aspx',
    eligibility: 'Farmer groups willing to form a cluster of minimum 50 farmers / 50 acres.',
    benefits: 'Financial assistance of ₹50,000/hectare over 3 years for organic inputs & certification.',
  },
  {
    title: 'PMKSY - Per Drop More Crop (Micro Irrigation)',
    category: 'Infrastructure',
    description:
      'Subsidy for drip and sprinkler irrigation systems to improve water use efficiency, under the Pradhan Mantri Krishi Sinchayee Yojana umbrella scheme.',
    deadline: 'Ongoing, apply through state horticulture/agriculture department',
    link: 'https://pmksy.gov.in/',
    eligibility: 'All farmers; higher subsidy for small/marginal and SC/ST farmers.',
    benefits: 'Up to 55% subsidy on drip/sprinkler irrigation equipment.',
  },
  {
    title: 'Kisan Credit Card (KCC)',
    category: 'Financial',
    description:
      'Provides farmers with timely access to low-interest credit for crop production, post-harvest expenses, and other farming needs through a simplified single-window process.',
    deadline: 'Ongoing enrollment through any nationalized/cooperative bank',
    link: 'https://www.myscheme.gov.in/schemes/kcc',
    eligibility: 'All farmers, tenant farmers, oral lessees and sharecroppers.',
    benefits: 'Short-term credit at 4% effective interest rate (with timely repayment subsidy).',
  },
  {
    title: 'PM Kisan Maan-Dhan Yojana (Farmer Pension Scheme)',
    category: 'Financial',
    description:
      'A voluntary and contributory pension scheme providing a guaranteed monthly pension of ₹3,000 after the age of 60 to small and marginal farmers, with the government matching the farmer\'s contribution.',
    deadline: 'Ongoing enrollment via Common Service Centres (CSC)',
    link: 'https://maandhan.in/',
    eligibility: 'Small and marginal farmers aged 18-40 with up to 2 hectares of cultivable land.',
    benefits: 'Guaranteed pension of ₹3,000/month after age 60.',
  },
  {
    title: 'Rashtriya Krishi Vikas Yojana (RKVY)',
    category: 'Farming Assistance',
    description:
      'A state-driven scheme that gives states flexibility to invest in agriculture and allied sectors based on local priorities, funding projects in crop husbandry, horticulture, livestock, and farm mechanization.',
    deadline: 'Ongoing, project-based approval by state government',
    link: 'https://rkvy.nic.in/',
    eligibility: 'Farmers and farmer groups covered under state-approved RKVY projects.',
    benefits: 'Funding support for agri-infrastructure, farm mechanization, and value-addition projects.',
  },
  {
    title: 'National Mission on Natural Farming (NMNF)',
    category: 'Farming Assistance',
    description:
      'Promotes chemical-free natural farming practices across the country, offering training, cluster formation support, and certification assistance to help farmers transition away from synthetic fertilizers and pesticides.',
    deadline: 'Ongoing, cluster-based enrollment through state agriculture department',
    link: 'https://naturalfarming.dac.gov.in/',
    eligibility: 'Farmers willing to adopt natural farming practices in a cluster/village model.',
    benefits: 'Training, handholding support, and financial assistance for natural farming inputs.',
  },
  {
    title: 'Agriculture Infrastructure Fund (AIF)',
    category: 'Infrastructure',
    description:
      'A medium-to-long term financing facility for investment in post-harvest management infrastructure such as warehouses, cold storage, and processing units, with interest subvention on loans.',
    deadline: 'Ongoing, apply through participating banks/NBFCs',
    link: 'https://agriinfra.dac.gov.in/',
    eligibility: 'Farmers, FPOs, cooperatives, agri-entrepreneurs, and state agencies.',
    benefits: '3% interest subvention on loans up to ₹2 crore and credit guarantee support.',
  },
  {
    title: 'e-NAM (National Agriculture Market)',
    category: 'Infrastructure',
    description:
      'A pan-India electronic trading portal that networks existing APMC mandis to create a unified national market for agricultural commodities, enabling farmers to get better, transparent price discovery.',
    deadline: 'Ongoing, register free at any integrated mandi',
    link: 'https://enam.gov.in/',
    eligibility: 'All farmers, traders, and buyers registered with an integrated APMC mandi.',
    benefits: 'Transparent online price discovery and access to buyers across India.',
  },
  {
    title: 'Formation & Promotion of 10,000 FPOs',
    category: 'Farming Assistance',
    description:
      'Supports formation of Farmer Producer Organisations (FPOs) so small and marginal farmers can pool resources for better input purchase, market access, and bargaining power, with handholding support for 5 years.',
    deadline: 'Ongoing, apply through Implementing Agencies (SFAC/NABARD/NCDC)',
    link: 'https://sfacindia.com/FPOScheme.html',
    eligibility: 'Groups of small and marginal farmers willing to form a registered FPO.',
    benefits: 'Up to ₹18 lakh financial assistance per FPO over 3 years plus matching equity grant.',
  },
];

const run = async () => {
  await connectDB();
  try {
    await Scheme.deleteMany({});
    await Scheme.insertMany(schemes);
    console.log(`✅ Seeded ${schemes.length} government schemes`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    process.exit(0);
  }
};

run();
