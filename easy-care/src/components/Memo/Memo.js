import React, { useState, useRef, useContext } from "react"
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { MessageContext } from "../../context/MessageContext";
import axios from 'axios';
import styles from './Memo.module.css';

const Memo = () => {
  const { setMessage } = useContext(MessageContext);
  const [subjData, setSubjData] = useState({descrmemo: "",datamemo: "", oramemo: ""});
  const [respData, setRespData] = useState({message: ""  });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [memo, setMemo] = useState('');
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);
  const memoInputRef = useRef(null);

  const commands = [
    {
      command: 'nota *',
      callback: (promem) => {console.log('mem'); setMemo(`${promem}`);}
    },
    {
      command: 'data *',
      callback: (datamemo) => {console.log('data'); defineDate(`${datamemo}`);}
    },
    {
      command: 'ora *',
      callback: (timememo) => {console.log('ora'); defineTime(`${timememo}`);}
    },
    {
      command: 'conferma',
      callback: () => { handleSubmit(); }
    },
    {
      command: 'clear',
      callback: ({ resetTranscript }) => resetTranscript()
    }
  ]

  const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands })


  if (browserSupportsSpeechRecognition) {
    SpeechRecognition.startListening({ continuous: true });
  } else {
    alert("Il tuo browser non supporta il riconoscimento vocale.");
    return;
  }

  const defineTime = (tmmem) => {
   
    const tm = tmmem.toLowerCase();
    console.log("ORA: ", tm);
    const parsedTime = parseTimeFromCommand(tm);
    if (parsedTime) {
      setTime(parsedTime);
      timeInputRef.current.value = parsedTime;
    } else {
      alert("Orario non riconosciuta. Prova a dire '15 e 28'.");
    }

  };

  const defineDate = (dtmem) => {
    const dt = dtmem.toLowerCase();
    console.log("Comando vocale riconosciuto:", dt.replace(/[.,\s]/g, ''));
    const parsedDate = parseDateFromCommand(dt);
    if (parsedDate) {
      setDate(parsedDate);
      dateInputRef.current.value = parsedDate;
    } else {
      alert("Data non riconosciuta. Prova a dire una data come '15 novembre 2024'.");
    }
  };
  
  // Funzione per analizzare il comando vocale e estrarre la data
  const parseTimeFromCommand = (command) => {
   
    const timePattern = /(\d{1,2})([a-zA-Z\\:]+)(\d{1,2})/;
    const match = command.match(timePattern);
    console.log("ORA m: ", match);
    if (match) {
      const hour = match[1].padStart(2, '0');
      const minute = match[3].padStart(2, '0');;
      if (minute) {
        return `${hour}:${minute}`;
      }
    }
    return null;
  };

  // Funzione per analizzare il comando vocale e estrarre la data
  const parseDateFromCommand = (command) => {
    // Gestione del formato "15 novembre 2024"
    const datePattern = /(\d{1,2})\s([a-zA-Z]+)\s(\d{4})/;
    const match = command.match(datePattern);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = getMonthNumber(match[2]);
      const year = match[3];
      if (month) {
        return `${year}-${month}-${day}`;
      }
    }
    return null;
  };

  // Funzione per convertire il nome del mese in numero
  const getMonthNumber = (monthName) => {
    const months = [
      'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
      'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'
    ];
    const monthIndex = months.indexOf(monthName.toLowerCase());
    return monthIndex !== -1 ? (monthIndex + 1).toString().padStart(2, '0') : null;
  };

  const handleChange = (event) => {
    console.log('Chimato');
    const memop = document.getElementById('descrmemo').value;
    const datap = document.getElementById('datamemo').value;
    const orap = document.getElementById('oramemo').value;

    subjData.descrmemo = memop;
    subjData.datamemo = datap;
    subjData.oramemo = orap;

  };

  const handleSubmit = (event = null) => {
    if (event){
      event.preventDefault();
    }

    console.log('handsub');
    
    // Validazione dei campi
    if (!memo || !date || !time) {
      setMessage("Tutti i campi sono obbligatori.");
      
    } else {

      subjData.descrmemo = memo;
      subjData.datamemo = date;
      subjData.oramemo = time;

      axios.post('http://localhost:8000/api/insmemo/', subjData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
            .then(response => {
              console.log(response); 
                  // Esegue il reset dei campi
                if (dateInputRef.current) dateInputRef.current.value = "";
                if (timeInputRef.current) timeInputRef.current.value = "";
                if (memoInputRef.current) memoInputRef.current.value = "";
              })
            .catch(error => console.log(error));
    }

  };

  return (
    <div className={styles.container}> 
	    <header>Memo</header>
      <div className={styles.shadow}><p>Per valorizzare i campi tramite interazione vocale far precedere il valore da inserire dal nome del campo</p></div>
      <form>
        <label htmlFor="descrmemo">Nota:</label>
            <textarea
                  id="descrmemo"
                  cols={50}
                  rows={5}
                  ref={memoInputRef}
                  type="textarea"
                  value={memo}
                  onChange={(e) => {setMemo(e.target.value); handleChange(e)}}
                />
          <label htmlFor="datamemo">Data:</label>
                <input
                  id="datamemo"
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={(e) => {setDate(e.target.value); handleChange(e)}}
                />
          <label htmlFor="oramemo">Ora:</label>
              <input
                  id="oramemo"
                  ref={timeInputRef}
                  type="text"
                  value={time}
                  onChange={(e) => {setTime(e.target.value); handleChange(e)}}
                />
          <div className={styles.buttoncontainer}>
              <button  onClick={handleSubmit} className={styles.submit}>Submit</button>
              <button id="cancel" className={styles.cancel}>Cancel</button>
          </div>
          </form>
       </div>
	);

};


export default Memo;
