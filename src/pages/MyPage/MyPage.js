import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import UserInfo from './UserInfo';
import WeeklyReport from './WeeklyReport';
import TriggerAnalysis from './TriggerAnalysis';
import BingeEatingAnalysis from './BingeEatingAnalysis';
import PositiveMealAnalysis from './PositiveMealAnalysis';

function MyPage() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  // 사용자 데이터를 업데이트하는 함수
  const handleUserDataUpdate = (newData) => {
    setUserData(newData);
  };

  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          setError('로그인이 필요합니다.');
          return;
        }

        const decodedToken = jwtDecode(token);

        const expirationTime = decodedToken.exp * 1000;
        if (Date.now() >= expirationTime) {
          setError('토큰이 만료되었습니다. 다시 로그인 해주세요.');
          localStorage.removeItem('jwtToken');
          return;
        }

        const response = await fetch('/api/members/mypage', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          setError('인증이 필요합니다.');
          return;
        }

        if (!response.ok) {
          throw new Error('데이터 가져오기 실패');
        }

        const result = await response.json();
        setUserData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('데이터 가져오기 중 오류 발생');
      }
    };

    checkTokenAndFetchData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <UserInfo 
        name={userData.name} 
        profileImgPath={userData.profileImgPath}
        daysManaged={userData.daysSinceJoined} 
        mealManagement={userData.totalFoodDiaryCount} 
        complimentDone={userData.complimentCnt} 
      />
      <WeeklyReport 
        startDate={userData.startOfWeek} 
        endDate={userData.endOfWeek} 
        weeklyEatingTypeCounts={userData.weeklyEatingTypeCounts}
        weeklyFeelingCounts={userData.weeklyFeelingCounts}
        weeklySymptomCounts={userData.weeklySymptomCounts}
        dailySymptomCounts={userData.dailySymptomCounts}
      />
      <TriggerAnalysis 
        weeklySymptomCounts={userData.weeklySymptomCounts} 
      />
      <BingeEatingAnalysis 
        bingeEatingTypeCounts={userData.bingeEatingTypeCounts} 
        averageBingeEatingTime={userData.averageBingeEatingTime}
        top3BingeFeelings={userData.top3BingeFeelings}
        top3BingeAfterFeelings={userData.top3BingeAfterFeelings}
      />
      <PositiveMealAnalysis 
        highestScoreAfterfeelingEatingType={userData.highestScoreAfterfeelingEatingType}
        highestScoreAfterfeelingEatingWith={userData.highestScoreAfterfeelingEatingWith}
        highestScoreAfterfeelingEatingWhere={userData.highestScoreAfterfeelingEatingWhere}
        highestScoreAfterfeelingMenuName={userData.highestScoreAfterfeelingMenuName}
        highestScoreAfterfeeling={userData.highestScoreAfterfeeling}
      />
    </div>
  );
}

export default MyPage;