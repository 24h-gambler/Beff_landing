/**
 * Swipe image pool - categorized by gender × ethnicity × build
 * In production: pre-generated via Gemini API
 * For landing: using placeholder gradient cards with emoji
 */

const imagePool = {
    'male_asian_slim': [
        { id: 'mas1', label: '깔끔한 캐주얼' },
        { id: 'mas2', label: '스마트 룩' },
        { id: 'mas3', label: '스트릿 패션' },
        { id: 'mas4', label: '댄디 스타일' },
        { id: 'mas5', label: '미니멀 룩' },
    ],
    'male_asian_athletic': [
        { id: 'maa1', label: '스포티 캐주얼' },
        { id: 'maa2', label: '헬시 라이프' },
        { id: 'maa3', label: '액티브 룩' },
        { id: 'maa4', label: '피트니스 룩' },
        { id: 'maa5', label: '어반 스포츠' },
    ],
    'male_western_slim': [
        { id: 'mws1', label: '클래식 룩' },
        { id: 'mws2', label: '프레피 스타일' },
        { id: 'mws3', label: '모던 캐주얼' },
        { id: 'mws4', label: '빈티지 룩' },
        { id: 'mws5', label: '아메리칸 캐주얼' },
    ],
    'female_asian_slim': [
        { id: 'fas1', label: '러블리 캐주얼' },
        { id: 'fas2', label: '시크 룩' },
        { id: 'fas3', label: '내추럴 무드' },
        { id: 'fas4', label: '로맨틱 스타일' },
        { id: 'fas5', label: '모던 페미닌' },
    ],
};

// Default fallback pool
const defaultPool = [
    { id: 'df1', label: '스타일 A' },
    { id: 'df2', label: '스타일 B' },
    { id: 'df3', label: '스타일 C' },
    { id: 'df4', label: '스타일 D' },
    { id: 'df5', label: '스타일 E' },
];

/**
 * Get 5 swipe images based on user preferences
 */
export function getSwipeImages(preferences) {
    const genderKey = preferences.gender === '이성' ? 'female' : 'male';
    const raceKey = (preferences.race === '동양인' || preferences.race === '상관없음') ? 'asian' : 'western';
    const bodyKey = ['마름', '슬림탄탄'].includes(preferences.bodyType) ? 'slim' : 'athletic';

    const key = `${genderKey}_${raceKey}_${bodyKey}`;
    return imagePool[key] || defaultPool;
}

/**
 * Generate a placeholder gradient based on index
 */
const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
];

export function getPlaceholderGradient(index) {
    return gradients[index % gradients.length];
}

const personEmojis = ['🧑', '👩', '👨', '🧑‍💼', '👩‍💻', '🧑‍🎨', '👨‍⚕️', '👩‍🔬'];

export function getPersonEmoji(index) {
    return personEmojis[index % personEmojis.length];
}
