import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Settings.css';
import ic_back from '../../assets/icon-back.png';

const Settings = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await axios.delete('/api/members/delete', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        alert('계정이 성공적으로 삭제되었습니다.');
        localStorage.removeItem('jwtToken'); // JWT 토큰 삭제
        navigate('/login'); // 로그인 페이지로 리디렉션
      } else {
        alert('계정 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('계정 삭제 중 오류 발생:', error);
      alert('계정 삭제 중 오류가 발생했습니다.');
    } finally {
      setShowPopup(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await axios.post('/api/members/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.status === 200) {
        localStorage.removeItem('jwtToken'); // JWT 토큰 삭제
        navigate('/login'); // 로그인 페이지로 리디렉션
      } else {
        alert('로그아웃에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className='settings-container'>
      <header className='settings-header'>
        <img src={ic_back} alt='back' className='back-icon' onClick={() => window.history.back()} />
        <div className='settings-title'>설정</div>
      </header>
      <div className='settings-content'>
        <Link to='/settings/profile' className='settings-link' style={{ textDecoration: 'none'}}>
          <div className='settings-password'>프로필 설정</div>
        </Link>
        <Link to='/settings/password' className='settings-link' style={{ textDecoration: 'none'}}>
          <div className='settings-password'>비밀번호 설정</div>
        </Link>
        <div className='settings-logout' onClick={handleLogout}>로그아웃</div>
        <div className='settings-delete' onClick={handleDeleteAccount}>계정 삭제하기</div>
      </div>
      {showPopup && (
        <div className='popup'>
          <div className='popup-inner'>
            <p className='popup-title'>계정 삭제하기</p>
            <p className='popup-detail'>정말로 계정을 삭제하시겠습니까?
            <br />계정 복구는 불가능합니다.</p>
            <button className='cancel-btn' onClick={handleClosePopup}>취소</button>
            <button className='delete-btn' onClick={handleConfirmDelete}>삭제</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;