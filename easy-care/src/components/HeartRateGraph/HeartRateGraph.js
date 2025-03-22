import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrazione dei componenti di Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HeartRateGraph = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Funzione per chiamare l'API
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/heart-data'); // Cambia URL se necessario
        const data = response.data;

        // Processa i dati per il grafico
        const labels = data.map(item => new Date(item.timest).toLocaleString()); // Converti il datetimestamp
        const values = data.map(item => item.heartbeatavg); // Estrarre i valori Integer

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Valori nel tempo',
              data: values,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error('Errore durante il fetch dei dati:', error);
      }
    };

    fetchData();
  }, []);

  if (!chartData) {
    return <div>Caricamento del grafico...</div>;
  }

  return (
    <div className='HeartRateGraph'>
      <h2>Battito cardiaco Monitor</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: true,
              text: 'Andamento dei valori nel tempo',
            },
          },
        }}
      />
    </div>
  );
};

export default HeartRateGraph;
