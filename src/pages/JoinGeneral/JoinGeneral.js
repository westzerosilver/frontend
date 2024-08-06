import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../pages/JoinGeneral/JoinGeneral.css';

const JoinGeneral = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!email || !password || !confirmPassword) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
  
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
  
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
  
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('유효한 이메일 주소를 입력해 주세요.');
      return;
    }
  
    setError('');
    setLoading(true);
  
    try {
      const response = await axios.post('/api/members/join', {
        name,
        email,
        password,
        confirmPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
  
      if (response.status === 201) {
        localStorage.setItem('name', name);
        localStorage.setItem('username', email);
        localStorage.setItem('password', password);
        navigate('/login');
      } else {
        setError('회원가입에 실패했습니다.');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setError('잘못된 입력입니다.');
        } else {
          setError('서버 오류가 발생했습니다.');
        }
      } else {
        setError('서버에 연결할 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="join-general-container">
      <h1 className='join-general-title'>회원가입</h1>
      <div className="input-container">
        <input className='join-general-input'
          type="text"
          placeholder="이름을 입력하세요."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input className='join-general-input'
          type="email"
          placeholder="이메일을 입력하세요."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input className='join-general-input'
          type="password"
          placeholder="비밀번호를 입력하세요."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input className='join-general-input'
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <p className='join-comment'>
        이미 회원이신가요? <a href="#!" onClick={handleLoginClick}>로그인</a>
      </p>
      <button
        className="join-general-button"
        onClick={handleJoin}
        disabled={loading}
      >
        {loading ? '회원가입 중...' : '회원가입'}
      </button>
    </div>
  );
};

export default JoinGeneral;
