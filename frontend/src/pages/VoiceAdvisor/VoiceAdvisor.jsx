import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BsVolumeUp, BsSquareFill, BsSendFill, BsGlobe, BsMicFill } from 'react-icons/bs';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { speakText, stopSpeech } from '../../utils/speechUtils';
import VoiceButton from '../../components/VoiceButton/VoiceButton';
import api, { getErrorMessage } from '../../utils/api';
import {
  ADVISOR_LANGUAGES,
  getSpeechLocale,
  getNativeName,
} from '../../utils/languages';
import './VoiceAdvisor.css';

const formatTextDisplay = (text) => {
  if (!text) return null;
  return text
    .replace(/\n{2,}/g, '\n') // collapse the blank lines the model adds
    .split('\n')
    .filter((line) => line.trim())
    .map((line, idx) => {
    // Simple bold markdown formatter (**text**)
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={idx}>
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
};

const VoiceAdvisor = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const wasListeningRef = useRef(false);
  const processedQueryRef = useRef(null);

  // The language the farmer speaks in. Speech recognition needs a concrete
  // language up front, so this selection drives the microphone; the answer then
  // comes back in whatever language the question was actually asked in.
  const [speechLang, setSpeechLang] = useState(() => {
    const saved = typeof window !== 'undefined' && window.localStorage.getItem('advisorLanguage');
    if (saved && ADVISOR_LANGUAGES.some((l) => l.code === saved)) return saved;
    return ADVISOR_LANGUAGES.some((l) => l.code === i18n.language) ? i18n.language : 'en';
  });

  // Language of the answer currently on screen — this is what gets spoken.
  const [replyLang, setReplyLang] = useState(speechLang);

  const {
    transcript: liveTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const stopSpeaking = () => {
    stopSpeech(); // cancels the browser voice and any server-generated audio
    setIsSpeaking(false);
  };

  // Always speak in the language the answer is written in, never the UI language
  const speak = useCallback((text, language) => {
    if (!text || !text.trim()) return;
    // Show "speaking" straight away: for languages with no local voice the audio
    // is fetched from the server first, and a silent gap looks like a failure.
    setIsSpeaking(true);
    speakText({
      text,
      language: language || replyLang,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [replyLang]);

  // Ask the backend AI advisor once the user finishes speaking or submits text
  const askAdvisor = useCallback(async (question) => {
    if (!question || !question.trim()) return;
    setIsProcessing(true);
    stopSpeaking();
    try {
      const { data } = await api.post('/ai/chat', {
        message: question,
        // 'auto' lets the backend answer in whatever language the question was
        // asked in, so a Hindi question is answered and spoken in Hindi even if
        // the microphone was set to another language.
        language: 'auto',
        mode: 'voice',
      });
      const answerLang = data.language || speechLang;
      setReplyLang(answerLang);
      setAiReply(data.answer);
      speak(data.answer, answerLang);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setAiReply(t('voiceAdvisor.errorReply'));
      setReplyLang('en');
    } finally {
      setIsProcessing(false);
    }
  }, [speechLang, speak]);

  // Process search query passed from header search bar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const incomingQuery = location.state?.initialQuery || params.get('q');
    if (incomingQuery && incomingQuery.trim() && processedQueryRef.current !== incomingQuery) {
      processedQueryRef.current = incomingQuery;
      setTextInput(incomingQuery);
      setTranscript(incomingQuery);
      askAdvisor(incomingQuery);
    }
  }, [location, askAdvisor]);

  const toggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error(t('voiceAdvisor.noSpeechSupport'));
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      stopSpeaking();
      setAiReply('');
      resetTranscript();
      setTranscript('');
      SpeechRecognition.startListening({
        language: getSpeechLocale(speechLang),
        continuous: false,
      });
    }
  };

  // Auto-submit when user stops speaking (silence auto-detection)
  useEffect(() => {
    if (listening) {
      wasListeningRef.current = true;
      if (liveTranscript) setTranscript(liveTranscript);
    } else if (wasListeningRef.current) {
      wasListeningRef.current = false;
      if (liveTranscript && liveTranscript.trim()) {
        setTranscript(liveTranscript);
        askAdvisor(liveTranscript);
      }
    }
  }, [listening, liveTranscript, askAdvisor]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    const query = textInput.trim();
    setTranscript(query);
    setTextInput('');
    askAdvisor(query);
  };

  const handleLanguageChange = (langKey) => {
    stopSpeaking();
    setSpeechLang(langKey);
    setReplyLang(langKey);
    try {
      window.localStorage.setItem('advisorLanguage', langKey);
    } catch {}
    // Switch the whole interface to match the language the farmer speaks
    i18n.changeLanguage(langKey);
  };

  const chips = [
    t('voiceAdvisor.prompts.chip1'),
    t('voiceAdvisor.prompts.chip2'),
    t('voiceAdvisor.prompts.chip3'),
  ];

  const handleChipClick = (chipText) => {
    stopSpeaking();
    setTranscript(chipText);
    askAdvisor(chipText);
  };

  return (
    <div className="container voice-advisor-page">
      <div className="section-header text-center">
        <h2>{t('voiceAdvisor.title')}</h2>
        <p className="text-muted">{t('voiceAdvisor.subtitle')}</p>
      </div>

      <div className="voice-interface glass-panel">
        {/* Language selector — sets the language the microphone listens for */}
        <div className="voice-lang-bar">
          <span className="lang-label"><BsGlobe /> {t('voiceAdvisor.languageLabel')}</span>
          <div className="lang-buttons">
            {ADVISOR_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`lang-btn ${speechLang === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
                title={lang.label}
              >
                {lang.native}
              </button>
            ))}
          </div>
          <span className="lang-hint">{t('voiceAdvisor.languageHint')}</span>
        </div>

        <div className="voice-status">
          {listening ? (
            <div className="status-box">
              <h3 className="listening-text"><BsMicFill /> {t('voiceAdvisor.status.listening')}</h3>
              <div className="sound-wave">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="status-box">
              <h3>⚙️ {t('voiceAdvisor.status.thinking')}</h3>
            </div>
          ) : isSpeaking ? (
            <div className="status-box">
              <h3 className="speaking-text">🔊 {t('voiceAdvisor.status.speaking')}</h3>
              <div className="sound-wave speaking-wave">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
          ) : (
            <div className="status-box">
              <h3>{t('voiceAdvisor.status.idle')}</h3>
            </div>
          )}
        </div>

        <div className="voice-btn-wrapper">
          <VoiceButton isListening={listening} onClick={toggleListening} />
        </div>

        <div className="voice-transcript">
          {transcript && (
            <div className="transcript-bubble user-bubble">
              <span className="bubble-label">{t('voiceAdvisor.youAsked')}</span>
              <p>{transcript}</p>
            </div>
          )}
          {aiReply && (
            <div className="transcript-bubble ai-bubble">
              <div className="bubble-header">
                <span className="bubble-label">
                  {t('voiceAdvisor.adviceLabel')}
                  <span className="reply-lang-tag">{getNativeName(replyLang)}</span>
                </span>
                <div className="audio-actions">
                  {isSpeaking ? (
                    <button type="button" className="btn-audio stop-btn" onClick={stopSpeaking} title={t('voiceAdvisor.stop')}>
                      <BsSquareFill /> {t('voiceAdvisor.stopShort')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-audio play-btn"
                      onClick={() => speak(aiReply, replyLang)}
                      title={t('voiceAdvisor.listenAgain')}
                    >
                      <BsVolumeUp /> {t('voiceAdvisor.listenAgain')}
                    </button>
                  )}
                </div>
              </div>
              <div className="ai-reply-content">
                {formatTextDisplay(aiReply)}
              </div>
            </div>
          )}
        </div>

        {/* Text fallback input */}
        <form className="voice-text-form" onSubmit={handleTextSubmit}>
          <input
            type="text"
            placeholder={t('voiceAdvisor.typePlaceholder')}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isProcessing || listening}
          />
          <button type="submit" disabled={!textInput.trim() || isProcessing}>
            <BsSendFill />
          </button>
        </form>

        <div className="suggested-prompts">
          <h4>{t('voiceAdvisor.prompts.title')}</h4>
          <div className="prompt-chips">
            {chips.map((chip, idx) => (
              <span className="chip" key={idx} onClick={() => handleChipClick(chip)} style={{ cursor: 'pointer' }}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAdvisor;
