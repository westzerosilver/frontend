import React, { useState, useEffect } from 'react';
import './PositiveMealAnalysis.css';
import axios from 'axios';
import ic_arrow from '../../assets/icon-arrow.png';
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

const typeKoreanMap = {
  BREAKFAST: '아침',
  LUNCH: '점심',
  DINNER: '저녁',
  LATENIGHT: '야식',
  SNACK: '간식'
};

const whereKoreanMap = {
  HOME: '집',
  WORK: '직장',
  RESTAURANT: '식당',
  SCHOOL: '학교',
  OTHER: '기타'
};

const withKoreanMap = {
  ALONE: '혼자',
  FRIEND: '친구',
  PARTNER: '연인',
  COLLEAGUE: '직장동료',
  OTHER: '기타'
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

  // const handleButtonClick = () => {
  //   window.location.href = 'https://www.eatingresearch.kr/diagnosis/diagnosis.asp';
  // };

  if (error) {
    return <div>{error}</div>;
  }

  if (!mealData) {
    return <div>로딩 중...</div>;
  }

  const { highestScoreAfterfeelingEatingType, highestScoreAfterfeelingEatingWith, highestScoreAfterfeelingEatingWhere, highestScoreAfterfeelingMenuName, highestScoreAfterfeeling } = mealData;


  return (
    <>
      <div className='positive-meal-container'>
        <div className='positive-meal-header'>
          가장 긍정적으로 식사를 마친 날의 식사 일기 분석이에요!
        </div>
        <div className='tags-and-emotion-container'>
          <div className='tags-container'>
          <div className='tag'>{typeKoreanMap[highestScoreAfterfeelingEatingType] || '식사 유형'}</div>
            <div className='tag'>{whereKoreanMap[highestScoreAfterfeelingEatingWhere] || '장소'}</div>
            <div className='tag'>{withKoreanMap[highestScoreAfterfeelingEatingWith] || '동반자'}</div>
            <div className='tag'>{highestScoreAfterfeelingMenuName || '메뉴명'}</div>
          </div>
          <div className='emotion-container'>
            <div className='emotion-tag'>
              감정 :
              <img src={emotionIcons[highestScoreAfterfeeling] || emotion1} alt='emotion' className='emotion' />
              <span className='emotion-text'>{emotionToKorean[highestScoreAfterfeeling] || '감정 없음'}</span>
            </div>
          </div>
        </div>
      </div>
      {/* <div className='self-diagnosis-container'>
        <div className='self-diagnosis-button' onClick={handleButtonClick}>
          자가진단 하러 가기
          <img src={ic_arrow} alt='self-diagnosis' className='self-diagnosis-img'></img>
        </div>
      </div> */}
    </>
  );
};

export default PositiveMealAnalysis;