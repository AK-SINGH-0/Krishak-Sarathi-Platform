import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { BsSendFill, BsRobot, BsPerson, BsVolumeUp, BsGlobe, BsArrowRepeat } from 'react-icons/bs';
import { speakText, stopSpeech } from '../../utils/speechUtils';
import api, { getErrorMessage } from '../../utils/api';
import { ADVISOR_LANGUAGES, AUTO_LANGUAGE, getNativeName } from '../../utils/languages';
import './AIAdvisor.css';

/** Turns of conversation sent back to the API so follow-up questions make sense. */
const HISTORY_TURNS = 6;

/** Renders **bold** and line breaks; the model replies in light markdown. */
const formatMessage = (text) => {
  if (!text) return null;
  return text
    .replace(/\n{2,}/g, '\n') // the model likes blank lines between bullets
    .split('\n')
    .filter((line) => line.trim())
    .map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="msg-line">
          {parts.map((part, pIdx) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={pIdx}>{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </p>
      );
    });
};

const AIAdvisor = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: t('aiAdvisor.chat.greeting'), language: i18n.language || 'en' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // 'auto' answers in whatever language the farmer typed in; a specific code
  // pins every reply to that language.
  const [replyLanguage, setReplyLanguage] = useState(AUTO_LANGUAGE);
  const sessionId = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Speak each reply in its own language, not the app's UI language
  const speak = (text, language) => {
    speakText({ text, language: language || 'en' });
  };

  const startNewChat = () => {
    stopSpeech();
    sessionId.current = null;
    setMessages([
      { id: Date.now(), sender: 'ai', text: t('aiAdvisor.chat.greeting'), language: i18n.language || 'en' },
    ]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const question = input.trim();
    const userMsg = { id: Date.now(), sender: 'user', text: question };
    // Capture the thread before this question so the API gets real context
    const priorTurns = messages
      .slice(1) // drop the canned greeting
      .slice(-HISTORY_TURNS * 2)
      .map((m) => ({ role: m.sender === 'user' ? 'user' : 'ai', text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/ai/chat', {
        message: question,
        language: replyLanguage,
        mode: 'text',
        sessionId: sessionId.current,
        history: priorTurns,
      });
      sessionId.current = data.sessionId;

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.answer,
        language: data.language || 'en',
        sources: data.sources,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: t('aiAdvisor.errorReply'),
          language: 'en',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="container ai-advisor-page">
      <div className="section-header text-center">
        <h2>{t('aiAdvisor.title')}</h2>
        <p className="text-muted">{t('aiAdvisor.subtitle')}</p>
      </div>

      <div className="chat-container glass-panel">
        <div className="chat-lang-bar">
          <span className="lang-label"><BsGlobe /> {t('aiAdvisor.languageLabel')}</span>
          <div className="lang-buttons">
            <button
              type="button"
              className={`lang-btn ${replyLanguage === AUTO_LANGUAGE ? 'active' : ''}`}
              onClick={() => setReplyLanguage(AUTO_LANGUAGE)}
            >
              {t('aiAdvisor.autoLanguage')}
            </button>
            {ADVISOR_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`lang-btn ${replyLanguage === lang.code ? 'active' : ''}`}
                onClick={() => setReplyLanguage(lang.code)}
                title={lang.label}
              >
                {lang.native}
              </button>
            ))}
          </div>
          <button type="button" className="new-chat-btn" onClick={startNewChat}>
            <BsArrowRepeat /> {t('aiAdvisor.clearChat')}
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender === 'user' ? 'user-wrapper' : 'ai-wrapper'}`}>
              <div className="message-avatar">
                {msg.sender === 'ai' ? <BsRobot /> : <BsPerson />}
              </div>
              <div className={`message-bubble ${msg.sender}-bubble`}>
                <div className="message-text">
                  {msg.sender === 'ai' ? formatMessage(msg.text) : msg.text}
                </div>
                {msg.sender === 'ai' && (
                  <div className="message-actions">
                    <button
                      type="button"
                      className="icon-btn speak-btn"
                      title={t('aiAdvisor.listen')}
                      onClick={() => speak(msg.text, msg.language)}
                    >
                      <BsVolumeUp />
                    </button>
                    {msg.language && (
                      <span className="msg-lang-tag">{getNativeName(msg.language)}</span>
                    )}
                  </div>
                )}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="text-muted text-sm mt-2">
                    {t('common.sources')}: {msg.sources.map((s) => `${s.crop} - ${s.title}`).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-wrapper ai-wrapper">
              <div className="message-avatar"><BsRobot /></div>
              <div className="message-bubble ai-bubble">{t('aiAdvisor.thinking')}</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            placeholder={t('aiAdvisor.placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
            <BsSendFill />
          </button>
        </form>
        <p className="chat-lang-hint">{t('aiAdvisor.languageHint')}</p>
      </div>
    </div>
  );
};

export default AIAdvisor;
