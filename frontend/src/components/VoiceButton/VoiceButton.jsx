import React from 'react';
import { motion } from 'framer-motion';
import { BsMicFill } from 'react-icons/bs';
import './VoiceButton.css';

const VoiceButton = ({ onClick, isListening }) => {
  return (
    <div className="voice-btn-container">
      <motion.button
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <BsMicFill size={28} />
      </motion.button>
      {isListening && (
        <>
          <div className="ripple-1"></div>
          <div className="ripple-2"></div>
        </>
      )}
    </div>
  );
};

export default VoiceButton;
