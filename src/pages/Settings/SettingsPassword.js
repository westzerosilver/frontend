import React, { useState } from 'react';
import axios from 'axios';
import './SettingsPassword.css';
import ic_back from '../../assets/icon-back.png';

const SettingsPassword = () => {
  const [step, setStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNextStep = async () => {
    if (step === 1) {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          alert('로그인이 필요합니다.');
          return;
        }

        // 현재 비밀번호 확인 요청
        const response = await axios.post('/api/members/checkPassword', 
          { oldPassword: currentPassword },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 200) {
          setStep(2);
        } else {
          alert('비밀번호 확인에 실패했습니다.');
        }
      } catch (error) {
        console.error('비밀번호 확인 중 오류 발생:', error);
        alert('비밀번호 확인 중 오류가 발생했습니다.');
      }
    } else if (step === 2) {
      try {
        if (newPassword !== confirmPassword) {
          alert('비밀번호가 서로 일치하지 않습니다.');
          return;
        }

        const token = localStorage.getItem('jwtToken');
        if (!token) {
          alert('로그인이 필요합니다.');
          return;
        }

        // 비밀번호 변경 요청
        const response = await axios.put('/api/members/updatePassword',
          { password: newPassword, confirmPassword },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 200) {
          setStep(3);
        } else {
          alert('비밀번호 변경에 실패했습니다.');
        }
      } catch (error) {
        console.error('비밀번호 변경 중 오류 발생:', error);
        alert('비밀번호 변경 중 오류가 발생했습니다.');
      }
    } else if (step === 3) {
      // 로그아웃 처리 후 로그인 페이지로 이동
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <input
              type='password'
              placeholder="현재 비밀번호를 입력하세요."
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className='password-input'
            />
            <button onClick={handleNextStep} className='password-btn'>
              비밀번호 확인
            </button>
          </>
        );
      case 2:
        return (
          <>
            <input
              type='password'
              placeholder='새로운 비밀번호를 입력하세요.'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className='password-input'
            />
            <input
              type='password'
              placeholder='새로운 비밀번호 확인.'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='password-input'
            />
            <button onClick={handleNextStep} className='password-btn'>
              비밀번호 바꾸기
            </button>
          </>
        );
      case 3:
        return (
          <>
            <div className='password-completion-title'>
              비밀번호 설정 완료!
              <div className='password-completion'>
                자동으로 로그아웃 됩니다. 
                <br />
                새로운 비밀번호로 재로그인 해주세요!
              </div>
            </div>
            <button onClick={handleNextStep} className='password-btn'>
              로그인 하기
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className='settings-password-container'>
      <div className='settings-password-header'>
        <img src={ic_back} alt='back' className='back-icon' onClick={() => window.history.back()} />
        <div className='settings-password-title'>비밀번호 설정</div>
      </div>
      <div className='settings-password-content'>
        {renderStep()}
      </div>
    </div>
  );
};

export default SettingsPassword;