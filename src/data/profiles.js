/** Seoul neighborhoods data */
export const neighborhoods = [
    '강남구 역삼동', '강남구 삼성동', '강남구 논현동', '강남구 청담동',
    '서초구 반포동', '서초구 서초동', '서초구 잠원동',
    '송파구 잠실동', '송파구 방이동', '송파구 석촌동',
    '마포구 합정동', '마포구 연남동', '마포구 상수동', '마포구 망원동',
    '용산구 이태원동', '용산구 한남동', '용산구 보광동',
    '성동구 성수동', '성동구 왕십리',
    '종로구 삼청동', '종로구 부암동',
    '영등포구 여의도동',
    '관악구 신림동',
    '동작구 사당동',
];

/** 랜덤 거리 생성 (0.3 ~ 3.5 km) */
export function randomDistance() {
    return (Math.random() * 3.2 + 0.3).toFixed(1);
}

/** 주어진 동네 인근 랜덤 동네 반환 */
export function nearbyNeighborhood(baseNeighborhood) {
    const gu = baseNeighborhood.split(' ')[0];
    const sameGu = neighborhoods.filter(n => n.startsWith(gu) && n !== baseNeighborhood);
    if (sameGu.length > 0) return sameGu[Math.floor(Math.random() * sameGu.length)].split(' ')[1];
    return baseNeighborhood.split(' ')[1];
}

/** 한국 이름 풀 */
const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '한', '서', '류'];
const firstNamesMale = ['민준', '서준', '도윤', '예준', '시우', '지호', '하준', '주원', '건우', '우진', '현우', '태민', '성민', '재현', '준호'];
const firstNamesFemale = ['서연', '서윤', '지우', '하은', '하윤', '민서', '수아', '다은', '예은', '채원', '지민', '소연', '유진', '나윤', '하린'];

export function randomKoreanName(gender = 'male') {
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    const firsts = gender === 'female' ? firstNamesFemale : firstNamesMale;
    const first = firsts[Math.floor(Math.random() * firsts.length)];
    return last + first;
}

/** 직업 매핑 */
const jobTitles = {
    '전문직': ['변호사', '의사', '약사', '회계사', 'UX 디자이너', '건축가'],
    '직장인': ['마케터', 'PM', '기획자', '인사담당', '영업팀', '데이터 분석가'],
    '프리랜서': ['프론트엔드 개발자', '영상 편집자', '일러스트레이터', '번역가', '작가'],
    '크리에이터': ['유튜버', '포토그래퍼', '뮤지션', '패션 디자이너', '브랜드 매니저'],
};

export function randomJobTitle(category) {
    const titles = jobTitles[category] || jobTitles['직장인'];
    return titles[Math.floor(Math.random() * titles.length)];
}

/** 취미 풀 */
const hobbies = [
    '카페 탐방', '러닝', '영화 감상', '요리', '독서', '여행',
    '보드게임', '클라이밍', '필라테스', '캠핑', '수영', '사진',
    '와인', '재즈 감상', '서핑', '요가', '전시 관람', '맛집 탐방',
];

export function randomHobbies(count = 2) {
    const shuffled = [...hobbies].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).join(', ');
}
