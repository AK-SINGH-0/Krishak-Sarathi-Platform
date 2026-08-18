import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Layout Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// Pages (Placeholder imports for now)
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Services from './pages/Services/Services';
import VoiceAdvisor from './pages/VoiceAdvisor/VoiceAdvisor';
import AIAdvisor from './pages/AIAdvisor/AIAdvisor';
import Weather from './pages/Weather/Weather';
import MarketPrices from './pages/MarketPrices/MarketPrices';
import CropLibrary from './pages/CropLibrary/CropLibrary';
import GovernmentSchemes from './pages/GovernmentSchemes/GovernmentSchemes';
import DiseaseDetection from './pages/DiseaseDetection/DiseaseDetection';
import News from './pages/News/News';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import Notifications from './pages/Notifications/Notifications';
import Settings from './pages/Settings/Settings';
import FAQ from './pages/FAQ/FAQ';
import Terms from './pages/Terms/Terms';
import Privacy from './pages/Privacy/Privacy';
import Team from './pages/Team/Team';
import FarmerSurvey from './pages/FarmerSurvey/FarmerSurvey';
import Pipelines from './pages/Pipelines/Pipelines';
import Docs from './pages/Docs/Documents';
import Documents from './pages/Docs/Documents';

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
        <Route path="/voice-advisor" element={<PageWrapper><VoiceAdvisor /></PageWrapper>} />
        <Route path="/ai-advisor" element={<PageWrapper><AIAdvisor /></PageWrapper>} />
        <Route path="/weather" element={<PageWrapper><Weather /></PageWrapper>} />
        <Route path="/market-prices" element={<PageWrapper><MarketPrices /></PageWrapper>} />
        <Route path="/crop-library" element={<PageWrapper><CropLibrary /></PageWrapper>} />
        <Route path="/schemes" element={<PageWrapper><GovernmentSchemes /></PageWrapper>} />
        <Route path="/disease-detection" element={<PageWrapper><DiseaseDetection /></PageWrapper>} />
        <Route path="/news" element={<PageWrapper><News /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
        <Route path="/team" element={<PageWrapper><Team /></PageWrapper>} />
        <Route path="/pipelines" element={<PageWrapper><Pipelines /></PageWrapper>} />
        {/* Auth & User */}
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/notifications" element={<PageWrapper><Notifications /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        <Route path="/farmer-survey" element={<PageWrapper><FarmerSurvey /></PageWrapper>} />
        <Route path="/docs" element={<PageWrapper><Documents /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

          <main className="main-content">
            <AnimatedRoutes />
          </main>

          <Footer />
          <ToastContainer position="top-right" autoClose={3000} theme={isDarkMode ? 'dark' : 'light'} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
