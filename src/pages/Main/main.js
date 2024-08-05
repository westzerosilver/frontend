import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment';
import 'moment/locale/ko'; // 한국어 로케일 가져오기
import axios from 'axios';
import '../../pages/Main/main.css';

moment.locale('ko'); // 한국어 로케일 설정

const mealTypes = {
  BREAKFAST: '아침식사',
  LUNCH: '점심식사',
  DINNER: '저녁식사',
  SNACK: '간식',
  LATENIGHT: '야식'
};

function MainApp() {
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [mealDetails, setMealDetails] = useState(null); // 식사 상세 정보를 저장할 상태
  const navigate = useNavigate();

  // 사용자 이름 가져오기
  const name = localStorage.getItem('name') || '사용자';

  // 토큰 유효성 검사 및 식사 기록 가져오기
  useEffect(() => {
    
    const fetchMeals = async () => {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
        console.log('식사 기록 가져오기 날짜:', formattedDate);

        const response = await axios.get(`/api/fooddiaries/${formattedDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        setMeals(response.data);
      } catch (err) {
        console.error('API 요청 중 오류 발생:', err.response?.data || err.message);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('jwtToken');
          navigate('/login');
        }
      }
    };

    fetchMeals();
  }, [selectedDate, navigate]);

  const fetchMealDetails = async (date, foodDiaryId) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }
  
    const formattedDate = moment(date).format('YYYY-MM-DD');
    try {
      const response = await axios.get(`/api/fooddiaries/detail/${formattedDate}/${foodDiaryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      console.log('Full response object:', response); // 전체 응답 객체 로그
      console.log('Response data:', response.data); // 데이터 로그
  
      setMealDetails(response.data);
      navigate('/combined-meal-report', { state: { mealDetails: response.data } });
    } catch (err) {
      if (err.response) {
        console.error('API 요청 중 오류 발생:', err.response.data);
      } else {
        console.error('API 요청 중 오류 발생:', err.message);
      }
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('jwtToken');
        navigate('/login');
      }
    }
  };
  

  const handleViewChange = (event) => {
    setView(event.target.value);
  };

  // 식사 기록 클릭 시 상세 정보 가져오기
  const handleButtonClick = (page, foodDiaryId) => {
    if (foodDiaryId) {
      fetchMealDetails(foodDiaryId); // 식사 기록 ID만 넘겨줍니다
    } else {
      navigate(`/${page}`, { state: { selectedDate } });
    }
  };

  const handleNextWeek = () => {
    const nextWeek = moment(date).add(1, 'week').toDate();
    setDate(nextWeek);
    setSelectedDate(nextWeek);
  };

  const handlePrevWeek = () => {
    const prevWeek = moment(date).subtract(1, 'week').toDate();
    setDate(prevWeek);
    setSelectedDate(prevWeek);
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    const startOfWeek = moment(day).startOf('isoWeek').toDate();
    setDate(startOfWeek);
  };

  const startOfWeek = moment(date).startOf('isoWeek').toDate();
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    daysOfWeek.push(moment(startOfWeek).add(i, 'days').toDate());
  }

  useEffect(() => {
    if (view === 'month') {
      setDate(selectedDate);
    }
  }, [selectedDate, view]);

  const formatTime = (time) => {
    const momentTime = moment(time);
    if (!momentTime.isValid()) {
      return null; // Invalid Date일 경우 null 반환
    }
    const formattedTime = momentTime.format('A hh:mm'); // 오전/오후 및 시간 포맷
    return formattedTime.replace('AM', '오전').replace('PM', '오후'); // 한국어로 변환
  };

  const renderMealReports = () => {
    console.log('식사 기록:', meals); // meals 값 확인
    
    return meals.map(meal => {
      const formattedTimeKR = formatTime(meal.time); // 시간 포맷 변경
      const formattedEndTimeKR = formatTime(meal.endTime); // 식사 종료 시간 포맷 변경
  
      return (
        <div 
          className="MealReport" 
          onClick={() => handleButtonClick('meal-report', meal.foodDiaryId)} 
          key={meal.foodDiaryId}
        >
          <div className="meal-header">
            <div className="meal-title">
              <span className={`meal-icon ${meal.eatingType}`} />
              {mealTypes[meal.eatingType]}
            </div>
            {formattedTimeKR && <div className="meal-time">{formattedTimeKR}</div>}
            {formattedEndTimeKR && <div className="meal-end-time">{formattedEndTimeKR}</div>}
          </div>
          <div className="meal-content">
            <div className="meal-status">
              <span className={`meal-emoji meal-emoji-before ${meal.feeling}`} />
              <span className={`meal-emoji meal-emoji-after ${meal.afterFeeling}`} />
            </div>
            <div className="meal-description">
              {meal.menuName}
              {meal.symptoms && meal.symptoms.length > 0 && (
                <button className="meal-toast-button">
                  {meal.symptoms.join(', ')}
                </button>
              )}
            </div>
          </div>
          <div className="meal-label-group">
            <span className="meal-label">식사 전</span>
            <span className="meal-label">식사 후</span>
          </div>
        </div>
      );
    });
  };

  const handleStartMeal = () => {
    navigate('/meal-record', { state: { selectedDate, initialTime: new Date() } });
  };

  return (
    <div className="main-container">
      <div>
        <div className="header">
          <div className="title">데일리 식사 일기</div>
          <div className="icons">
            <div className="icon user-icon" onClick={() => handleButtonClick('mypage')} />
            <div className="icon settings-icon" onClick={() => handleButtonClick('settings')} />
          </div>
        </div>
        <div className="calendar-container">
          <div className="calendar-header">
            <span>{moment(selectedDate).format('YYYY년 M월 D일 dddd')}</span>
            <select value={view} onChange={handleViewChange}>
              <option value="week">주간</option>
              <option value="month">월간</option>
            </select>
          </div>
          {view === 'month' ? (
            <div className="month-calendar">
              <Calendar
                onChange={(newDate) => {
                  setDate(newDate);
                  setSelectedDate(newDate);
                }}
                value={date}
                showNeighboringMonth
                formatDay={(locale, date) => moment(date).format('D')}
                tileClassName={({ date }) => {
                  if (moment(date).isSame(selectedDate, 'day')) {
                    return 'selected-date';
                  }
                }}
              />
            </div>
          ) : (
            <div className="week-calendar">
              <div className="navigation">
                <button onClick={handlePrevWeek}>{'‹'}</button>
                <div>{moment(date).format('YYYY년 M월')}</div>
                <button onClick={handleNextWeek}>{'›'}</button>
              </div>
              <div className="week-header">
                {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                  <div key={index} className="react-calendar__month-view__weekdays__weekday">
                    <abbr>{day}</abbr>
                  </div>
                ))}
              </div>
              <div className="week-days">
                {daysOfWeek.map(day => (
                  <div
                    key={moment(day).format('YYYY-MM-DD')} // key 속성 추가
                    className={`day-cell ${moment(day).isSame(selectedDate, 'day') ? 'selected' : ''}`}
                    onClick={() => handleDayClick(day)}
                  >
                    {day.getDate()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="daily-quiz">
          <div className='meal-guide'>안녕하세요, {name}님~
            <br />
            오늘의 나에게 칭찬할 점을 남겨주세요!</div>
          <button
            className="quiz-button"
            onClick={() => handleButtonClick('praisemyself')}>
          </button>
        </div>

        {renderMealReports()}

        <div className="record-button-container">
          <button
            className="record-button"
            onClick={handleStartMeal}>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainApp;