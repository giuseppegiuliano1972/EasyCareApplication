import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageContext } from "../../context/MessageContext";
import axios from 'axios';


const HeartRateCheck = () => {
  const [textToSpeak, setTextToSpeak] = useState("Il tuo battito, negli ultimi due giorni, è sceso: vuoi richiedere aiuto ?");
  const [ripeti, setRipeti] = useState(true);
  const { setMessage } = useContext(MessageContext);
  const ripetiRef = useRef(true)
  // const { speak, cancel } = useSpeechSynthesis();
  const [respData, setRespData] = useState({
    message: ""
  });
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const MIN_HM_VALUE = 50;
  const TEXT_HM_LOW = 'Il tuo battito, negli ultimi due giorni, è sceso: vuoi richiedere aiuto?';

    
    // Funzione per attivare la sintesi vocale
    const speak = () => {
      if (!window.speechSynthesis) {
        alert("Il tuo browser non supporta la sintesi vocale.");
        return;
      }
  
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "it-IT"; // Imposta la lingua italiana
      window.speechSynthesis.speak(utterance);
    };

  const checkRateValue = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/heart-check'); // Cambia URL se necessario
        const data = response.data.hmavg;
        console.log('Data heart-check:', data);
        const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
          const [key, value] = cookie.split("=");
          acc[key] = value;
          return acc;
        }, {});
    
        if (cookies.response) {
          console.log(cookies.response);
          if (cookies.response === 'no'){
            ripetiRef.current = false;
          }
        }
        console.log("heart: " , data, ripetiRef.current);
        if (data !== null && data <= MIN_HM_VALUE &&  ripetiRef.current){
          setMessage(textToSpeak);
          speak();
        }
          
      }
      catch (error) {
        console.error('Errore durante il fetch dei dati:', error);
      }
 };

  // Effettua la richiesta quando il componente viene montato
  useEffect(() => {
    checkRateValue();
  }, [textToSpeak]);


  return (
    <div>
    </div>
  );

};


export default HeartRateCheck;
