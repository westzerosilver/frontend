import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './UserInfo.css';
import ic_home from '../../assets/icon-home.png';
import ic_settings from '../../assets/icon-settings.png';
import line_grey from '../../assets/line.png';
import img_basic from '../../assets/Profile.png'; // 기본 이미지

const UserInfo = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
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
          setUserData(response.data);
        } else {
          setError('사용자 정보를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    };
  
    fetchUserData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <div>로딩 중...</div>;
  }


  // const profileImage = userData.profileImgPath || img_basic;
  
  // profileImgPath가 웹 경로인지 확인하고, 아닐 경우 웹 경로로 변환
  const profileImage = userData.profileImgPath 
  ? `http://localhost:8080${userData.profileImgPath}` 
  : img_basic;


  return (
    <div className='user-info-container'>
      <header className='header'>
        <div className='title'>MY</div>
        <div className='icons'>
          <Link to="/main">
            <img src={ic_home} alt='main' className='icon' />
          </Link>
          <Link to="/settings">
            <img src={ic_settings} alt='settings' className='icon' />
          </Link>
        </div>
      </header>
      <div className='user-info'>
        <div className='user-info-img'>
          <img src={profileImage} alt='user' className='user-img' />
        </div>
        <div className='user-detail'>
          <div className='user-name'>{userData.name} 님</div>
          <div className='user-days'>
            관리한지<span className='days-managed'>+{userData.daysSinceJoined}</span>일 째
          </div>
        </div>
      </div>
      <div className='completion-status-container'>
        <div className='completion-status'>
          <div className='status-item'>
            <div className='status-title'>식사관리완료</div>
            <div className='count'>{userData.totalFoodDiaryCount}회</div>
          </div>
          <img src={line_grey} alt='center-line' className='center-line' />
          <div className='status-item'>
            <div className='status-title'>칭찬 완료</div>
            <div className='count'>{userData.complimentCnt}회</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;