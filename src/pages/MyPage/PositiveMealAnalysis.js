import React, { useState, useEffect } from 'react';
import './PositiveMealAnalysis.css';
import axios from 'axios';
import ic_arrow from '../../assets/icon-arrow.png';
import emotion1 from '../../assets/icon-mood-smile-2.png';
import emotion2 from '../../assets/icon-mood-happy.png';
import emotion3 from '../../assets/icon-mood-empty.png';
import emotion4 from '../../assets/icon-mood-sad.png';
import emotion5 from '../../assets/icon-mood-angry.png';
import emotion6 from '../../assets/icon-mood-wrrr.png';
import emotion7 from '../../assets/icon-mood-confuzed.png';

const emotionIcons = {
  HAPPY: emotion2,
  EASY: emotion1,
  EMPTY: emotion3,
  SAD: emotion4,
  ANGRY: emotion5,
  WRRR: emotion6,
  CONFUZED: emotion7,
};

const PositiveMealAnalysis = () => {
  const [mealData, setMealData] = useState(null);
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
          setMealData(data);
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

  const handleButtonClick = () => {
    window.location.href = 'https://www.eatingresearch.kr/diagnosis/diagnosis.asp';
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!mealData) {
    return <div>로딩 중...</div>;
  }

  const { highestScoreAfterfeelingEatingType, highestScoreAfterfeelingEatingWith, highestScoreAfterfeelingEatingWhere, highestScoreAfterfeelingMenuName, highestScoreAfterfeeling } = mealData;

  const emotionKoreanMap = {
    HAPPY: '즐거움',
    EASY: '편안함',
    EMPTY: '무난함',
    SAD: '외로움',
    ANGRY: '짜증남',
    WRRR: '불안함',
    CONFUZED: '죄책감'
  };

  return (
    <>
      <div className='positive-meal-container'>
        <div className='positive-meal-header'>
          가장 긍정적으로 식사를 마친 날의 식사 일기 분석이에요!
        </div>
        <div className='tags-and-emotion-container'>
          <div className='tags-container'>
            <div className='tag'>{highestScoreAfterfeelingEatingType || '식사 유형'}</div>
            <div className='tag'>{highestScoreAfterfeelingEatingWhere || '장소'}</div>
            <div className='tag'>{highestScoreAfterfeelingEatingWith || '동반자'}</div>
            <div className='tag'>{highestScoreAfterfeelingMenuName || '메뉴명'}</div>
          </div>
          <div className='emotion-container'>
            <div className='emotion-tag'>
              감정 :
              <img src={emotionIcons[highestScoreAfterfeeling] || emotion1} alt='emotion' className='emotion' />
              <span className='emotion-text'>{emotionKoreanMap[highestScoreAfterfeeling] || '감정 없음'}</span>
            </div>
          </div>
        </div>
      </div>
      <div className='self-diagnosis-container'>
        <div className='self-diagnosis-button' onClick={handleButtonClick}>
          자가진단 하러 가기
          <img src={ic_arrow} alt='self-diagnosis' className='self-diagnosis-img'></img>
        </div>
      </div>
    </>
  );
};

export default PositiveMealAnalysis;