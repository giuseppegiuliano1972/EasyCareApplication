import React from 'react';
import ReactDOM from 'react-dom/client';
//import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GestureProvider } from "./context/GestureContext";
import { MessageProvider } from './context/MessageContext';
import { VoiceHealthProvider } from "./context/VoiceHealthContext";
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 
    
        <MessageProvider>
            <GestureProvider>
                    <App />
            </GestureProvider>
        </MessageProvider>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
