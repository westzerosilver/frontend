import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../pages/MealGuide/meal-guide.css';

const MealGuide = () => {
    const [timeLeft, setTimeLeft] = useState(1800); // 30분
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
  
    const [date, setDate] = useState(() => {
        const storedDate = localStorage.getItem('selectedDate');
        console.log('로컬 스토리지에서 가져온 날짜:', storedDate); // 로컬 스토리지에서 날짜 확인
        return storedDate ? new Date(storedDate) : new Date();
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime > 0) return prevTime - 1;
                clearInterval(timer);
                return 0;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const handleStopMeal = () => {
        if (timeLeft > 0) {
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleFinishMeal = () => {
        const mealEndTime = new Date().toISOString();
        localStorage.setItem('mealEndTime', mealEndTime);
        localStorage.setItem('selectedDate', date.toISOString()); // 날짜를 로컬 스토리지에 저장

        setShowModal(false);
        navigate('/meal-end');
    };
    
    return (
        <div className="meal-guide-container">
            <div className="meal-guide-date">
                {date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
            <div className="timer">{formatTime(timeLeft)}</div>
            <div className="character-container">
                <div className="yellow-background" style={{ height: `${(timeLeft / 1800) * 100}%` }}></div>
                <div className="character"></div>
            </div>
            <div className="recommendation">최소 30분 이상 식사를 권장해요!</div>
            <button className="stop-meal-button" onClick={handleStopMeal}>식사 중단하기</button>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p className="bold">너무 빨라요!</p>
                        <p>급한 상황이 아니라면<br/>천천히 식사를 즐겨보세요.</p>
                        <div className="button-container">
                            <button onClick={closeModal}>취소</button>
                            <button onClick={handleFinishMeal}>식사 마치기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealGuide;
