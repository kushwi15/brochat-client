import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onError?: (event: any) => void;
  onEnd?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const {
    onResult,
    onError,
    onEnd,
    continuous = false,
    interimResults = true,
    lang = 'en-US'
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = lang;

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        if (onResult) {
          onResult(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (onError) {
          onError(event);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (onEnd) {
          onEnd();
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech Recognition is not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, interimResults, lang]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    supported,
    startListening,
    stopListening
  };
};
