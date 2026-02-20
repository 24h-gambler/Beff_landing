import { registerScreen, navigateTo, state, effectiveBeffGender } from '../app.js';
import { randomKoreanName, randomJobTitle, randomHobbies, randomDistance, nearbyNeighborhood } from '../data/profiles.js';
import { getPlaceholderGradient, getPersonEmoji } from '../data/imagePool.js';

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
  // Loading animation
  const bar = el.querySelector('#loading-bar');
  const percent = el.querySelector('#loading-percent');
  const statusEl = el.querySelector('#loading-status');

  const statuses = [
    { at: 10, text: '회원님의 취향을 기반으로 지인 네트워크를 확보하는 중...' },
    { at: 30, text: '현재 위치 주변의 비공개 프로필을 스캔하고 있습니다...' },
    { at: 55, text: '상상하시던 이미지와 가장 부합하는 분들을 선별 중입니다...' },
    { at: 75, text: '가장 매칭 확률이 높은 두 분의 프로필을 준비하고 있습니다...' },
    { at: 90, text: '준비가 완료되었습니다.' },
  ];

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 4 + 1;
    if (progress >= 100) progress = 100;

    bar.style.width = `${progress}%`;
    percent.textContent = `${Math.round(progress)}%`;

    const status = statuses.filter(s => s.at <= progress).pop();
    if (status) statusEl.textContent = status.text;

    if (progress >= 100) {
      clearInterval(interval);
      // Generate fake profiles
      generateProfiles();
      setTimeout(() => navigateTo(12), 500);
    }
  }, 80);
});

function generateProfiles() {
  const g = effectiveBeffGender();
  const gender = g === 'female' ? 'female' : g === 'male' ? 'male' : (Math.random() > 0.5 ? 'male' : 'female');
  const neighborhood = state.neighborhood || '강남구 역삼동';
  const dongName = neighborhood.split(' ')[1] || neighborhood;

  state.generatedProfiles = [];
  const usedNames = new Set();

  // Custom job/hobby logic
  const customSpecificJob = state.inner.jobSpecific;
  const customJobCategory = state.inner.job;
  const customInterests = state.inner.interests;

  for (let i = 0; i < 8; i++) {
    let name;
    do {
      name = randomKoreanName(gender);
    } while (usedNames.has(name));
    usedNames.add(name);

    // Determine Job
    let assignedJob;
    if (customSpecificJob) assignedJob = customSpecificJob;
    else if (customJobCategory) assignedJob = randomJobTitle(customJobCategory);
    else assignedJob = randomJobTitle(null);

    // Determine Hobby
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
