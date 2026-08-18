import React from 'react';
import './Cards.css';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`glass-panel base-card card-hover ${className}`} 
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
