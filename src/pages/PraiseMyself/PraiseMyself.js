import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PraiseMyself.css';

const guide = [
  "오늘 나에게 바뀐 점이 있나요?",
  "바뀐 점들 중 어떤 점이 가장 마음에 드나요?",
  "그 점을 이용하여 나에게 칭찬을 \n남겨주세요."
];

const keywords = ['살', '비만', '마른', '모공', '여드름', '턱선', '볼살', '허리선', '종아리', '체형', '쌍커풀', '쌍꺼풀', '쌍카풀', '이중턱', '턱살',
  '체지방', '팔뚝', '목선', '쇄골', '골반', '주름', '직각어깨', '콧대', '턱라인', '팔라인', '다리라인', '중안부', '코끝', '콧볼',
  '마른', '오똑', '날씬', '잘록', '굵은', '통통', '얇은', '작은', '칙칙', '짧은', '창백', '못생', '얼굴이 작', '비율이 좋', '비율이 안', '비율이 이상'];

const PraiseMyself = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    const currentAnswer = answers[step];
    const containsKeyword = keywords.some(keyword => currentAnswer.includes(keyword));

    if (currentAnswer.trim() === '') {
      setError('답변을 입력해주세요!');
    } else if (containsKeyword) {
      setError('직접적인 외모 언급보다는 변화된 것이 무엇인지에 집중해보세요!');
    } else {
      setError('');
      if (step < guide.length - 1) {
        setStep(step + 1);
      } else {
        setStep(step + 1); // 답변 요약 페이지
      }
    }
  };

  const handleChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[step] = e.target.value;
    setAnswers(newAnswers);
    setError('');
  };

  const submitCompliments = async () => {
    const compliments = {
      compliment1: answers[0],
      compliment2: answers[1],
      compliment3: answers[2],
      compliment4: answers[3] || "" 
    };

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setApiError('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/compliments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(compliments)
      });

      if (response.ok) {
        alert('칭찬 일기가 성공적으로 저장되었습니다!');
        navigate('/main');
      } else if (response.status === 500) {
        setApiError('이미 오늘의 칭찬 일기를 작성했어요.');
      } else {
        const errorData = await response.json();
        setApiError(errorData.message || '칭찬 일기 저장에 실패했습니다.');
      }
    } catch (error) {
      setApiError('네트워크 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  return (
    <div className='praisemyself-container'>
      {step < guide.length ? (
        <>
          <div className='guide'>
            {guide[step].split('\n').map((line, index) => (
              <p key={index} className='guide-line'>{line}</p>
            ))}
          </div>
          <input
            type='text'
            placeholder='내 답변 입력'
            value={answers[step]}
            onChange={handleChange}
            className={`answer-input ${error ? 'error-input' : ''}`}
          />
          {error && <p className='error-message'>{error}</p>}
          {apiError && <p className='error-message'>{apiError}</p>}
          <button onClick={handleNext} className='guide-next-btn'>
            다음으로
          </button>
        </>
      ) : (
        <div className='summary'>
          <div className='summary-title'>오늘 나에게 칭찬한 점이에요!</div>
          <div className='answers'>
            {answers.map((answer, index) => (
              <p key={index} className='answer-summary'>{answer}</p>
            ))}
          </div>
          <button className='guide-next-btn' onClick={submitCompliments}>
            오늘의 칭찬 완료
          </button>
        </div>
      )}
    </div>
  );
};

export default PraiseMyself;