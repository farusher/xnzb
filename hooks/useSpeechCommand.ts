import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechCommandReturn {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  lastTranscript: string;
}

export const useSpeechCommand = (onCommandDetected: (text: string) => void): SpeechCommandReturn => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
      if (shouldListenRef.current) {
        // Add a small delay before restarting to prevent rapid loops
        setTimeout(() => {
           try {
             recognition.start();
           } catch (e) {
             console.log("Restart failed", e);
           }
        }, 100);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      console.warn("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        shouldListenRef.current = false;
        setError("Microphone access denied.");
      }
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setLastTranscript(finalTranscript);
        console.log("Transcript:", finalTranscript);

        // Regex to match "弹幕说", "大幕说" (common mishearing), "字幕说"
        // Captures the text AFTER the phrase
        const regex = /(?:弹幕|大幕|字幕)\s*说(.*)/;
        const match = regex.exec(finalTranscript);

        if (match) {
           let commandContent = match[1].trim(); 

           // Remove common leading punctuation
           commandContent = commandContent.replace(/^[，,。.!！?？:：\s]+/, '');
           
           if (commandContent && commandContent.length > 0) {
             console.log("Command detected:", commandContent);
             onCommandDetected(commandContent);
           }
        }
      }
    };

    recognitionRef.current = recognition;

    if (shouldListenRef.current) {
      try {
        recognition.start();
      } catch (e) { /* ignore */ }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [onCommandDetected]);

  const startListening = useCallback(() => {
    shouldListenRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition start failed", e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return { isListening, startListening, stopListening, error, lastTranscript };
};