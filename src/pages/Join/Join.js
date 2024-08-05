import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../pages/Join/Join.css';

const Join = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTokenAndUserInfo = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');

      console.log(code);

      if (code) {
        try {
          await axios.get(`/api/login/oauth2/code/google?code=${code}`, {
            withCredentials: true
          });

          // /main 엔드포인트로 사용자 정보 가져오기
          const mainResponse = await axios.get('/api/main', {
            withCredentials: true
          });

          console.log(mainResponse.data);

          if (mainResponse.data && mainResponse.data.name) {
            localStorage.setItem('name', mainResponse.data.name); // 사용자가 이름을 로컬 스토리지에 저장
            navigate('/main'); // 메인 페이지로 이동
          } else {
            console.error('사용자 정보를 가져오는 데 실패했습니다.');
          }
        } catch (error) {
          console.error('구글 로그인 중 오류가 발생했습니다.', error);
        }
      } else {
        console.log('인증 코드가 URL에 없습니다. 회원가입 페이지입니다.');
      }
    };

    fetchTokenAndUserInfo();
  }, [navigate]);

  const handleJoinClick = () => {
    navigate('/join-general'); 
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="join-container">
      <h1 className='join-title'>회원가입</h1>

      <button className="join-button" onClick={handleJoinClick}>이메일로 회원가입</button>
      <button className="google-button" onClick={handleGoogleLogin}>
        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_48dp.png" alt="Google logo" />
        Continue with Google
      </button>

      <p className='join-comment'>
        이미 회원이신가요? <a href="#!" onClick={handleLoginClick}>로그인</a>
      </p>
    </div>
  );
};

export default Join;