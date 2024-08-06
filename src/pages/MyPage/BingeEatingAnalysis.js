import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BingeEatingAnalysis.css';
// 감정별 점수대로 내림차순
import emotion7 from '../../assets/icon-mood-happy.png'; // 즐거움
import emotion6 from '../../assets/icon-mood-smile.png'; // 편안함
import emotion5 from '../../assets/icon-mood-empty.png'; // 무난함
import emotion4 from '../../assets/icon-mood-confuzed.png'; // 외로움
import emotion3 from '../../assets/icon-mood-angry.png'; // 짜증남
import emotion2 from '../../assets/icon-mood-wrrr.png'; // 불안함
import emotion1 from '../../assets/icon-mood-sad.png'; // 죄책감


const emotionIcons = {
  HAPPY: emotion7,
  COMFORTABLE: emotion6,
  EASY: emotion5,
  LONELY: emotion4,
  IRRITATE: emotion3,
  ANXIOUS: emotion2,
  GUILT: emotion1,
};

const emotionToKorean = {
  HAPPY: '즐거움',
  COMFORTABLE: '편안함',
  EASY: '무난함',
  LONELY: '외로움',
  IRRITATE: '짜증남',
  ANXIOUS: '불안함',
  GUILT: '죄책감'
};

const BingeEatingAnalysis = () => {
  const [top3BingeFeelings, setTop3BingeFeelings] = useState({});
  const [top3BingeAfterFeelings, setTop3BingeAfterFeelings] = useState({});
  const [averageBingeEatingTime, setAverageBingeEatingTime] = useState('');
  const [bingeEatingTypeCounts, setBingeEatingTypeCounts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          setError('로그인이 필요합니다.');
          return;
        }

        const response = await axios.get('http://localhost:8080/api/members/mypage', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.status === 200) {
          const data = response.data;
          setTop3BingeFeelings(data.top3BingeFeelings);
          setTop3BingeAfterFeelings(data.top3BingeAfterFeelings);
          setAverageBingeEatingTime(convertToHour(data.averageBingeEatingTime));
          const sortedBingeEatingTypeCounts = Object.entries(data.bingeEatingTypeCounts || {}).sort(([, a], [, b]) => b - a);
          setBingeEatingTypeCounts(sortedBingeEatingTypeCounts);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchData();
  }, []);

  const convertToHour = (timeString) => {
    const [hours] = timeString.split(':');
    return hours;
  };

  const getTopEmotion = (emotions) => {
    const sortedEmotions = Object.entries(emotions).sort((a, b) => b[1] - a[1]);
    if (sortedEmotions.length > 0) {
      const topEmotion = sortedEmotions[0][0];
      return emotionToKorean[topEmotion] || topEmotion;
    }
    return '감정 없음';
  };

  const totalBingeEating = bingeEatingTypeCounts.reduce((sum, [, count]) => sum + count, 0);

  const calculatePercentage = (count) => {
    if (totalBingeEating === 0) return 0;
    return (count / totalBingeEating) * 100;
  };

  return (
    <div className='binge-eating-analysis'>
      <div className='binge-eating-title'>폭식</div>
      
      <div className='meal-container'>
        <div className='meal-box'>
          <h3 className='meal-title'>식사 전</h3>
          <ul className='meal-list'>
            {Object.entries(top3BingeFeelings)
              .sort(([, countA], [, countB]) => countB - countA)
              .map(([emotion, count], index) => (
                <li className='meal-item' key={emotion}>
                  <p className={`number rank-${index + 1}`}>{index + 1}</p>
                  <img src={emotionIcons[emotion]} alt={`emotion${index + 1}`} className='emotion' />
                  <p className='count'>{count}회</p>
                </li>
            ))}
          </ul>
          <p className='meal-comment'>주로 {getTopEmotion(top3BingeFeelings)}을 느꼈어요!</p>
        </div>
        
        <div className='meal-box'>
          <h3 className='meal-title'>식사 후</h3>
          <ul className='meal-list'>
            {Object.entries(top3BingeAfterFeelings)
              .sort(([, countA], [, countB]) => countB - countA)
              .map(([emotion, count], index) => (
                <li className='meal-item' key={emotion}>
                  <p className={`number rank-${index + 1}`}>{index + 1}</p>
                  <img src={emotionIcons[emotion]} alt={`emotion${index + 1}`} className='emotion' />
                  <p className='count'>{count}회</p>
                </li>
            ))}
          </ul>
          <p className='meal-comment'>주로 {getTopEmotion(top3BingeAfterFeelings)}을 느꼈어요!</p>
        </div>
      </div>

      <div className='time-eating-analysis'>
        <div className='time-eating-container'>
          <p className='time-eating-title'>주로 {averageBingeEatingTime}시 시간대에 식사했을 때 폭식을 했어요</p>
          <div className='time-eating-bar'>
            {bingeEatingTypeCounts.map(([type, count]) => (
              <div 
                key={type} 
                className='time-eating-segment' 
                style={{ width: `${calculatePercentage(count)}%`, backgroundColor: getColor(type) }}
              ></div>
            ))}
          </div>
          <div className='time-eating-labels'>
            {bingeEatingTypeCounts.map(([type]) => (
              <div key={type} className='time-eating-label'>
                <div className='time-eating-dot' style={{ backgroundColor: getColor(type) }}></div>
                {getTypeLabel(type)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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

const getTypeLabel = (type) => {
  const labels = {
    SNACK: '간식',
    BREAKFAST: '아침',
    LUNCH: '점심',
    DINNER: '저녁',
    LATENIGHT: '야식'
  };
  return labels[type];
};

export default BingeEatingAnalysis;