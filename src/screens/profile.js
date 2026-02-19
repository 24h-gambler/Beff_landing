import { registerScreen, navigateTo, state } from '../app.js';

// ===== Screen 1: Profile =====
registerScreen(1, () => `
  <div class="flex-center flex-grow gap-lg" style="padding: var(--sp-xl) var(--sp-lg); text-align:center">
    <h2 class="screen-title">기본 정보</h2>
    <p class="screen-subtitle">딱 세 가지만 알려주세요</p>

    <div class="profile-form">
      <div class="profile-field">
        <label class="profile-label">나이</label>
        <div class="age-row">
          <button class="age-btn" id="age-minus">−</button>
          <input type="number" class="age-input" id="age-val"
            value="${state.userAge}" min="11" max="99" />
          <button class="age-btn" id="age-plus">+</button>
        </div>
      </div>

      <div class="profile-field">
        <label class="profile-label">성별</label>
        <div class="toggle-row" id="my-gender">
          <button class="toggle-pill${state.userGender === '남성' ? ' active' : ''}" data-val="남성">남성</button>
          <button class="toggle-pill${state.userGender === '여성' ? ' active' : ''}" data-val="여성">여성</button>
        </div>
      </div>

      <div class="profile-field" id="beff-pref-field" style="opacity:0.25; pointer-events:none;">
        <label class="profile-label">베프의 성별</label>
        <div class="pref-slider-wrap">
          <div class="pref-labels">
            <span>동성</span><span>상관없음</span><span>이성</span>
          </div>
          <input type="range" class="ms-range" id="pref-range" min="0" max="2" value="1" step="1" />
        </div>
      </div>
    </div>

    <button class="btn btn-primary btn-full" id="profile-next" style="opacity:0.25; pointer-events:none; margin-top: var(--sp-lg);">
      다음
    </button>
  </div>
`);

registerScreen('1_init', (el) => {
  const ageInput = el.querySelector('#age-val');
  let age = state.userAge;
  let myGender = state.userGender;
  let pref = state.beffGenderPref;
  const prefMap = { 0: 'same', 1: 'any', 2: 'opposite' };

  const beffField = el.querySelector('#beff-pref-field');
  const nextBtn = el.querySelector('#profile-next');

  function clampAge(v) { return Math.max(11, Math.min(99, v)); }

  function updateReady() {
    const ready = myGender && pref;
    nextBtn.style.opacity = ready ? '1' : '0.25';
    nextBtn.style.pointerEvents = ready ? 'auto' : 'none';
  }

  el.querySelector('#age-minus').addEventListener('click', () => {
    age = clampAge(age - 1); ageInput.value = age;
  });
  el.querySelector('#age-plus').addEventListener('click', () => {
    age = clampAge(age + 1); ageInput.value = age;
  });

  ageInput.addEventListener('input', () => {
    const raw = parseInt(ageInput.value, 10);
    if (!isNaN(raw)) age = raw;
  });
  ageInput.addEventListener('blur', () => {
    age = clampAge(age); ageInput.value = age;
  });

  el.querySelectorAll('#my-gender .toggle-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('#my-gender .toggle-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      myGender = btn.dataset.val;
      beffField.style.opacity = '1';
      beffField.style.pointerEvents = 'auto';
      pref = prefMap[+el.querySelector('#pref-range').value];
      updateReady();
    });
  });

  el.querySelector('#pref-range').addEventListener('input', (e) => {
    pref = prefMap[+e.target.value];
    updateReady();
  });

  nextBtn.addEventListener('click', () => {
    state.userAge = age;
    state.userGender = myGender;
    state.beffGenderPref = pref;
    navigateTo(2);
  });
});
