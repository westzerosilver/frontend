import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import '../../pages/MealRecord/meal-record.css';

const emotions = {
    COMFORTABLE: { text: '편안해요' },
    HAPPY: { text: '즐거워요' },
    EASY: { text: '무난해요' },
    GUILT: { text: '죄책감들어요' },
    IRRITATE: { text: '짜증나요' },
    ANXIOUS: { text: '불안해요' },
    LONELY: { text: '외로워요' }
};

const formatDate = (date) => {
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
};

const MealRecord = () => {
    const location = useLocation();
    const { state } = location;
    const selectedDate = state?.selectedDate;
    const navigate = useNavigate();

    const [eatingType, setEatingType] = useState(null);
    const [eatingWith, setEatingWith] = useState(null);
    const [eatingWhere, setEatingWhere] = useState(null);
    const [photoFile, setPhotoFile] = useState(null); // 이미지 파일 저장
    const [photoUrl, setPhotoUrl] = useState(null); // 이미지 URL 저장
    const [feeling, setFeeling] = useState(null);
    const [menuName, setMenuName] = useState('');
    const [otherWho, setOtherWho] = useState('');
    const [otherWhere, setOtherWhere] = useState('');
    const [date, setDate] = useState(() => {
        return selectedDate ? new Date(selectedDate) : new Date();
    });
    const [time, setTime] = useState('20:00');

    useEffect(() => {
        if (selectedDate) {
            setDate(new Date(selectedDate));
        }
    }, [selectedDate]);

    const handleOptionClick = (optionType, value) => {
        switch (optionType) {
            case 'eatingType':
                setEatingType(value.toUpperCase());
                break;
            case 'eatingWith':
                setEatingWith(value.toUpperCase());
                break;
            case 'eatingWhere':
                setEatingWhere(value.toUpperCase());
                break;
            default:
                break;
        }
    };

    const startMeal = async () => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.error('토큰이 없습니다');
            window.location.href = '/login';
            return;
        }

        const foodDiaryDto = {
            time: time,
            eatingType: eatingType,
            menuName: menuName,
            eatingWith: eatingWith,
            eatingWhere: eatingWhere,
            feeling: feeling,
        };

           // FormData 객체 생성
        const formData = new FormData();

        
        formData.append('foodDiaryDto', new Blob([JSON.stringify(foodDiaryDto)], { type: 'application/json' }));

         // 이미지 파일 추가
        if (photoFile) {
        formData.append('photoFile', photoFile);
    }

        try {
            const formattedDate = moment(date).format('YYYY-MM-DD');
            const response = await axios.post(`/api/fooddiaries/${formattedDate}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('식사 기록이 성공적으로 제출되었습니다:', response.data);

            const currentTime = new Date().toISOString();
            localStorage.setItem('mealStartTime', currentTime);
            localStorage.setItem('foodDiaryId', response.data.id);
            localStorage.setItem('selectedDate', date.toISOString()); // 날짜를 로컬 스토리지에 저장

            console.log('현재 시간 로컬 스토리지에 저장됨:', currentTime);
            console.log('FoodDiaryId 로컬 스토리지에 저장됨:', response.data.id);
            console.log('저장된 날짜:', localStorage.getItem('selectedDate')); // 저장된 날짜 확인

            navigate('/meal-guide');

        } catch (error) {
            console.error('식사 기록 제출 오류:', error);

            if (error.response) {
                console.error('응답 상태:', error.response.status);
                console.error('응답 데이터:', error.response.data);
                console.error('응답 헤더:', error.response.headers);

                if (error.response.status === 401) {
                    console.error('토큰이 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요.');
                    window.location.href = '/login';
                } else {
                    console.error('식사 기록 제출 오류:', error.response.data);
                }
            } else {
                console.error('식사 기록 제출 오류:', error.message);
            }
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setPhotoUrl(URL.createObjectURL(file));
            setPhotoFile(file); // 이미지 파일 설정
        }
    };

    const handleFeelingClick = (feeling) => {
        setFeeling(feeling.toUpperCase());
    };

    const handleMenuChange = (event) => {
        setMenuName(event.target.value);
    };

    const handleOtherInputChange = (event, type) => {
        if (type === 'eatingWith') {
            setOtherWho(event.target.value);
        } else if (type === 'eatingWhere') {
            setOtherWhere(event.target.value);
        }
    };

    const isFormComplete = () => {
        return eatingType && eatingWith && eatingWhere && feeling && menuName;
    };

    return (
        <div className="meal-record-container">
            <div className="header">
                <span className="date">
                    {formatDate(date)}
                </span>
                <div className="icons">
                    <div className="icon back-icon" onClick={() => navigate('/main')} />
                </div>
            </div>
            <form className="record-form">
                <div className="time-group">
                    <label className="time-label">시간</label>
                    <input 
                        type="time" 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)} 
                        className="time-input" 
                    />
                </div>
                <div className="meal-group">
                    <label>식사 종류</label>
                    <div className="options">
                        {['BREAKFAST', 'LUNCH', 'DINNER', 'LATENIGHT', 'SNACK'].map(mealType => (
                            <div
                                key={mealType}
                                className={`option ${eatingType === mealType ? 'active' : ''}`}
                                onClick={() => handleOptionClick('eatingType', mealType)}
                            >
                                {mealType === 'BREAKFAST' && '아침'}
                                {mealType === 'LUNCH' && '점심'}
                                {mealType === 'DINNER' && '저녁'}
                                {mealType === 'LATENIGHT' && '야식'}
                                {mealType === 'SNACK' && '간식'}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="menu-group">
                    <label>메뉴</label>
                    <textarea
                        placeholder="메뉴명을 입력하세요."
                        rows="2"
                        value={menuName}
                        onChange={handleMenuChange}
                    />
                    <input 
                        type="file" 
                        id="image-upload" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }} 
                    />
                    <label htmlFor="image-upload" className="upload-btn">
                        {photoUrl ? <img src={photoUrl} alt="Meal" className="uploaded-image" /> : <div className="upload-placeholder" />}
                    </label>

                </div>
                <div className="who-group">
                    <label>누구와 먹었나요?</label>
                    <div className="options">
                        {['ALONE', 'FRIEND', 'PARTNER', 'COLLEAGUE', 'OTHER'].map(who => (
                            <div
                                key={who}
                                className={`option ${eatingWith === who ? 'active' : ''}`}
                                onClick={() => handleOptionClick('eatingWith', who)}
                            >
                                {who === 'ALONE' && '혼자'}
                                {who === 'FRIEND' && '친구'}
                                {who === 'PARTNER' && '연인'}
                                {who === 'COLLEAGUE' && '직장동료'}
                                {who === 'OTHER' && '기타'}
                            </div>
                        ))}
                    </div>
                    {eatingWith === 'OTHER' && (
                        <input
                            type="text"
                            placeholder="입력"
                            className="other-input"
                            value={otherWho}
                            onChange={(e) => handleOtherInputChange(e, 'eatingWith')}
                        />
                    )}
                </div>
                <div className="where-group">
                    <label>어디에서 먹었나요?</label>
                    <div className="options">
                        {['HOME', 'RESTAURANT', 'SCHOOL', 'WORK', 'OTHER'].map(where => (
                            <div
                                key={where}
                                className={`option ${eatingWhere === where ? 'active' : ''}`}
                                onClick={() => handleOptionClick('eatingWhere', where)}
                            >
                                {where === 'HOME' && '집'}
                                {where === 'RESTAURANT' && '식당'}
                                {where === 'SCHOOL' && '학교'}
                                {where === 'WORK' && '직장'}
                                {where === 'OTHER' && '기타'}
                            </div>
                        ))}
                    </div>
                    {eatingWhere === 'OTHER' && (
                        <input
                            type="text"
                            placeholder="입력"
                            className="other-input"
                            value={otherWhere}
                            onChange={(e) => handleOtherInputChange(e, 'eatingWhere')}
                        />
                    )}
                </div>
                <div className="emotion-group">
                    <label>식사 전 기분은 어때요?</label>
                    <div className="meal-feelings">
                        {Object.keys(emotions).map(feelingKey => (
                            <div
                                key={feelingKey}
                                className={`feeling feeling-${feelingKey} ${feeling === feelingKey.toUpperCase() ? 'active' : ''}`}
                                onClick={() => handleFeelingClick(feelingKey)}
                            >
                                <span>{emotions[feelingKey].text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="start-meal">
                    <div className="start-label">자, 이제 식사 하러 가볼까요?</div>
                    <button
                        type="button"
                        onClick={startMeal}
                        className={`start-button ${isFormComplete() ? 'active' : ''}`}
                        disabled={!isFormComplete()}
                    >
                        식사 시작하기
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MealRecord;
