import { useState, useRef, useEffect } from 'react';
import { voiceAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './VoiceAssistant.css';

export default function VoiceAssistant() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        setTranscript('');
        setError('');
      };

      recognitionRef.current.onresult = (event) => {
        const text = Array.from(event.results)
          .map(res => res[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone permissions in 🔒 browser URL bar.');
        } else {
          setError('Error: ' + event.error);
        }
      };

      recognitionRef.current.onend = async () => {
        setIsRecording(false);
        // Process transcript when done if we have text
        const finalTranscript = recognitionRef.current.finalText;
        if (finalTranscript) {
           processQuery(finalTranscript);
        }
      };
    } else {
      setError('Web Speech API not supported in this browser.');
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, [language]);

  // Handle language change for recognition
  useEffect(() => {
    if (recognitionRef.current) {
      const getLangCode = (lang) => {
        switch(lang) {
          case 'hi': return 'hi-IN';
          case 'mr': return 'mr-IN';
          case 'te': return 'te-IN';
          case 'kn': return 'kn-IN';
          case 'en': default: return 'en-IN';
        }
      };
      recognitionRef.current.lang = getLangCode(language);
    }
  }, [language]);

  const processQuery = async (text) => {
    if (!text || text.trim() === '') return;
    try {
      setResponse(language === 'hi' ? 'सोच रहा हूँ...' : 'Thinking...');
      const res = await voiceAPI.query(text, language);
      if (res.data.success) {
        setResponse(res.data.response);
        speak(res.data.response);
        if (res.data.action && res.data.action.type === 'navigate') {
          setTimeout(() => {
            navigate(res.data.action.path);
            setIsOpen(false);
          }, 2000);
        }
      }
    } catch (err) {
      setResponse(language === 'hi' ? 'क्षमा करें, नेटवर्क त्रुटि।' : 'Sorry, network error.');
    }
  };

  const speak = (text) => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    switch(language) {
      case 'hi': utterance.lang = 'hi-IN'; break;
      case 'mr': utterance.lang = 'mr-IN'; break; // Supported in some browsers
      default: utterance.lang = 'en-IN'; break;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  const toggleRecording = () => {
    setError('');
    
    // Stop synthesis if speaking
    if (synthesisRef.current && speaking) {
      synthesisRef.current.cancel();
      setSpeaking(false);
    }

    if (isRecording) {
      recognitionRef.current.stop();
      if (transcript) processQuery(transcript);
    } else {
      if (recognitionRef.current) {
        setTranscript('');
        setResponse('');
        // Store the text on end because interim clears it
        recognitionRef.current.onresult = (event) => {
          const text = Array.from(event.results).map(res => res[0].transcript).join('');
          setTranscript(text);
          recognitionRef.current.finalText = text;
        };
        try {
          recognitionRef.current.start();
        } catch(e) {
          console.error(e);
        }
      } else {
        setError('Speech API not supported.');
      }
    }
  };

  const closePanel = () => {
    setIsOpen(false);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setIsRecording(false);
    setSpeaking(false);
  };

  if (!isOpen) {
    return (
      <button className="voice-fab" onClick={() => setIsOpen(true)}>
        🎙️
      </button>
    );
  }

  return (
    <div className="voice-panel">
      <div className="voice-header">
        <h4>🎙️ {t('voiceAssistant')}</h4>
        <button className="voice-close" onClick={closePanel}>✕</button>
      </div>

      <div className="voice-body">
        {error ? (
          <p style={{color: 'var(--color-danger)', fontSize: '0.875rem'}}>{error}</p>
        ) : (
          <>
            <button 
              className={`voice-record-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
            >
              <div className="mic-icon">{isRecording ? '⏸️' : '🎤'}</div>
              <span>{isRecording ? t('listening') : t('tapToSpeak')}</span>
            </button>

            {transcript && (
              <div className="voice-response" style={{background: 'var(--bg-input)'}}>
                <p style={{fontStyle: 'italic', color: 'var(--text-secondary)'}}>"{transcript}"</p>
              </div>
            )}

            {response && (
              <div className="voice-response">
                <p>
                  {speaking && <span style={{display: 'inline-block', marginRight: '8px', animation: 'blink 1s infinite'}}>🔊</span>}
                  {response}
                </p>
              </div>
            )}

            <p className="voice-hint">
              💡 {t('trySaying')}: <b>"{language === 'hi' ? 'टमाटर का भाव बताओ' : 'What is the price of tomato?'}"</b>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
