import React from 'react';
import { Pie } from 'react-chartjs-2';
import './WeeklyReport.css';

const WeeklyReport = (props) => {
  const { startDate, endDate, weeklyEatingTypeCounts } = props;

  // 식사 종류별 횟수를 추출하여 배열로 변환
  const eatingTypeCounts = Object.values(weeklyEatingTypeCounts);
  const eatingTypeLabels = Object.keys(weeklyEatingTypeCounts).map(type => {
    switch (type) {
      case 'BREAKFAST': return '아침';
      case 'LUNCH': return '점심';
      case 'DINNER': return '저녁';
      case 'SNACK': return '간식';
      case 'LATENIGHT': return '야식';
      default: return '기타';
    }
  });

  // 메시지 결정 로직
  let message = "규칙적으로 세끼 식사를 하는게 좋아요!";
  if (weeklyEatingTypeCounts['LATENIGHT'] <= 1 &&
      weeklyEatingTypeCounts['BREAKFAST'] >= 5 &&
      weeklyEatingTypeCounts['LUNCH'] >= 5 &&
      weeklyEatingTypeCounts['DINNER'] >= 5) {
    message = "식사를 규칙적으로 잘 하고 있네요!";
  }

  const getColor = (type) => {
    const colors = {
      SNACK: '#696A73',
      BREAKFAST: '#FFF0BD',
      LUNCH: '#FFE589',
      DINNER: '#FFCF24',
      LATENIGHT: '#696A73'
    };
    return colors[type];
  };

  // 각 식사별 색상 배열 생성
  const backgroundColors = Object.keys(weeklyEatingTypeCounts).map(type => getColor(type));

  const data = {
    labels: eatingTypeLabels,
    datasets: [
      {
        data: eatingTypeCounts,
        backgroundColor: backgroundColors, // 색상 배열 사용
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
  };

  return (
    <div className='weekly-report'>
      <div className='weekly-report-title-container'>
        <div className='weekly-report-title'>주간 리포트
          <span className='weekly-report-date'>({startDate} - {endDate})</span>
        </div>
      </div>
      <div className='weekly-report-chart-container'>
        <Pie data={data} options={options} />
      </div>
      <div className='weekly-report-message-container'>
        <div className='weekly-report-message'>
          {message}
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;