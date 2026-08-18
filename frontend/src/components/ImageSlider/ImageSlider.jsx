import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import './ImageSlider.css';

/* Captions are translation keys rather than literal text, so the default
   slides follow the interface language like everything else. */
const DEFAULT_IMAGES = [
  {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNDj7tRpLXA1V5owITx3XrLiPcXR5SaUHZhSTc8tER8vRPGdnciJ-pDGY&s=10",
    titleKey: 'slider.smartAgriculture.title',
    subtitleKey: 'slider.smartAgriculture.subtitle'
  },
  {
    url: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200",
    titleKey: 'slider.cropManagement.title',
    subtitleKey: 'slider.cropManagement.subtitle'
  },
  {
    url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200",
    titleKey: 'slider.realtimeInsights.title',
    subtitleKey: 'slider.realtimeInsights.subtitle'
  }
];

const ImageSlider = ({ images: imagesProp, className = '', interval = 5000 }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = imagesProp && imagesProp.length ? imagesProp : DEFAULT_IMAGES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className={`slider-wrapper glass-panel ${className}`}>
      <div 
        className="slider-inner" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((slide, index) => {
          // Slides passed in as props carry literal text; the built-in ones
          // carry translation keys.
          const title = slide.titleKey ? t(slide.titleKey) : slide.title;
          const subtitle = slide.subtitleKey ? t(slide.subtitleKey) : slide.subtitle;
          return (
            <div className="slide" key={index}>
              <img src={slide.url} alt={title} />
              <div className="slide-content">
                <h3>{title}</h3>
                <p>{subtitle}</p>
              </div>
              <div className="slide-overlay"></div>
            </div>
          );
        })}
      </div>

      <button className="slider-control prev" onClick={goToPrevious}>
        <BsChevronLeft />
      </button>
      <button className="slider-control next" onClick={goToNext}>
        <BsChevronRight />
      </button>

      <div className="slider-dots">
        {images.map((_, index) => (
          <span 
            key={index} 
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
