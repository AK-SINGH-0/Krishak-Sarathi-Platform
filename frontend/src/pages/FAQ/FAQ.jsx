import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import './FAQ.css';

const FAQ = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t('faq.items.q1.question'),
      answer: t('faq.items.q1.answer')
    },
    {
      question: t('faq.items.q2.question'),
      answer: t('faq.items.q2.answer')
    },
    {
      question: t('faq.items.q3.question'),
      answer: t('faq.items.q3.answer')
    },
    {
      question: t('faq.items.q4.question'),
      answer: t('faq.items.q4.answer')
    },
    {
      question: t('faq.items.q5.question'),
      answer: t('faq.items.q5.answer')
    }
  ];
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div className="container faq-page">
      <div className="section-header text-center">
        <h2>{t('faq.title')}</h2>
        <p className="text-muted">{t('faq.subtitle')}</p>
      </div>

      <div className="faq-container mt-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`glass-panel faq-item ${activeIndex === index ? 'active' : ''}`}
          >
            <div 
              className="faq-question" 
              onClick={() => toggleAccordion(index)}
            >
              <h3>{faq.question}</h3>
              <div className="faq-icon">
                {activeIndex === index ? <BsChevronUp /> : <BsChevronDown />}
              </div>
            </div>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
