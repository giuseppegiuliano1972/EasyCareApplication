import logo from './logo.svg';
import './global.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useState, useRef, useContext } from "react"
import { Routes, Route, BrowserRouter as Router, Link, Navigate } from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import { MessageProvider, MessageContext } from './context/MessageContext';
import SpeechRecognition, {  useSpeechRecognition} from "react-speech-recognition"
import axios from "axios";
import Memo from './components/Memo/Memo';
import Calendar2 from './components/VoiceMemo/Calendar2';
import Home from './components/Home/Home';
import MemoryGame from './components/MemoryGame/MemoryGame';
import Footer from './components/Footer/Footer';

function App() {
  const { message, setMessage } = useContext(MessageContext);
  const commands = [
    {
      command: ["Apri *", "apri *", "Apri *"],
      callback: redirectPage => setRedirectUrl(redirectPage.replace(/[.,\s]/g, '').toLowerCase()),
    },
    {
      command: ["non chiamare", "non chiedere aiuto", "non richiedere"],
      callback:  () => setCookie(1)
    },
    {
      command: [ "chiedi aiuto", "* messaggio", "invia richiesta"],
      callback: () => { console.log('aiuto: '); sendHelpMessage(); }
    },
  ]
  const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands })
  const videoRef = useRef(null);
  

  const [redirectUrl, setRedirectUrl] = useState("")
  const pages = ["home", "calendario", "promemoria", "memory"]
  const urls = {
    calendario: "/calendario",
    promemoria: "/promemoria",
    memory: "/memory",
    home: "/",
  }

  if (browserSupportsSpeechRecognition) {
    SpeechRecognition.startListening({ continuous: true,  language: 'it-IT'  });
  }


  let redirect = ""

  if (redirectUrl) {
    if (pages.includes(redirectUrl)) {
      redirect = <Navigate to={urls[redirectUrl]}/>
    } else {
      redirect = <p>Could not find page: {redirectUrl}</p>
    }
  }

  const setCookie = (hours) => {
    const date = new Date();
    const name = "response";
    const value = "no";
    date.setTime(date.getTime() + hours * 60 * 60 * 1000); // Scadenza dopo hours ore
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`;
    //document.cookie = "response=no; path=/; max-age=31536000"; // Scrive il cookie
  };


  const sendHelpMessage = async () => {

    try {
      const response = await axios.post("http://localhost:8000/api/send-help-message/", {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: "Richiesta di aiuto! Si prega di intervenire." }),
      });
      console.log("API chiamata con successo:", response.data);
      setMessage("Richiesta di aiuto inviata");
    } catch (error) {
      console.error("Errore durante la chiamata API:", error);
    }

};

  return (
   
    <div className="App">
     <Router>
       <Navbar bg="primary" data-bs-theme="dark" fixed="top">
       <Container>
        <Navbar.Brand href="/">Easy Care</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/promemoria">Promemoria</Nav.Link>
            <Nav.Link href="/calendario">Calendario</Nav.Link>
            <Nav.Link href="/memory">Memory Game</Nav.Link>
        </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/promemoria" element={<Memo />} />
            <Route path="/calendario" element={<Calendar2 />} />
            <Route path='/memory' element={<MemoryGame />} />
	  		</Routes>
        {redirect}
			</Router>

        <Footer />
        </div>

  );
}

export default App;
