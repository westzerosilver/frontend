import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment'; // moment 라이브러리 임포트
import styles from './CombinedMealReport.module.css'; // CSS 모듈 가져오기

// 감정 상태 객체
const emotions = {
  COMFORTABLE: { text: '편안해요' },
  HAPPY: { text: '즐거워요' },
  EASY: { text: '무난해요' },
  GUILT: { text: '죄책감들어요' },
  IRRITATE: { text: '짜증나요' },
  ANXIOUS: { text: '불안해요' },
  LONELY: { text: '외로워요' }
};

// 증상 객체
const symptoms = {
  VOMIT: '구토',
  MEDICINE: '변비약 복용',
  BINGE: '폭식',
  REDUCE: '양 줄이기',
  SPIT: '씹고 뱉기',
  DIETMEDICINE: '다이어트약 복용',
  EXERCISE: '과한 운동',
  OTHER: '기타',
  NOTHING: '증상이 없었어요!'
};

const CombinedMealReport = () => {
  const { id } = useParams(); // URL 파라미터에서 id를 가져옵니다.
  const [date, setDate] = useState(moment().startOf('isoWeek').toDate()); // 기본값으로 현재 주의 시작 날짜 설정
  const [diary, setDiary] = useState(null); // 다이어리 데이터를 저장할 상태
  const [eatingType, setEatingType] = useState(''); // 식사 종류 상태
  const [menuName, setMenuName] = useState(''); // 메뉴명 상태
  const [photoUrl, setPhotoUrl] = useState(''); // 사진 URL 상태
  const [photoFile, setPhotoFile] = useState(null); // 사진 파일 상태
  const [eatingWith, setEatingWith] = useState(''); // 함께 먹은 사람 상태
  const [eatingWhere, setEatingWhere] = useState(''); // 먹은 장소 
  const [eatingWithOther, setEatingWithOther] = useState(''); // 기타 추가
  const [eatingWhereOther, setEatingWhereOther] = useState(''); // 기타 추가 
  const [preMealFeeling, setPreMealFeeling] = useState(''); // 식사 전 기분 상태
  const [postMealFeeling, setPostMealFeeling] = useState(''); // 식사 후 기분 상태
  const [symptomsList, setSymptomsList] = useState([]); // 증상 목록 상태
  const [memo, setMemo] = useState(''); // 메모 상태
  const [otherSymptom, setOtherSymptom] = useState(''); // 기타 증상 상태
  const [startEatingTime, setStartEatingTime] = useState(''); // 시작 시간 상태
  const [endEatingTime, setEndEatingTime] = useState(''); // 종료 시간 상태
  const [storedDate, setStoredDate] = useState(''); // 로컬 스토리지에서 가져온 날짜 상태
  const navigate = useNavigate(); // 페이지 전환 훅

  // 로컬 스토리지에서 날짜 가져오기
  useEffect(() => {
    const storedDate = localStorage.getItem('selectedDate');
    if (storedDate) {
      setStoredDate(storedDate);
      setDate(moment(storedDate).toDate());
    }
    console.log(storedDate);
  }, []);

  // 날짜가 업데이트될 때 API 호출
  useEffect(() => {
    const fetchDiaryDetail = async () => {
      try {
        const token = localStorage.getItem('jwtToken'); // 로컬 스토리지에서 JWT 토큰 가져오기
        if (!storedDate) return; // storedDate가 없으면 API 호출 안 함

        console.log('Stored Date in fetch:', storedDate);
        console.log('ID in fetch:', id);

        const response = await axios.get(`/api/fooddiaries/detail/${moment(storedDate).format('YYYY-MM-DD')}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data;
        console.log('상세 보기에서 가져온 데이터 : ', data);

        setDiary(data);
        setEatingType(data.eatingType || '');
        setMenuName(data.menuName || '');
        setPhotoUrl(data.photoUrl || ''); // URL 설정
        setEatingWith(data.eatingWith || '');
        setEatingWhere(data.eatingWhere || '');
        setPreMealFeeling(data.feeling || '');
        setPostMealFeeling(data.afterFeeling || '');
        setSymptomsList(data.symptoms || []);
        setMemo(data.memo || '');
        setEatingWithOther(data.eatingWithOther || '');
        setEatingWhereOther(data.eatingWhereOther || '');
        setStartEatingTime(data.startEatingTime || ''); // 시작 시간 설정
        setEndEatingTime(data.endEatingTime || ''); // 종료 시간 설정
      } catch (error) {
        console.error('다이어리 상세 조회 오류:', error);
      }
    };

    fetchDiaryDetail(); // 다이어리 상세 데이터 가져오기
  }, [storedDate, id]);

  // 옵션 클릭 핸들러
  const handleOptionClick = (setter, value) => {
    setter(value);
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file); // 파일 URL 생성
      setPhotoUrl(fileUrl); // 이미지 URL 설정
      setPhotoFile(file); // 선택한 파일 상태 업데이트
    }
  };

  // 수정 핸들러
  const handleEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('eatingType', eatingType);
      formData.append('menuName', menuName);
      if (photoFile) {
        formData.append('photoFile', photoFile); // 파일 객체 추가
      }
      formData.append('eatingWith', eatingWith);
      formData.append('eatingWhere', eatingWhere);
      formData.append('feeling', preMealFeeling);
      formData.append('afterFeeling', postMealFeeling);
      formData.append('symptoms', JSON.stringify(symptomsList));
      formData.append('memo', memo);
      formData.append('startEatingTime', startEatingTime); // 시작 시간 추가
      formData.append('endEatingTime', endEatingTime); // 종료 시간 추가

      // 조건에 따른 필드 추가
      formData.append('eatingWithOther', eatingWith === 'OTHER' ? eatingWithOther : null);
      formData.append('eatingWhereOther', eatingWhere === 'OTHER' ? eatingWhereOther : null);

        // 콘솔 로그 추가
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

      const token = localStorage.getItem('jwtToken'); // 로컬 스토리지에서 JWT 토큰 가져오기
      await axios.put(`/api/fooddiaries/detail/${moment(storedDate).format('YYYY-MM-DD')}/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/main'); // 수정 후 메인 페이지로 이동
    } catch (error) {
      console.error('다이어리 수정 오류:', error); // 오류 발생 시 콘솔에 오류 로그
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('jwtToken'); // 로컬 스토리지에서 JWT 토큰 가져오기
      await axios.delete(`/api/fooddiaries/detail/${moment(storedDate).format('YYYY-MM-DD')}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/main'); // 삭제 후 메인 페이지로 이동
    } catch (error) {
      console.error('다이어리 삭제 오류:', error); // 오류 발생 시 콘솔에 오류 로그
    }
  };

  // 식사 전 기분 클릭 핸들러
  const handlePreMealFeelingClick = (feelingKey) => {
    setPreMealFeeling(feelingKey); // 상태 업데이트
  };

  // 식사 후 기분 클릭 핸들러
  const handlePostMealFeelingClick = (feelingKey) => {
    setPostMealFeeling(feelingKey); // 상태 업데이트
  };

  // 증상 클릭 핸들러
  const handleSymptomClick = (symptom) => {
    const updatedSymptoms = [...symptomsList];
    if (symptomsList.includes(symptom)) {
      setSymptomsList(symptomsList.filter(s => s !== symptom)); // 증상 목록에서 항목 제거
    } else {
      updatedSymptoms.push(symptom);
      setSymptomsList(updatedSymptoms); // 증상 목록에 항목 추가
    }

  };

  // 기타 증상 입력 변화 핸들러
  const handleOtherInputChange = (e) => {
    setOtherSymptom(e.target.value);
  };

  // 메모 입력 변화 핸들러
  const handleMemoChange = (e) => {
    setMemo(e.target.value);
  };

  if (!diary) return <div>로딩 중...</div>; // 다이어리 데이터가 없으면 로딩 메시지 표시

  return (
        <div className={styles.foodDiaryDetailPage}>
        <div className={styles.mealRecordContent}>
          <div className={styles.mealRecordEndContainer}>
            <div className={styles.mealRecordHeader}>
              <span className={styles.mealRecordHeaderDate}>{moment(storedDate).format('YYYY-MM-DD')}</span>
              <div className={styles.mealRecordHeaderIcons}>
                <div 
                  className={`${styles.mealRecordHeaderIcon} ${styles.mealRecordHeaderCloseIcon}`} 
                  onClick={() => navigate('/main')} 
                />
              </div>
            </div>

          <form className={styles.recordForm}>
          <div className={styles.recordFormTimeGroup}>
            <label className={styles.recordFormLabel}>시간</label>
            <div className={styles.formGroup}>
              <input 
                type="time" 
                value={startEatingTime} 
                onChange={(e) => setStartEatingTime(e.target.value)} 
              />
            </div>
            <div className={styles.formGroup}>

              <input 
                type="time" 
                value={endEatingTime} 
                onChange={(e) => setEndEatingTime(e.target.value)} 
              />
            </div>
          </div>

              <div className={styles.recordFormMealGroup}>
                <label className={styles.recordFormLabel}>식사 종류</label>
                <div className={styles.recordFormOptions}>
                  {['BREAKFAST', 'LUNCH', 'DINNER', 'LATENIGHT', 'SNACK'].map(mealType => (
                    <div
                      key={mealType}
                      className={`${styles.recordFormOption} ${eatingType === mealType ? styles.recordFormOptionActive : ''}`}
                      onClick={() => handleOptionClick(setEatingType, mealType)}
                    >
                      {mealType === 'BREAKFAST' && '아침'}
                      {mealType === 'LUNCH' && '점심'}
                      {mealType === 'DINNER' && '저녁'}
                      {mealType === 'LATENIGHT' && '야식'}
                      {mealType === 'SNACK' && '간식'}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.recordFormMenuGroup}>
                <label className={styles.recordFormLabel}>메뉴</label>
                <textarea
                  placeholder="메뉴명을 입력하세요."
                  rows="2"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className={styles.recordFormMenuGroupTextarea}
                />
                <input 
                  type="file" 
                  id="image-upload" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
                <label htmlFor="image-upload" className={styles.recordFormMenuGroupUploadBtn}>
                  {photoUrl ? 
                      <img src={photoUrl} alt="Meal" className={styles.recordFormMenuGroupUploadedImage} /> : 
                      <div className={styles.recordFormMenuGroupUploadPlaceholder}>
                        <div className={styles.recordFormMenuGroupUploadPlaceholderBefore} />
                      </div>
                  }
                </label>
              </div>
              <div className={styles.recordFormWhoGroup}>
                <label className={styles.recordFormLabel}>누구와 먹었나요?</label>
                <div className={styles.recordFormWhoGroupOptions}>
                  {['ALONE', 'FRIEND', 'PARTNER', 'COLLEAGUE', 'OTHER'].map(who => (
                    <div
                      key={who}
                      className={`${styles.recordFormOption} ${eatingWith === who ? styles.recordFormOptionActive : ''}`}
                      onClick={() => handleOptionClick(setEatingWith, who)}
                    >
                      {who === 'ALONE' && '혼자'}
                      {who === 'FRIEND' && '친구'}
                      {who === 'PARTNER' && '연인'}
                      {who === 'COLLEAGUE' && '직장동료'}
                      {who === 'OTHER' && '기타'}
                    </div>
                  ))}
                </div>
                {eatingWith === 'OTHER' && (
                  <input
                    type="text"
                    placeholder="입력"
                    className={styles.recordFormWhoGroupInputOtherInput}
                    value={eatingWithOther}
                    onChange={(e) => setEatingWithOther(e.target.value)}
                  />
                )}
              </div>
              <div className={styles.recordFormWhereGroup}>
                <label className={styles.recordFormLabel}>어디에서 먹었나요?</label>
                <div className={styles.recordFormWhereGroupOptions}>
                  {['HOME', 'RESTAURANT', 'SCHOOL', 'WORK', 'OTHER'].map(where => (
                    <div
                      key={where}
                      className={`${styles.recordFormOption} ${eatingWhere === where ? styles.recordFormOptionActive : ''}`}
                      onClick={() => handleOptionClick(setEatingWhere, where)}
                    >
                      {where === 'HOME' && '집'}
                      {where === 'RESTAURANT' && '식당'}
                      {where === 'SCHOOL' && '학교'}
                      {where === 'WORK' && '직장'}
                      {where === 'OTHER' && '기타'}
                    </div>
                  ))}
                </div>
                {eatingWhere === 'OTHER' && (
                  <input
                    type="text"
                    placeholder="입력"
                    value={eatingWhereOther}
                    onChange={(e) => setEatingWhereOther(e.target.value)}
                    className={styles.recordFormWhereGroupInputOtherInput}
                  />
                )}
              </div>

              <div className={styles.recordFormEmotionGroup}>
                <label className={styles.recordFormLabel}>식사 전 기분은 어때요?</label>
                <div className={styles.recordFormEmotionGroupMealFeelings}>
                  {Object.keys(emotions).map(feelingKey => (
                    <div
                      key={feelingKey}
                      className={`${styles.recordFormEmotionGroupMealFeelingsFeeling} ${styles[`feeling${feelingKey}`]} ${preMealFeeling === feelingKey ? styles[`feeling${feelingKey}Active`] : ''}`}
                      onClick={() => handlePreMealFeelingClick(feelingKey)}
                    >
                      <span className={styles.feelingText}>{emotions[feelingKey].text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.endFormEmotionGroup}>
                <label className={styles.endFormLabel}>식사 후 기분은 어때요?</label>
                <div className={styles.endFormEmotionGroupMealFeelings}>
                  {Object.keys(emotions).map(feelingKey => (
                    <div
                      key={feelingKey}
                      className={`${styles.endFormEmotionGroupMealFeelingsFeeling} ${styles[`feeling${feelingKey}`]} ${postMealFeeling === feelingKey ? styles[`feeling${feelingKey}Active`] : ''}`}
                      onClick={() => handlePostMealFeelingClick(feelingKey)}
                    >
                      <span className={styles.feelingText}>{emotions[feelingKey].text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.endFormSymptomGroup}>
                <label className={styles.symptomGroupLabel}>식사 후 증상은 있었나요?</label>
                <div className={styles.endFormOptions}>
                  {Object.entries(symptoms).map(([key, symptom]) => (
                    <div
                      key={key}
                      className={`${styles.endFormOption} ${symptomsList.includes(key) ? styles.endFormOptionActive : ''}`}
                      onClick={() => handleSymptomClick(key)}
                    >
                      {symptom}
                    </div>
                  ))}
                  {symptomsList.includes('OTHER') && (
                    <input
                      type="text"
                      placeholder="입력"
                      value={otherSymptom}
                      onChange={handleOtherInputChange}
                      className={styles.otherInput}
                    />
                  )}
                </div>
              </div>

              <textarea
                placeholder="메모를 남겨주세요."
                rows="4"
                value={memo}
                onChange={handleMemoChange}
                className={styles.memoInput}
              />

              <div className={styles.actionButtons}>
                <button type="button" className={styles.editBtn} onClick={handleEdit}>수정</button>
                <button type="button" className={styles.deleteBtn} onClick={handleDelete}>삭제</button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default CombinedMealReport;
