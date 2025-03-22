import React, { useState, useEffect } from 'react';
const rNumer = {
  uno: 1,
  due: 2,
  tre: 3,
  quattro: 4,
  cinque: 5,
  sei: 6,
  sette: 7,
  otto: 8,
  nove: 9,
};

export function defineDate (dtmem)  {

    const dt = dtmem.toLowerCase();
    console.log("Comando vocale riconosciuto:", dt.replace(/[.,\s]/g, ''));
    const parsedDate = parseDateFromCommand(dt);
    if (parsedDate) {
        return parsedDate;

    } else {
      alert("Data non riconosciuta. Prova a dire una data come '15 novembre 2024'.");
      return 0;
    }
  };

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

  export const formatDate = (date = new Date()) => {
    return date.toISOString().split('T')[0];
  };

  export  const convertTextToNumbers = (text) => {
      const mapping = {
        uno: "1",
        due: "2",
        tre: "3",
        quattro: "4",
        cinque: "5",
        sei: "6",
        sette: "7",
        otto: "8",
        nove: "9",
        dieci: "10",
        undici: "11",
        dodici: "12",
        tredici: "13",
        quattordici: "14",
        quindici: "15",
        sedici: "16",
        diciassette: "17",
        diciotto: "18",
        diciannove: "19",
        venti: "20",
        ventuno: "21",
        ventidue: "22",
        ventitré: "23",
        ventiquattro: "24",
        venticinque: "25",
        ventisei: "26",
        ventisette: "27",
        ventotto: "28",
        ventinove: "29",
        trenta: "30",
        trentuno: "31"
      };
    
      // Sostituisci ogni parola numerica con il corrispettivo numero
      return text
        .split(" ")
        .map((word) => mapping[word.toLowerCase()] || word)
        .join(" ");
    };