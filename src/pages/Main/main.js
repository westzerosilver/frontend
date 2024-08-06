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

const symptoms = {
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

// 증상 코드를 한국어로 변환하는 함수
const translateSymptoms = (symptomsArray) => {
  return symptomsArray.map(symptom => symptoms[symptom] || symptom);
};

function MainApp() {
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [mealDetails, setMealDetails] = useState(null); // 식사 상세 정보를 저장할 상태
  const [userName, setUserName] = useState('사용자'); // 사용자 이름 상태 추가
  const [isTodayRecorded, setIsTodayRecorded] = useState(false); // 오늘 날짜에 기록된 데이터가 있는지
  const navigate = useNavigate();

  const fetchUserInfo = async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }
  
    try {
      const response = await axios.get('/api/main', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      setUserName(response.data.name); // 사용자 이름 상태 업데이트
  
      const today = moment().format('YYYY-MM-DD');
      setIsTodayRecorded(response.data.date === today); // 오늘 날짜랑 비교해서 칭찬 일기 기록 상태 업데이트
    } catch (error) {
      console.error('사용자 정보를 가져오는 중 오류 발생:', error.message);
      navigate('/login');
    }
  };
  

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

        console.log('식사 시작하기에 저장된 값 : ', response.data);

        // 식사 끝내기에 저장된 정보를 포함 시키는 코드
        const mealsWithDetails = await Promise.all(response.data.map(async (meal) => {
          try {
            const detailResponse = await axios.get(`/api/fooddiaries/detail/${formattedDate}/${meal.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('식사 시작하기 + 식사 끝내기:', detailResponse.data); // detailResponse 출력

            return {
              ...meal,
              afterFeeling: detailResponse.data.afterFeeling,
              symptoms: translateSymptoms(detailResponse.data.symptoms) // 증상 변환 적용
            };
          } catch (error) {
            console.error('상세 정보 요청 중 오류 발생:', error.response?.data || error.message);
            return meal;
          }
        }));

        setMeals(mealsWithDetails); // 추가된 `afterFeeling`과 `symptoms`가 포함된 식사 기록 상태로 설정
      } catch (err) {
        console.error('API 요청 중 오류 발생:', err.response?.data || err.message);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('jwtToken');
          navigate('/login');
        }
      }
    };

    fetchMeals();
    fetchUserInfo();
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

      const data = response.data;

      // 필요한 데이터만 추출하여 상태 설정
      setMealDetails({
        foodDiaryId: data.foodDiaryId,
        feeling: data.feeling,
        menuName: data.menuName,
        afterFeeling: data.afterFeeling,
        symptoms: translateSymptoms(data.symptoms) // 증상 변환 적용
      });

      navigate('/combined-meal-report', { state: { mealDetails: data } });
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

  const handleButtonClick = (foodDiaryId) => {
    const routes = ['mypage', 'settings', 'praisemyself'];
  
    if (routes.includes(foodDiaryId)) {
      navigate(`/${foodDiaryId}`);
    } else {
      navigate(`/meal-report/${foodDiaryId}`);
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
    localStorage.setItem('selectedDate', moment(day).format('YYYY-MM-DD')); // 날짜 클릭시 로컬에 반영
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
    // meals가 배열인지 확인
    if (!Array.isArray(meals)) {
      console.error('meals가 배열이 아닙니다:', meals);
      return null; // 또는 빈 배열 반환
    }
  
    return meals.map(meal => {
      const formattedTimeKR = formatTime(meal.time); // 시간 포맷 변경
      const formattedEndTimeKR = formatTime(meal.endTime); // 식사 종료 시간 포맷 변경
      const symptomsInKorean = translateSymptoms(meal.symptoms || []); // symptoms가 undefined일 때 빈 배열로 처리
  
      return (
        <div 
          className="MealReport" 
          onClick={() => handleButtonClick(meal.id)} // foodDiaryId를 meal.id로 변경
          key={meal.id} // foodDiaryId를 meal.id로 변경
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
              {symptomsInKorean.length > 0 && (
                <div className="meal-symptoms">
                  {symptomsInKorean.map((symptom, index) => (
                    <button key={index} className="meal-toast-button">
                      {symptom}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="meal-label-group">
            <span className="meal-label-before">식사 전</span>
            <span className="meal-label-after">식사 후</span>
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

      <div className="daily-praise">
        <div className='meal-guide'>
          {isTodayRecorded 
            ? <p>지금 기분은 어떤가요? <br /> 매일 나에게 칭찬을 하며 더욱 아껴주세요!</p>
            : <p>안녕하세요, {userName}님~ <br /> 오늘의 나에게 칭찬할 점을 남겨주세요!</p>}
        </div>
        <button
          className={`quiz-button ${isTodayRecorded ? 'completed' : ''}`}
          onClick={() => handleButtonClick('praisemyself')}
          disabled={isTodayRecorded} // 기록이 있으면 버튼 비활성화
        >
          {isTodayRecorded ? '완료!' : '칭찬하러 가기'}
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