import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { MessageContext } from "./MessageContext";
import axios from "axios";

// Creazione del contesto
const GestureContext = createContext();

export const GestureProvider = ({ children }) => {
  const [gesture, setGesture] = useState(false); // Stato globale per il gesto
  const [messageSent, setMessageSent] = useState(false); // Stato globale per il gesto
  const videoRef = useRef(null); // Riferimento al video della webcam
  const { setMessage } = useContext(MessageContext);

  let gestureTimeout = null;

  useEffect(() => {
    const initializeMediapipe = async () => {
      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(handleGesture);

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });

      camera.start();
    };

    initializeMediapipe();
  }, [messageSent]);

  let consecutiveFrames = 0;
  const FRAMES_THRESHOLD = 20; // Deve essere visibile per 20 frame consecutivi

  const handleGesture = (results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // Esempio: logica per determinare un gesto
      const recognizedGesture = isHandOpenCheck(results.multiHandLandmarks[0]);
      consecutiveFrames++;

      if (recognizedGesture && !gestureTimeout && consecutiveFrames >= FRAMES_THRESHOLD) {
        gestureTimeout = setTimeout(() => {
          sendHelpMessage();
          consecutiveFrames = 0; // Resetta il conteggio
          gestureTimeout = null;
        }, 1000); // Aspetta 1 secondo prima di inviare il messaggio
      }
      else if (!recognizedGesture) {
        consecutiveFrames = 0; 
      }
    } else {
      clearTimeout(gestureTimeout);
      gestureTimeout = null;
    }

  };
  
  const isHandOpenCheck = (landmarks) => {
    if (!landmarks || landmarks.length < 21) return false;

    const palmBase = landmarks[0]; // Base del palmo
    const fingers = [
      landmarks[4],  // Pollice
      landmarks[8],  // Indice
      landmarks[12], // Medio
      landmarks[16], // Anulare
      landmarks[20]  // Mignolo
    ];
  
    // Calcola la distanza di ciascun dito dalla base del palmo
    const distances = fingers.map(finger => 
      Math.sqrt(
        Math.pow(finger.x - palmBase.x, 2) +
        Math.pow(finger.y - palmBase.y, 2) +
        Math.pow(finger.z - palmBase.z, 2)
      )
    );
  
    // Verifica che le dita siano distese (distanza > soglia minima)
    const MIN_DISTANCE = 0.2; // Calibra in base ai dati
    const allFingersExtended = distances.every(distance => distance > MIN_DISTANCE);
  
    // Verifica che le dita siano separate (distanza tra le punte > soglia minima)
    const MIN_SPREAD = 0.05; // Calibra in base ai dati
    const fingerPairs = [
      [landmarks[8], landmarks[12]], // Indice-Medio
      [landmarks[12], landmarks[16]], // Medio-Anulare
      [landmarks[16], landmarks[20]] // Anulare-Mignolo
    ];
    const fingersSpread = fingerPairs.every(([a, b]) => 
      Math.sqrt(
        Math.pow(a.x - b.x, 2) + 
        Math.pow(a.y - b.y, 2)
      ) > MIN_SPREAD
    );
  
    // Restituisce true solo se tutte le condizioni sono soddisfatte
    return allFingersExtended && fingersSpread;
  
  };

  
 
// Funzione per inviare il messaggio di aiuto
const sendHelpMessage = async () => {

    try {
      if (!messageSent){
      const response = await axios.post("http://localhost:8000/api/send-help-message/", {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: "Richiesta di aiuto! Si prega di intervenire." }),
      });
      console.log("API chiamata con successo:", response.data.status);
      setMessageSent(true);
      if (response.data.status === 'success'){
        setMessage("Messaggio di aiuto inviato");
       
      } else {
        setMessage("Impossibile inviare il messaggio di aiuto in questo momento");
      }
    }
    } catch (error) {
      console.error("Errore durante la chiamata API:", error);
    }

};

  return (
    <GestureContext.Provider>
      {/* Video nascosto per elaborazione della webcam */}
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          top: "-9999px",
          width: 0,
          height: 0,
        }}
      />
      {children}
    </GestureContext.Provider>
  );
};

export const useGesture = () => {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error("useGesture deve essere usato all'interno di GestureProvider");
  }
  return context;
};
