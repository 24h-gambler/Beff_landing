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
  const hasAppCeleb = !!state.appearance.celebRef;
  const hasInnCeleb = !!state.inner.celebRef;

  const appCount = countSet(state.appearance);
  const innCount = countSet(state.inner);
  const appTotal = 5;
  const innTotal = 7;

  const appPct = (hasAppCeleb || state.appearance.skipAll) ? 100 : Math.round((appCount / appTotal) * 100);
  const innPct = (hasInnCeleb || state.inner.skipAll) ? 100 : Math.round((innCount / innTotal) * 100);

  const appStatusText = hasAppCeleb ? '상위 1% 특별 매칭' : (state.appearance.skipAll ? '모든 가능성 찾아보기' : (appCount > 0 ? `${appCount}가지 취향 반영` : '가장 대중적인 추천'));
  const innStatusText = hasInnCeleb ? '상위 1% 특별 매칭' : (state.inner.skipAll ? '모든 가능성 찾아보기' : (innCount > 0 ? `${innCount}가지 취향 반영` : '가장 대중적인 추천'));

  const prefVal = state.beffGenderPref === 'female' ? 0 : state.beffGenderPref === 'male' ? 2 : 1;

  return `
    <div class="flex-center flex-grow gap-lg" style="padding: var(--sp-xl) var(--sp-lg); text-align:center">
      <h2 class="screen-title mb-lg">어떤 베프를 만나고 싶으세요?</h2>

      <div class="profile-form" style="margin-bottom: var(--sp-md); width: 100%; max-width: 380px;">
        <div class="profile-field" id="beff-pref-field">
          <div class="pref-slider-wrap">
            <div class="pref-labels">
              <span>여성</span><span>상관없음</span><span>남성</span>
            </div>
            <input type="range" class="ms-range" id="pref-range" min="0" max="2" value="${prefVal}" step="1" />
          </div>
        </div>

        <div class="profile-field" id="age-pref-field" style="display: none; margin-top: var(--sp-xl);">
          <div class="pref-slider-wrap">
            <div class="pref-labels" style="color: var(--text-secondary); font-size: var(--fs-xs);">
              <span>연하</span><span>기본(동갑)</span><span>연상</span>
            </div>
            <input type="range" class="ms-range" id="age-range" min="-1" max="1" value="${state.ageDiffPref || 0}" step="1" />
          </div>
        </div>
      </div>

      <div class="hub-reveal-area" id="hub-reveal-area" style="width: 100%; display: none; flex-direction: column; align-items: center; transition: all 0.4s ease;">
        <div class="hub-cards">
          <button class="hub-card" id="hub-appearance">
            <div class="hub-card-icon">✨</div>
            <div class="hub-card-title" id="app-card-title">외형</div>
            <div class="hub-gauge">
              <div class="hub-gauge-fill" style="width: ${appPct}%"></div>
            </div>
            <div class="hub-card-status">${appStatusText}</div>
          </button>

          <button class="hub-card" id="hub-inner">
            <div class="hub-card-icon">💫</div>
            <div class="hub-card-title" id="inn-card-title">내면</div>
            <div class="hub-gauge">
              <div class="hub-gauge-fill" style="width: ${innPct}%"></div>
            </div>
            <div class="hub-card-status">${innStatusText}</div>
          </button>
        </div>

        <p class="hub-notice" style="margin-top: 24px; margin-bottom: 16px; font-size: var(--fs-sm); color: var(--text-muted);">한번 소개받은 베프는 변경할 수 없습니다</p>
      </div>
      
      <!-- Start button is always visible at the bottom to allow instant bypass -->
      <div style="width: 100%; max-width: 380px; margin-top: auto;">
        <button class="btn btn-primary btn-full" id="hub-start">
          소개받기
        </button>
      </div>
    </div>`;
});

registerScreen('2_init', (el) => {
  const prefMap = { 0: 'female', 1: 'any', 2: 'male' };
  const prefRange = el.querySelector('#pref-range');
  const ageField = el.querySelector('#age-pref-field');
  const ageRange = el.querySelector('#age-range');
  const revealArea = el.querySelector('#hub-reveal-area');

  // Progressive Disclosure Logic
  const handleGenderChange = () => {
    const val = +prefRange.value;
    state.beffGenderPref = prefMap[val];

    if (val === 1) { // 1 = 'any' (상관없음)
      ageField.style.display = 'none';
      revealArea.style.display = 'none';
      // Reset dependent states if they bypass
      state.ageDiffPref = null;
    } else { // 0 or 2 (female/male)
      ageField.style.display = 'block';
      // If age was already interacted with, keep the cards visible
      if (state.ageDiffPref !== null) {
        revealArea.style.display = 'flex';
      }
    }
  };

  const handleAgeChange = () => {
    state.ageDiffPref = +ageRange.value;
    revealArea.style.display = 'flex';
  };

  // Restore UI state if returning from back navigation
  if (state.beffGenderPref !== 'any' && state.beffGenderPref !== null) {
    ageField.style.display = 'block';
    if (state.ageDiffPref !== null || state.appearanceDone || state.innerDone) {
      revealArea.style.display = 'flex';
    }
  }

  // Bind Events
  prefRange.addEventListener('input', handleGenderChange);
  prefRange.addEventListener('change', handleGenderChange);

  ageRange.addEventListener('input', handleAgeChange);
  ageRange.addEventListener('change', handleAgeChange);

  el.querySelector('#hub-appearance').addEventListener('click', () => navigateTo(3));
  el.querySelector('#hub-inner').addEventListener('click', () => navigateTo(4));
  el.querySelector('#hub-start').addEventListener('click', () => navigateTo(10));
});
