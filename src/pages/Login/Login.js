import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../pages/Login/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/members/login', {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.token) {
        const token = response.data.token;
        console.log('Received token:', token);

        localStorage.setItem('jwtToken', token);

        console.log('Token stored:', localStorage.getItem('jwtToken')); // Check stored token

        navigate('/main');
      } else {
        setError('로그인에 실패했습니다.');
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('잘못된 이메일 또는 비밀번호입니다.');
            break;
          case 401:
            setError('인증 실패. 다시 시도해주세요.');
            break;
          default:
            setError('서버 오류가 발생했습니다.');
        }
      } else {
        setError('서버에 연결할 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClick = () => {
    navigate('/join');
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="login-container">
      <h1 className='login-title'>로그인</h1>
      <div className="input-container">
        <input 
          className='login-input'
          type="email"
          placeholder="이메일을 입력하세요."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          className='login-input'
          type="password"
          placeholder="비밀번호를 입력하세요."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className='error-message'>{error}</p>}
      <p className='login-comment'>
        아직 회원이 아니신가요? <a className='login-to-join-comment' href="#!" onClick={handleJoinClick}>회원가입</a>
      </p>
      <button className="login-button" onClick={handleLogin} disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
      <button className="google-button" onClick={handleGoogleLogin}>
        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_48dp.png" alt="Google logo" />
        Continue with Google
      </button>
    </div>
  );
};

export default Login;
