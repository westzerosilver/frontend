import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SettingsProfile.css';
import ic_back from '../../assets/icon-back.png';
import ic_img from '../../assets/icon-edit-profile.png';
import img_basic from '../../assets/Profile.png';

const SettingsProfile = () => {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(img_basic); // 기본 이미지로 초기화
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [useBasicImage, setUseBasicImage] = useState(false);
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
          setName(response.data.name);
          setProfileImage(response.data.profileImgPath || img_basic);
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

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(URL.createObjectURL(e.target.files[0]));
      setProfileImageFile(e.target.files[0]);
      setUseBasicImage(false);
    }
  };

  // 기본 이미지로 변경
  const handleSetToDefault = () => {
    setProfileImage(img_basic);
    setProfileImageFile(null); // 파일 선택 해제
    setUseBasicImage(true); // 기본 이미지 사용 표시
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }
      
      // FormData 객체 생성
      const formData = new FormData();
      
      // 이름 변경, profileDto를 JSON 문자열로 추가해서 반영
      // formData.append('profileDto', new Blob([JSON.stringify({ name })], { type: 'application/json' }));
      formData.append('profileDto', new Blob([JSON.stringify({ name, profileImgPath: useBasicImage ? '' : undefined })], { type: 'application/json' }));
      
      // 이미지 파일 추가
      // 기본 이미지 변경 시 profileImageFile이 null임을 확인
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      } 
      // else {
      //   formData.append('profileImagePath', ''); // 기본 이미지로 설정할 경우
      // }
      
      
      const response = await axios.patch('/api/members/updateProfile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
  
      if (response.status === 200) {
        alert('프로필이 성공적으로 업데이트되었습니다.');
      } else {
        alert('프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };
  

  return (
    <div className='settings-profile-container'>
      <header className='settings-profile-header'>
        <img src={ic_back} alt='back' className='back-icon' onClick={() => window.history.back()} />
        <div className='settings-profile-title'>프로필 설정</div>
      </header>
      <div className='profile-picture'>
        <img src={profileImage} alt='profile' className='profile-img' />
        <label htmlFor='profile-img-upload' className='camera-icon'>
          <img src={ic_img} alt='change' />
        </label>
        <input 
          type='file' 
          id='profile-img-upload' 
          accept='image/*' 
          onChange={handleImageChange} 
          style={{ display: 'none' }} 
        />
      </div>
      <div className='change-picture-text' onClick={handleSetToDefault}>
        기본이미지로 변경
      </div>
      <div className='name-input-container'>
        <label htmlFor='name'>이름</label>
        <input 
          type='text' 
          id='name' 
          value={name} 
          onChange={handleNameChange} 
          className='name-input'
        />
      </div>
      <button className='save-button' onClick={handleSave}>수정 완료</button>
    </div>
  );
};

export default SettingsProfile;