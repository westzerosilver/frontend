import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Oauth2RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('jwtToken');

    if (token) {
      localStorage.setItem('jwtToken', token);
      navigate('/main'); // 로그인 성공 후 'main' 페이지로 이동
    } else {
      alert('로그인에 실패했습니다.');
      navigate('/login'); // 로그인 실패 시 'login' 페이지로 이동
    }
  }, [navigate]);

  return null;
};

export default Oauth2RedirectHandler;
