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
          setTriggerData(response.data.dailySymptomCounts);
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

  const daysOfWeekMap = {
    MONDAY: '월',
    TUESDAY: '화',
    WEDNESDAY: '수',
    THURSDAY: '목',
    FRIDAY: '금',
    SATURDAY: '토',
    SUNDAY: '일'
  };

  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

  const dayData = daysOfWeek.map(day => {
    const englishDay = Object.keys(daysOfWeekMap).find(key => daysOfWeekMap[key] === day);
    return triggerData[englishDay] || 0;
  });

  const barData = {
    labels: daysOfWeek,
    datasets: [
      {
        label: '트리거 발생 횟수',
        data: dayData,
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