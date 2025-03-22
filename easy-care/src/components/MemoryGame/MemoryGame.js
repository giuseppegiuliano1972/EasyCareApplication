import { useEffect, useState } from 'react';
import './SingleCard.css'
import SingleCard from './SingleCard';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// array of card images
const cardImages = [
  { "src": "/img/helmet-1.png", matched: false },
  { "src": "/img/potion-1.png", matched: false },
  { "src": "/img/ring-1.png", matched: false },
  { "src": "/img/scroll-1.png", matched: false },
  { "src": "/img/shield-1.png", matched: false },
  { "src": "/img/sword-1.png", matched: false },
]

function MemoryGame() {

  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);

  const commands = [
    {
      command: '*',
      callback: (numero) => {console.log("qui");  selectCardVoice(`${numero}`)}
    },
    {
      command: 'nuovo gioco',
      callback: () => {console.log("qui"); shuffleCards()}
    },
    {
      command: 'clear',
      callback: ({ resetTranscript }) => resetTranscript()
    }
  ]

  const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands })


  if (browserSupportsSpeechRecognition) {
    SpeechRecognition.startListening({ continuous: true,  language: 'it-IT'  });
  } else {
    console.log("SPeech non supportato");
  }

  const selectCardVoice = (numero) => {

    // Mappa di conversione
    const numberMap = {
        zero: 0,
        uno: 1,
        due: 2,
        tre: 3,
        quattro: 4,
        cinque: 5,
        sei: 6,
        sette: 7,
        otto: 8,
        nove: 9,
        dieci: 10,
        undici: 11,
        dodici: 12
    };
  
    // Funzione di conversione
    const convertToNumber = (text) => {
        console.log("convertToNumber:", text);
        return numberMap[text.toLowerCase()] || null; // Restituisce null se non trova una corrispondenza
    };

    let cardIndex = 0;
    if (isNaN(+numero)){
        console.log("Carta ind trans conv:", convertToNumber(numero));
        cardIndex = convertToNumber(numero);
    } else {
        console.log("Carta ind trans:", numero);
        cardIndex = numero;
    }
    
    console.log("Cards:", cards);
    cards.map((card) => {
        if (parseInt(card.index) === (parseInt(cardIndex)-1)) {
            console.log("map: ", card);
            handleChoice(card); // Gestisce il click vocale
        }
    });

  };

  // shuffle cards, duplica cards , assegna ID random 
  const shuffleCards = () => {
    let index = 0; // Variabile per l'indice inizializzato a 0
    const shuffledCards = [...cardImages, ...cardImages]      // 2 gruppi di img card
      .sort(() => Math.random() - 0.5)                        // shuffled array
      .map((card) => ({ ...card, id: Math.random(), index: index++ }))        // add on random ID number to each card

    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffledCards);
    setTurns(0);
  }

  // handle scelta
  const handleChoice = (card) => {
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card)        // if choiceOne is null (is false), update with setChoiceOne, else update choiceTwo with setChoiceTwo
  }

  // reset game 
  useEffect(() => {
    shuffleCards()
  }, [])

  // compare di 2 cards
  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);
      if (choiceOne.src === choiceTwo.src) {
        setCards(prevCards => {
          return prevCards.map((card) => {
            if (card.src === choiceOne.src) {
              return { ...card, matched: true }
            } else {
              return card;
            }
          })
        })
        resetTurn();
      } else {
        setTimeout(() => resetTurn(), 1000);
      }
    }
  }, [choiceOne, choiceTwo])

  // reset choices and increase number of turns
  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns(prevTurns => prevTurns + 1);
    setDisabled(false);
  }

  return (
    <div className="content">
      <h1>Memory Game</h1>
      <div className="shadow"><p>Per giocare chiama i numeri corrispondenti alla posizione delle carte che vuoi girare</p>
      <p>Per ricominciare il gioco pronuncia: <b>Nuovo gioco</b></p>
      </div>
      <div className='button-container'>
        <button className="submit" onClick={shuffleCards}>Nuovo</button>
        
        <p>Turno: {turns}</p>
      </div>
      <div className="card-grid">
        {cards.map((card) => (
          <SingleCard
            key={card.id}
            cardIndex={card.index}
            card={card}
            handleChoice={handleChoice}
            cardFlipped={card === choiceOne || card === choiceTwo || card.matched}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

export default MemoryGame;