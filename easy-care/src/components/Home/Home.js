import { CardGroup , Card }  from 'react-bootstrap';
import React from 'react'
import HeartRateGraph from '../HeartRateGraph/HeartRateGraph';
import HeartRateCheck from '../HeartRateGraph/HeartRateCheck';
import './Home.module.css';

const Home = () => {
  
  return (
    <>
    <div className='content'>
    <CardGroup className='card-group'>
    <Card>
      <Card.Img variant="top" src="calend.jpg" />
      <Card.Body>
        <Card.Title>Calendario</Card.Title>
        <Card.Text>
          Visualizzazione e ricerca promemoria
          (per utilizzare puoi usare il comando vocale <b>Apri calendario</b>)
        </Card.Text>
      </Card.Body>
    </Card>
    <Card>
      <Card.Img variant="top" src="promem.jpg" />
      <Card.Body>
        <Card.Title>Promemoria</Card.Title>
        <Card.Text>
          Consente di inserire un nuovo promemoria
          (per utilizzare puoi usare il comando vocale <b>Apri promemoria</b>)
        </Card.Text>
      </Card.Body>
    </Card>
    <Card>
      <Card.Img variant="top" src="memoryg.jpg" />
      <Card.Body>
        <Card.Title>Memory Game</Card.Title>
        <Card.Text>
          Allena la tua memoria
          (per utilizzare puoi usare il comando vocale <b>Apri Memory</b>)
        </Card.Text>
      </Card.Body>
    </Card>
    </CardGroup>
    </div>
    <div  style={{ maxWidth: '800px', margin: '0 auto' }}>
        <HeartRateGraph />
        <HeartRateCheck />
      </div>
      </>
  );

};

export default Home;
