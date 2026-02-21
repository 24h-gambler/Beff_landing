import { registerScreen, navigateTo, state, effectiveBeffGender } from '../app.js';
import { randomKoreanName, randomJobTitle, randomHobbies, randomDistance, nearbyNeighborhood } from '../data/profiles.js';
import { getPlaceholderGradient, getPersonEmoji } from '../data/imagePool.js';

// ===== API 설정 =====
const API_BASE = 'http://localhost:8000';

registerScreen(11, () => {
  return `
    <div class="loading-screen">
      <div class="loading-particles" style="margin-bottom: var(--sp-lg)">
        <div class="radar-ring"></div>
        <div class="radar-ring"></div>
        <div class="radar-ring"></div>
        <div style="font-size: 3rem; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:10;"></div>
      </div>
      <h2 class="screen-title" style="font-size: var(--fs-xl);">
        당신의 베프를 찾고 있어요...
      </h2>
      <p class="screen-subtitle" id="loading-status">당신의 완벽한 파트너를 찾는 중...</p>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" id="loading-bar" style="width: 0%;"></div>
      </div>
      <p style="color: var(--text-muted); font-size: var(--fs-sm);" id="loading-percent">0%</p>
    </div>
  `;
});

registerScreen('11_init', (el) => {
  const bar = el.querySelector('#loading-bar');
  const percent = el.querySelector('#loading-percent');
  const statusEl = el.querySelector('#loading-status');

  const statuses = [
    { at: 5, text: '회원님의 취향을 분석하고 있습니다...' },
    { at: 15, text: '이미지를 생성하는 중입니다... (1~2분 소요)' },
    { at: 30, text: '상상하시던 이미지와 가장 부합하는 모습을 만들고 있습니다...' },
    { at: 50, text: '디테일을 다듬고 있습니다...' },
    { at: 70, text: '거의 다 됐어요! 마무리 중...' },
    { at: 90, text: '프로필을 준비하고 있습니다...' },
  ];

  // ── 1) API 호출 시작 ──
  let apiDone = false;
  let apiFailed = false;

  fetchWorldcupImages().then(() => {
    apiDone = true;
  }).catch((err) => {
    console.error('이미지 생성 API 실패:', err);
    apiFailed = true;
    // 실패 시 기존 가짜 프로필로 폴백
    generateFallbackProfiles();
    apiDone = true;
  });

  // ── 2) 로딩 애니메이션 (API 완료까지 90%에서 대기) ──
  let progress = 0;
  const interval = setInterval(() => {
    if (apiDone) {
      // API 완료 → 100%로 빠르게 채우기
      progress += 5;
    } else {
      // API 대기 중 → 90%까지만 천천히
      if (progress < 90) {
        progress += Math.random() * 1.5 + 0.3;
      }
    }
    if (progress >= 100) progress = 100;

    bar.style.width = `${progress}%`;
    percent.textContent = `${Math.round(progress)}%`;

    const status = statuses.filter(s => s.at <= progress).pop();
    if (status) statusEl.textContent = status.text;

    if (progress >= 100) {
      clearInterval(interval);
      if (apiFailed) {
        statusEl.textContent = '⚠️ 이미지 생성에 실패하여 기본 프로필로 대체합니다.';
      }
      setTimeout(() => navigateTo(12), 500);
    }
  }, 200);
});

// ===== 실제 API 호출 =====
function normalizeHeight(cm, gender) {
  // 프론트 슬라이더는 cm 단위 (150~195), API는 0~100 범위
  if (cm == null) return 50;
  const ranges = { female: [150, 180], male: [160, 195] };
  const [min, max] = ranges[gender] || [155, 195];
  return Math.max(0, Math.min(100, Math.round((cm - min) / (max - min) * 100)));
}

async function fetchWorldcupImages() {
  const g = effectiveBeffGender();
  const gender = g === 'female' ? 'female' : g === 'male' ? 'male' : 'female';

  // 설문 데이터 수집 (null이면 기본값 50)
  const body = {
    user_id: 'anonymous-' + Date.now(),
    gender,
    // 외형 데이터 → 이미지 생성에 사용
    height: normalizeHeight(state.appearance.height, gender),
    race: state.appearance.race ?? 50,
    body_type: state.appearance.bodyType ?? 50,
    hair: state.appearance.hair ?? 50,
    eyelid: state.appearance.eyelid ?? 50,
    job: state.inner.jobSpecific || state.inner.job || '직장인',
    // 나머지 모든 입력값 → DB에만 저장 (이미지 생성에 미사용)
    preferences: {
      beffGenderPref: state.beffGenderPref,
      ageDiffPref: state.ageDiffPref,
      appearanceCelebRef: state.appearance.celebRef,
      inner: {
        celebRef: state.inner.celebRef,
        relationship: state.inner.relationship,
        attention: state.inner.attention,
        sharing: state.inner.sharing,
        chatStyle: state.inner.chatStyle,
        interests: state.inner.interests,
        job: state.inner.job,
        jobSpecific: state.inner.jobSpecific,
      },
      swipeLikes: state.swipeLikes,
      neighborhood: state.neighborhood,
    },
  };

  const res = await fetch(`${API_BASE}/beff/worldcup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);

  const data = await res.json();
  // data = { survey_id, images: [{id, url, scene_name, order}] }

  // generatedProfiles 형식으로 변환
  const neighborhood = state.neighborhood || '강남구 역삼동';
  const dongName = neighborhood.split(' ')[1] || neighborhood;
  const usedNames = new Set();

  state.generatedProfiles = data.images.map((img, i) => {
    let name;
    do { name = randomKoreanName(gender); } while (usedNames.has(name));
    usedNames.add(name);

    return {
      id: i,
      imageId: img.id,          // DB의 beff_images.id
      imageUrl: img.url,         // 실제 이미지 URL
      name,                      // 랜덤 한국 이름
      age: 24 + Math.floor(Math.random() * 9),
      job: body.job,
      neighborhood: i < 3 ? dongName : nearbyNeighborhood(neighborhood),
      distance: randomDistance(),
      hobby: randomHobbies(2),
      gradient: getPlaceholderGradient(i),  // 폴백용
      emoji: getPersonEmoji(i),             // 폴백용
    };
  });

  state._surveyId = data.survey_id;
}

// ===== 폴백: API 실패 시 기존 가짜 프로필 =====
function generateFallbackProfiles() {
  const g = effectiveBeffGender();
  const gender = g === 'female' ? 'female' : g === 'male' ? 'male' : (Math.random() > 0.5 ? 'male' : 'female');
  const neighborhood = state.neighborhood || '강남구 역삼동';
  const dongName = neighborhood.split(' ')[1] || neighborhood;

  state.generatedProfiles = [];
  const usedNames = new Set();

  const customSpecificJob = state.inner.jobSpecific;
  const customJobCategory = state.inner.job;
  const customInterests = state.inner.interests;

  for (let i = 0; i < 8; i++) {
    let name;
    do {
      name = randomKoreanName(gender);
    } while (usedNames.has(name));
    usedNames.add(name);

    let assignedJob;
    if (customSpecificJob) assignedJob = customSpecificJob;
    else if (customJobCategory) assignedJob = randomJobTitle(customJobCategory);
    else assignedJob = randomJobTitle(null);

    let assignedHobby;
    if (customInterests) assignedHobby = customInterests;
    else assignedHobby = randomHobbies(2);

    state.generatedProfiles.push({
      id: i,
      name,
      age: 24 + Math.floor(Math.random() * 9),
      job: assignedJob,
      neighborhood: i < 3 ? dongName : nearbyNeighborhood(neighborhood),
      distance: randomDistance(),
      hobby: assignedHobby,
      gradient: getPlaceholderGradient(i),
      emoji: getPersonEmoji(i),
    });
  }
}
