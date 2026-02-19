import { registerScreen, navigateTo, state } from '../app.js';

// ===== Screen 2: Hub =====
function countSet(obj) {
  let n = 0;
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'celebRef') continue; // don't count celeb shortcut
    if (v !== null && v !== '') n++;
  }
  return n;
}

registerScreen(2, () => {
  const appCount = countSet(state.appearance);
  const innCount = countSet(state.inner);
  const appTotal = 5;
  const innTotal = 7; // relationship, attention, sharing, chatStyle, interests, job, jobSpecific
  const appPct = Math.round((appCount / appTotal) * 100);
  const innPct = Math.round((innCount / innTotal) * 100);

  return `
    <div class="flex-center flex-grow gap-lg" style="padding: var(--sp-xl) var(--sp-lg); text-align:center">
      <h2 class="screen-title">어떤 베프를 만나고 싶으세요?</h2>
      <p class="screen-subtitle">원하는 만큼만 알려주세요</p>

      <div class="hub-cards">
        <button class="hub-card" id="hub-appearance">
          <div class="hub-card-icon">✨</div>
          <div class="hub-card-title">외형</div>
          <div class="hub-gauge">
            <div class="hub-gauge-fill" style="width: ${appPct}%"></div>
          </div>
          <div class="hub-card-status">${appCount > 0 ? `${appCount}개 설정됨` : '미설정'}</div>
        </button>

        <button class="hub-card" id="hub-inner">
          <div class="hub-card-icon">💫</div>
          <div class="hub-card-title">내면</div>
          <div class="hub-gauge">
            <div class="hub-gauge-fill" style="width: ${innPct}%"></div>
          </div>
          <div class="hub-card-status">${innCount > 0 ? `${innCount}개 설정됨` : '미설정'}</div>
        </button>
      </div>

      <p class="hub-notice">한번 소개받은 베프는 변경할 수 없습니다</p>
      <button class="btn btn-primary btn-full" id="hub-start">
        소개받기
      </button>
    </div>`;
});

registerScreen('2_init', (el) => {
  el.querySelector('#hub-appearance').addEventListener('click', () => navigateTo(3));
  el.querySelector('#hub-inner').addEventListener('click', () => navigateTo(4));
  el.querySelector('#hub-start').addEventListener('click', () => navigateTo(9));
});
