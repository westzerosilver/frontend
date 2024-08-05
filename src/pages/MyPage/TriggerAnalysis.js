import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement } from 'chart.js';
import './TriggerAnalysis.css';
import axios from 'axios';

Chart.register(BarElement);

const TriggerAnalysis = () => {
  const [triggerData, setTriggerData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTriggerData = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          setError('로그인이 필요합니다.');
          return;
        }

        const response = await axios.get('/api/members/mypage', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.status === 200) {
          setTriggerData(response.data.weeklySymptomCounts);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Error fetching trigger data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchTriggerData();
  }, []);

  const symptomMap = {
    VOMIT: '구토',
    MEDICINE: '변비약 복용',
    BINGE: '폭식',
    REDUCE: '양 줄이기',
    SPIT: '씹고 뱉기',
    DIETMEDICINE: '다이어트약 복용',
    EXERCISE: '과한 운동',
    OTHER: '기타',
    NOTHING: '증상이 없었어요!'
  };

  const labels = Object.keys(symptomMap);
  const data = labels.map(label => triggerData[label] || 0);
  const barData = {
    labels: labels.map(label => symptomMap[label]),
    datasets: [
      {
        label: '트리거 발생 횟수',
        data: data,
        backgroundColor: '#FFCF24',
        borderRadius: 7,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 14
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 14
          }
        }
      }
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className='trigger-analysis'>
      <div className='trigger-title'>식사 트리거 증상 분석</div>
      <div className='trigger-sub-title'>주간 트리거 발생</div>
      <div className='trigger-chart-container'>
        <div className='trigger-chart-wrapper'>
          {error ? (
            <p className='error-message'>{error}</p>
          ) : (
            <Bar data={barData} options={options} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TriggerAnalysis;