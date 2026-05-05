import { useState, useCallback, useEffect, useRef } from 'react';

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      // JARVIS style: Sophisticated British Male
      const preferredVoice = voices.find(v => v.name.includes('Google UK English Male')) ||
        voices.find(v => v.name.includes('UK English')) ||
        voices.find(v => v.name.includes('George')) ||
        voices.find(v => v.name.includes('Hazel')) ||
        voices[0];

      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.pitch = 1.1; // Refined AI tone
      utterance.rate = 1.1;  // Efficient AI rate


      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = doSpeak;
    } else {
      doSpeak();
    }
  }, []);


  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    stop,
    isPlaying
  };
};
