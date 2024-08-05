import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
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

const FoodDiaryDetailPage = () => {
    const { date, id } = useParams(); // URL 파라미터에서 date와 id를 가져옵니다.
    const [diary, setDiary] = useState(null); // 다이어리 데이터를 저장할 상태
    const [eatingType, setEatingType] = useState(''); // 식사 종류 상태
    const [menuName, setMenuName] = useState(''); // 메뉴명 상태
    const [photoUrl, setPhotoUrl] = useState(''); // 사진 URL 상태
    const [eatingWith, setEatingWith] = useState(''); // 함께 먹은 사람 상태
    const [eatingWhere, setEatingWhere] = useState(''); // 먹은 장소 상태
    const [feeling, setFeeling] = useState(''); // 식사 전 기분 상태
    const [activeFeeling, setActiveFeeling] = useState(''); // 식사 후 기분 상태
    const [symptomsList, setSymptomsList] = useState([]); // 증상 목록 상태
    const [memo, setMemo] = useState(''); // 메모 상태
    const [otherSymptom, setOtherSymptom] = useState(''); // 기타 증상 상태
    const navigate = useNavigate(); // 페이지 전환 훅

    // 컴포넌트가 마운트되거나 date 또는 id가 변경될 때 호출되는 함수
    useEffect(() => {
        const fetchDiaryDetail = async () => {
            try {
                const token = localStorage.getItem('jwtToken'); // 로컬 스토리지에서 JWT 토큰 가져오기
                const response = await axios.get(`/api/fooddiaries/detail/${date}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = response.data;
                setDiary(data); // 다이어리 데이터 설정
                setEatingType(data.eatingType || ''); // 식사 종류 설정
                setMenuName(data.menuName || ''); // 메뉴명 설정
                setPhotoUrl(data.photoUrl || ''); // 사진 URL 설정
                setEatingWith(data.eatingWith || ''); // 함께 먹은 사람 설정
                setEatingWhere(data.eatingWhere || ''); // 먹은 장소 설정
                setFeeling(data.feeling || ''); // 식사 전 기분 설정
                setActiveFeeling(data.afterFeeling || ''); // 식사 후 기분 설정
                setSymptomsList(data.symptoms || []); // 증상 목록 설정
                setMemo(data.memo || ''); // 메모 설정
            } catch (error) {
                console.error('다이어리 상세 조회 오류:', error); // 오류 발생 시 콘솔에 오류 로그
            }
        };

        fetchDiaryDetail(); // 다이어리 상세 데이터 가져오기
    }, [date, id]);

    // 옵션 클릭 핸들러
    const handleOptionClick = (setter, value) => {
        setter(value);
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUrl(reader.result); // 업로드한 이미지 URL 설정
            };
            reader.readAsDataURL(file);
        }
    };

    // 수정 핸들러
    const handleEdit = async () => {
        try {
            const updatedData = {
                eatingType,
                menuName,
                photoUrl,
                eatingWith,
                eatingWhere,
                feeling,
                afterFeeling: activeFeeling,
                symptoms: symptomsList,
                memo
            };
            const token = localStorage.getItem('jwtToken'); // 로컬 스토리지에서 JWT 토큰 가져오기
            await axios.put(`/api/fooddiaries/detail/${date}/${id}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` }
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
            await axios.delete(`/api/fooddiaries/detail/${date}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/main'); // 삭제 후 메인 페이지로 이동
        } catch (error) {
            console.error('다이어리 삭제 오류:', error); // 오류 발생 시 콘솔에 오류 로그
        }
    };

    // 기분 클릭 핸들러
    const handleFeelingClick = (feeling) => {
        setActiveFeeling(feeling);
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

        if (symptom !== 'OTHER') {
            setOtherSymptom(''); // 기타 증상이 아닌 경우 기타 증상 필드 초기화
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
                        <span className={styles.mealRecordHeaderDate}>{diary.date}</span>
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
                            <div className={styles.recordFormTimeDisplay}>
                                <span className={styles.recordFormTimeDisplayRecordTime}>기록된 시간</span>
                                <button className={styles.recordFormTimeIcon} />
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
                                    value={eatingWith}
                                    onChange={(e) => setEatingWith(e.target.value)}
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
                                    value={eatingWhere}
                                    onChange={(e) => setEatingWhere(e.target.value)}
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
                                        className={`${styles.recordFormEmotionGroupMealFeelingsFeeling} ${styles[`feeling${feelingKey}`]} ${activeFeeling === feelingKey ? styles.feelingActive : ''}`}
                                        onClick={() => handleFeelingClick(feelingKey)}
                                    >
                                        {emotions[feelingKey].text}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.endFormEmotionGroup}>
                            <label className={styles.endFormLabel}>식사 후 기분은 어때요?</label>
                            <div className={styles.recordFormEmotionGroupMealFeelings}>
                                {Object.keys(emotions).map(feelingKey => (
                                    <div
                                        key={feelingKey}
                                        className={`${styles.recordFormEmotionGroupMealFeelingsFeeling} ${styles[`feeling${feelingKey}`]} ${activeFeeling === feelingKey ? styles.feelingActive : ''}`}
                                        onClick={() => handleFeelingClick(feelingKey)}
                                    >
                                        {emotions[feelingKey].text}
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
                        <div className={styles.memoGroup}>
                            <label className={styles.recordFormLabel}>메모</label>
                            <textarea
                                placeholder="메모를 남겨주세요."
                                rows="4"
                                value={memo}
                                onChange={handleMemoChange}
                                className={styles.memoInput}
                            />
                        </div>
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

export default FoodDiaryDetailPage;
