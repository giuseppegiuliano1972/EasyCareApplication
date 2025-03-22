import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const VoiceHealthContext = createContext();

export const VoiceHealthProvider = ({ children }) => {
  const [healthStatus, setHealthStatus] = useState("Unknown");
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);

  useEffect(() => {
    startAnalysis();
    return () => {
      stopAnalysis();
    };
  }, []);

  const startAnalysis = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      microphoneRef.current.connect(analyserRef.current);
      analyzeVoice();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopAnalysis = () => {
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const analyzeVoice = () => {
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

      // Rough heuristic: low volume or erratic frequency shifts may indicate issues
      let status = "Sconosciuto";
      if (volume > 0) {
        status = volume > 20  ? "Healthy" : "Unwell";
      }
      
      console.log("volume", volume);
      setHealthStatus(status);
      requestAnimationFrame(analyze);
    };
    analyze();
  };

  return (
    <VoiceHealthContext.Provider value={{ healthStatus }}>
      {children}
    </VoiceHealthContext.Provider>
  );
};

export const useVoiceHealth = () => {
  return useContext(VoiceHealthContext);
};
