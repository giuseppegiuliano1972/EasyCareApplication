import React, { useState, useRef , useContext, useEffect} from 'react';
import { Calendar, dateFnsLocalizer, Navigate  } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
//import format from 'date-fns/format';
import parse from 'date-fns/parse';
import { addMonths, subMonths } from 'date-fns';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import it from 'date-fns/locale/it';
import { format, toZonedTime  } from 'date-fns-tz';
import addHours from 'date-fns/addHours';
import startOfHour from 'date-fns/startOfHour';
import axios from 'axios';
import { useSpeechSynthesis } from 'react-speech-kit';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { defineDate, formatDate, convertTextToNumbers } from '../../utils/utils';
import { MessageContext } from "../../context/MessageContext";


import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { faBox } from '@fortawesome/free-solid-svg-icons';



const Calendar2 = () => {
  const getItalianDate = () => {
    const now = new Date();
    const timeZone = 'Europe/Rome';
  
    // Converti la data corrente al fuso orario italiano
    const zonedDate = toZonedTime(now, timeZone);
  
    // Formatta la data nel formato richiesto
    const formattedDate = format(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone });
  
    return formattedDate;
  };

  const [events, setEvents] = useState([
    {
      title: 'Learn cool stuff yeag',
      start,
      end,
    }
  ]);
  const { setMessage } = useContext(MessageContext);
  const [date, setDate] = useState(new Date());
  const [subjData, setSubjData] = useState({dtmemo: ""});
  const [partData, setPartjData] = useState({dtmese: "", dtanno: ""});
  const dateInputRef = useRef(null);
  const { speak } =  useSpeechSynthesis();
  const [command, setCommand] = useState(""); // Stato per il comando vocale
  const [respData, setRespData] = useState({
    message: ""
  });
  const [state, setState] = useState({  currentDay: new Date() });
  const [view, setView] = useState("month"); // Stato per la vista del calendario
  const [currentDate, setCurrentDate] = useState(getItalianDate()); // Stato per la data corrente

  /*const onNavigate = (data) => {
    const today = new Date(data); 
    const month = today.getMonth() + 1; 
    const year = today.getFullYear(); 

    console.log("onnav: ",month, year );
    getMemoByMonthYear(month, year);
  };*/

  
  const onView = (newView) => {
    setView(newView);
  };

  const onEventResize = (data) => {
    const { start, end } = data;

    setEvents(currentEvents => {
      const firstEvent = {
        start: new Date(start),
        end: new Date(end),
      };
      return [...currentEvents, firstEvent];
    });
  };

  const onEventDrop = (data) => {
    console.log(data);
  };

  const arrNames =  {
      settimana: 'week',
      Settimana: 'week',
      giorno: 'day',
      mese: 'month',
      avanti: 'NEXT',
      agenda: 'agenda'
  };

 

  const commands = [
      {
        command: '* oggi',
        callback: (datamemo) => {console.log('data'); let today = new Date(); 
                                  let date=today.getFullYear()  + "-"+ parseInt(today.getMonth()+1) +"-"+ today.getDate() ;
                                handleApiCall(date); }
      },
      {
        command: '* avanti',
        callback: () => {console.log('avanti'); handleNavigateBackForward('add');}
      },
      {
        command: '* indietro',
        callback: () => {console.log('avanti'); handleNavigateBackForward('sub');}
      },
       {
          command: 'cerca *',
          callback: (datamemo) => {console.log('data'); setDataCerca(`${datamemo}`); }
        },
        {
          command: 'mostra *',
          callback: (vista) => { console.log('vista: ', arrNames[vista]); onView(arrNames[vista]); }
        },
        {
          command:  [ "ripeti *", "* ripetere", "non ho capito"],
          callback: () => { console.log('ripeti'); handleGetStorage(); }
        },
        {
          command: 'clear',
          callback: ({ resetTranscript }) => resetTranscript()
        }
      ]
    
 const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands, language: 'it-IT'  })

  /**
   * Funzione per aggiungere giorni a una data.
   */
  const changeDays = (date, days, op) => {
    const result = new Date(date);
    if (op === 'add'){
      result.setDate(result.getDate() + days);
    } else {
      result.setDate(result.getDate() - days);
    }
    return result;
  };

  /**
   * Funzione per aggiungere settimane a una data.
   */
  const changeWeeks = (date, weeks, op) => {
    if (op === 'add'){
      return changeDays(date, weeks * 7, 'add'); // 1 settimana = 7 giorni
    } else {
      return changeDays(date, weeks * 7, 'sub'); // 1 settimana = 7 giorni
    }
  };

  /**
   * Funzione per aggiungere mesi a una data.
   */
  const changeMonths = (date, months, op) => {
    console.log('date:', date);
    const result = new Date(date);
    console.log('res:', result);
    if (op === 'add'){
      result.setMonth(result.getMonth() + months);
    } else {
      result.setMonth(result.getMonth() - months);
    }
    
    
    return formatToISOWithDateFns(result);
  };

  const formatToISOWithDateFns = (date, timeZone = 'Europe/Rome') => {
    return format(date, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone });
  };

 const changeCurrentDay = (day) => {
        setState({ currentDay: new Date(day.year, day.month, day.number) });
      };
    
 const nextDay = () => {
        setState({ currentDay: new Date(state.currentDay.setDate(state.currentDay.getDate() + 1)) });
      };
    
  const previousDay = () => {
        setState({ currentDay: new Date(state.currentDay.setDate(state.currentDay.getDate() - 1)) });
      };

  const handleNavigateBackForward = (oper) => {
        let newDate;
        console.log('handleNavigateBackForward vista: ', view, currentDate);
        switch (view) {
          case 'day':
            newDate = changeDays(currentDate, 1, oper); // Avanza di un giorno
            break;
          case 'week':
            newDate = changeWeeks(currentDate, 1, oper); // Avanza di una settimana
            break;
          case 'month':
          default:
            newDate = changeMonths(currentDate, 1, oper); // Avanza di un mese

            break;
        }
        console.log('handleNavigateBackForward newDate: ', newDate);

        setCurrentDate(newDate); // Aggiorna la data corrente
        console.log('handleNavigateBackForward setCurrentDate: ', currentDate);
        onView(view); // Mantieni la vista corrente
        onNavigate(newDate, oper); // Notifica il calendario
      };

   
     useEffect(() => {
        console.log('useEffect currentDate aggiornato:', currentDate);
        onView('month');
        // Esegui altre azioni basate sul valore aggiornato di currentDate
      }, [currentDate]);


      const onNavigate = (date, operat = null) => {
        console.log('onNavigate operat 1: ', operat);
        if ((operat == null && Navigate.NEXT) || (operat !== null && operat !== 'add' && operat !== 'sub' && Navigate.NEXT)){
          operat = 'add';
        } 
        
        if ((operat == null && Navigate.PREVIOUS) || (operat !== null && operat !== 'add' && operat !== 'sub' && Navigate.PREVIOUS) ){
          operat = 'sub';
        } 
        
        console.log('onNavigate newDate date: ', date);
        //(date) => { setDate(new Date(date));  }
        setDate(new Date(date)); // Aggiorna lo stato della data
        console.log('onNavigate CurrentDate: ', currentDate, date);
        const today = new Date(date);
        console.log('onNavigate today: ', today);
        let month = today.getMonth();
        console.log('onNavigate operat: ', operat);
        console.log('onNavigate month pre: ', month);

        month = today.getMonth() + 1; 

        console.log('onNavigate month: ',  month);
        const year = today.getFullYear(); 
        getMemoByMonthYear(month, year);
      };

useEffect(() => {
    const today = new Date(); 
    const month = today.getMonth() + 1; 
    const year = today.getFullYear(); 
    const tday = today.getDate();
    getMemoByMonthYear(month, year);
    handleApiCall(year + '-' + month + '-' + tday);
}, []);

const setDataCerca = (dtmem) => {
  const dt = convertTextToNumbers(dtmem);
  const parsedDate = defineDate(dt);
  console.log("setDataCerca parsedDate: ", parsedDate);
  setDate(parsedDate);
  dateInputRef.current.value = parsedDate;
  handleApiCall(parsedDate);
};

const getMemoByMonthYear = (mese, anno) => {
    partData.dtmese =  mese;
    partData.dtanno = anno;
    console.log("getMemoByMonthYear subjData.dtmemo: ", partData.dtmese );
    axios.post('http://localhost:8000/api/getListCalendar/', partData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        .then(response =>  {
            console.log("resp: ", response); 
            const data = response.data;

            if (data.message !== "Nessun dato"){
              // Trasformazione opzionale dei dati
              const transformedEvents = data.map((item) => ({
                title: item.descrizione.toUpperCase(), // Trasformazione esempio
                start: new Date(item.data_remind), // Trasforma la data in formato leggibile
                end: new Date(item.data_remind),
              }));

              setEvents(transformedEvents); // Aggiorna lo stato con i dati trasformati
            }
          })
        .catch(error => console.log(error));
};

 // Funzione per effettuare la chiamata API
 const handleApiCall =  (dt) => {
       console.log("date: ", dt);
       subjData.dtmemo =  dt;
       console.log("handleApiCall subjData.dtmemo 2: ", subjData.dtmemo);
        axios.post('http://localhost:8000/api/getmemo/', subjData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        .then(response =>  {
            console.log(response); 
            setRespData({'message': response.data.message });
            handleSpeak(response.data.message);
            setMessage(response.data.message);
            console.log(":::", response.data.message); 
          })
        .catch(error => console.log(error));
  };

     // Funzione per riprodurre l'audio
     const handleSpeak = (mess) => {
        console.log("handleSpeak mess: ", mess);
        handleSaveStorage(mess);
        speak({ text: mess });
      };

  const handleChange = (event) => {
    const datap = document.getElementById('datamemo').value;

    subjData.datamemo = datap;
  };

  const handleSaveStorage = (msg) => {
    sessionStorage.setItem("msg", msg); // Salva il valore in Session Storage
    console.log("Valore salvato in Session Storage!");
  };

  const handleGetStorage = () => {
    const storedValue = sessionStorage.getItem("msg");
    speak({ text: storedValue });
  };

  return (
    <>
    <div>
    <div style={{  marginTop: '50px', marginLeft: '60vh', marginRight: '60vh', border: '1px solid #ccc', borderRadius:'10px', marginBottom: '45px', height: '30', padding: '30px', backgroundColor:'rgb(231, 239, 244)' }}>
        Per ricercare una data tramite interazione vocale pronuncia <b>Cerca</b> seguito dalla data (es. Cerca 12 Novembre 2024)<br />
        Per cambiare visualizzazione pronuncia <b>mostra mese | agenda</b><br />
        Per muoverti in avanti o indietro di un mese pronuncia <b>vai avanti | indietro</b>

      </div>
    <label htmlFor="datamemo" style={{padding: '20px', marginLeft: '60vh', marginRight: '5vh'}} >Data: </label>
      <input
        id="datamemo"
        ref={dateInputRef}
        type="date"
        value={date}
        style={{padding: '10px'}}
        onChange={(e) => {setDate(e.target.value); handleChange(e)}}
      />
      <button  onClick={() => handleApiCall(date)}  style={{
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          cursor: 'pointer',
          backgroundColor: '#0055ff' ,
          color: 'white',
          marginRight: '10px'
        }}>Cerca</button>
    </div>
    <div>
    <DnDCalendar
      views={['month', 'agenda']}
      defaultView="month"
      events={events}
      localizer={localizer}
      culture='it'
      onEventDrop={onEventDrop}
      onEventResize={onEventResize}
      date={date}
      onNavigate={ onNavigate}
      view={view}
      onView={(newView) => setView(newView)} // Permette anche il cambio manuale
      messages={{
        next: "avanti",
        previous: "indietro",
        today: "Oggi",
        month: "Mese",
        week: "Settimana",
        day: "Giorno"
      }}
      resizable
      style={{ height: '80vh', width: '100vh', marginLeft: '60vh', marginRight: '100vh'  }}
    />
    </div>
    </>
  );
};

const locales = {
  'it': it,
};
const endOfHour = (date) => addHours(startOfHour(date), 1);
const now = new Date();
const start = endOfHour(now);
const end = addHours(start, 2);

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

export default Calendar2;
