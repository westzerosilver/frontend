import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BingeEatingAnalysis.css';
import emotion1 from '../../assets/icon-mood-smile.png';
import emotion2 from '../../assets/icon-mood-happy.png';
import emotion3 from '../../assets/icon-mood-empty-2.png'; 
import emotion4 from '../../assets/icon-mood-sad.png'; 
import emotion5 from '../../assets/icon-mood-angry.png'; 
import emotion6 from '../../assets/icon-mood-wrrr.png'; 
import emotion7 from '../../assets/icon-mood-confuzed.png'; 

const emotionIcons = {
  HAPPY: emotion2,    // 즐거움
  EASY: emotion1,     // 편안함
  EMPTY: emotion3,    // 무난함
  SAD: emotion4,      // 외로움
  ANGRY: emotion5,    // 짜증남
  WRRR: emotion6,     // 불안함
  CONFUZED: emotion7, // 죄책감
};

const BingeEatingAnalysis = () => {
  const [top3BingeFeelings, setTop3BingeFeelings] = useState({});
  const [top3BingeAfterFeelings, setTop3BingeAfterFeelings] = useState({});
  const [averageBingeEatingTime, setAverageBingeEatingTime] = useState('');
  const [bingeEatingTimes, setBingeEatingTimes] = useState({
    SNACK: 0,
    BREAKFAST: 0,
    LUNCH: 0,
    DINNER: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
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
          const data = response.data;
          setTop3BingeFeelings(data.top3BingeFeelings);
          setTop3BingeAfterFeelings(data.top3BingeAfterFeelings);
          setAverageBingeEatingTime(data.averageBingeEatingTime);
          setBingeEatingTimes(data.bingeEatingTypeCounts || {});
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

  // 감정 이름을 한글로 변환
  const emotionToKorean = {
    EASY: '편안함',
    HAPPY: '즐거움',
    EMPTY: '무난함',
    SAD: '외로움',
    ANGRY: '짜증남',
    WRRR: '불안함',
    CONFUZED: '죄책감'
  };

  const getTopEmotion = (emotions) => {
    const sortedEmotions = Object.entries(emotions).sort((a, b) => b[1] - a[1]);
    if (sortedEmotions.length > 0) {
      const topEmotion = sortedEmotions[0][0];
      return emotionToKorean[topEmotion] || topEmotion;
    }
    return '감정 없음';
  };

  const totalBingeEating = Object.values(bingeEatingTimes).reduce((sum, count) => sum + count, 0);

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
            {Object.entries(top3BingeFeelings).map(([emotion, count], index) => (
              <li className='meal-item' key={emotion}>
                <span className='number'>{index + 1}</span>
                <img src={emotionIcons[emotion]} alt={`emotion${index + 1}`} className='emotion' />
                <span className='count'>{count}회</span>
              </li>
            ))}
          </ul>
          <p className='meal-comment'>주로 {getTopEmotion(top3BingeFeelings)}을 느꼈어요!</p>
        </div>
        
        <div className='meal-box'>
          <h3 className='meal-title'>식사 후</h3>
          <ul className='meal-list'>
            {Object.entries(top3BingeAfterFeelings).map(([emotion, count], index) => (
              <li className='meal-item' key={emotion}>
                <span className='number'>{index + 1}</span>
                <img src={emotionIcons[emotion]} alt={`emotion${index + 1}`} className='emotion' />
                <span className='count'>{count}회</span>
              </li>
            ))}
          </ul>
          <p className='meal-comment'>주로 {getTopEmotion(top3BingeAfterFeelings)}을 느꼈어요!</p>
        </div>
      </div>

      <div className='time-eating-analysis'>
        <div className='time-eating-container'>
          <p className='time-eating-title'>주로 {averageBingeEatingTime}에 폭식을 했어요</p>
          <div className='time-eating-bar'>
            <div className='time-eating-segment' style={{ width: `${calculatePercentage(bingeEatingTimes.SNACK)}%`, backgroundColor: '#696A73' }}></div>
            <div className='time-eating-segment' style={{ width: `${calculatePercentage(bingeEatingTimes.DINNER)}%`, backgroundColor: '#FFCF24' }}></div>
            <div className='time-eating-segment' style={{ width: `${calculatePercentage(bingeEatingTimes.LUNCH)}%`, backgroundColor: '#FFE589' }}></div>
            <div className='time-eating-segment' style={{ width: `${calculatePercentage(bingeEatingTimes.BREAKFAST)}%`, backgroundColor: '#FFD700' }}></div>
          </div>
          <div className='time-eating-labels'>
            <div className='time-eating-label'>
              <div className='time-eating-dot' style={{ backgroundColor: '#696A73' }}></div>
              야식
            </div>
            <div className='time-eating-label'>
              <div className='time-eating-dot' style={{ backgroundColor: '#FFCF24' }}></div>
              저녁
            </div>
            <div className='time-eating-label'>
              <div className='time-eating-dot' style={{ backgroundColor: '#FFE589' }}></div>
              점심
            </div>
            <div className='time-eating-label'>
              <div className='time-eating-dot' style={{ backgroundColor: '#FFD700' }}></div>
              아침
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BingeEatingAnalysis;