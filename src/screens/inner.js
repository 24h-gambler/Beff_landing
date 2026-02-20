import { registerScreen, navigateTo, state } from '../app.js';

const jobTypes = ['사무직', '전문직', '크리에이터', '서비스직', '자영업', '학생', '취업준비생', '백수', '부자'];

function innerRow(id, label, left, right) {
  const isSet = state.inner[id] !== null;
  return `
    <div class="ms-row" data-field="${id}">
      <div class="ms-top">
        <span class="ms-label">${label}</span>
        <button class="ms-reset" id="${id}-reset" style="${isSet ? '' : 'display:none'}">상관없음</button>
      </div>
      <div class="slider-body${isSet ? ' active' : ''}">
        <div class="slider-content">
          <div class="ms-ends"><span>${left}</span><span>${right}</span></div>
          <input type="range" class="ms-range" id="${id}-range"
            min="0" max="100" value="${state.inner[id] ?? 50}" step="1" />
        </div>
        <button class="slider-overlay" id="${id}-overlay">
          <span>상관없음</span>
          <small>터치해서 설정</small>
        </button>
      </div>
    </div>`;
}

// ===== Screen 4: Inner =====
registerScreen(4, () => {
  const s = state.inner;
  const interestsSet = s.interests !== null && s.interests !== '';
  const jobSet = s.job !== null;
  const jobSpecSet = s.jobSpecific !== null && s.jobSpecific !== '';

  return `
    <div class="custom-screen">
      <div class="custom-header">
        <span class="section-tag">내면</span>
        <button class="custom-back" id="inn-back">← 돌아가기</button>
      </div>

      <div class="celeb-box">
        <div class="celeb-input-wrap">
          <input type="text" class="celeb-input" id="celeb-input"
            placeholder="닮았으면 하는 성격의 인물" value="${s.celebRef || ''}" />
          <button class="celeb-go" id="celeb-go">적용</button>
        </div>
      </div>
      <button class="btn-skip" id="inn-skip" style="margin-top: 8px; margin-bottom: 24px;">전부 상관없음 (건너뛰기)</button>

      <div class="custom-divider"></div>

      <div class="multi-sliders">
        ${innerRow('attention', '관심도', '쿨함', '다정함')}
        ${innerRow('relationship', '관계', '가벼움', '절친/연인')}
        ${innerRow('sharing', '일상 공유', '가끔', '수시로')}
        ${innerRow('chatStyle', '대화', '간결', '수다')}

        <!-- Interests -->
        <div class="ms-row" data-field="interests">
          <div class="ms-top">
            <span class="ms-label">관심사</span>
            <button class="ms-reset" id="interests-reset" style="${interestsSet ? '' : 'display:none'}">상관없음</button>
          </div>
          <div class="slider-body${interestsSet ? ' active' : ''}">
            <div class="slider-content">
              <input type="text" class="ms-text" id="interests-input"
                placeholder="예) 운동, 영화, 맛집" value="${s.interests || ''}" />
            </div>
            <button class="slider-overlay" id="interests-overlay">
              <span>상관없음</span>
              <small>터치해서 설정</small>
            </button>
          </div>
        </div>

        <!-- Job type -->
        <div class="ms-row" data-field="job" style="flex-direction: column; align-items: stretch;">
          <div class="ms-top" style="margin-bottom: 12px;">
            <span class="ms-label">직무</span>
            <button class="ms-reset" id="job-reset" style="${jobSet ? '' : 'display:none'}">상관없음</button>
          </div>
          <div class="slider-body${jobSet ? ' active' : ''}" style="min-height: auto; padding-bottom: 8px;">
            <div class="slider-content" style="opacity: 1; pointer-events: auto;">
              <div class="toggle-row" id="job-toggles" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${jobTypes.map(t => `<button class="toggle-pill${s.job === t ? ' active' : ''}" data-val="${t}" style="flex: 1 1 calc(33.333% - 8px); padding: 8px 4px; font-size: 0.85rem;">${t}</button>`).join('')}
              </div>
            </div>
            <button class="slider-overlay" id="job-overlay" style="${jobSet ? 'display: none;' : ''}">
              <span>상관없음</span>
              <small>터치해서 설정</small>
            </button>
          </div>
        </div>

        <!-- Specific job -->
        <div class="ms-row" data-field="jobSpecific">
          <div class="ms-top">
            <span class="ms-label">특정 직무</span>
            <button class="ms-reset" id="jobSpecific-reset" style="${jobSpecSet ? '' : 'display:none'}">상관없음</button>
          </div>
          <div class="slider-body${jobSpecSet ? ' active' : ''}">
            <div class="slider-content">
              <input type="text" class="ms-text" id="jobSpecific-input"
                placeholder="예) 개발자, 디자이너, 의사" value="${s.jobSpecific || ''}" />
            </div>
            <button class="slider-overlay" id="jobSpecific-overlay">
              <span>상관없음</span>
              <small>터치해서 설정</small>
            </button>
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-full" id="inn-done" style="margin-top: var(--sp-xl);">완료</button>
    </div>`;
});

registerScreen('4_init', (el) => {
  const sliderFields = ['relationship', 'attention', 'sharing', 'chatStyle'];
  const allFields = [...sliderFields, 'job', 'jobSpecific', 'interests'];
  const activated = {};
  allFields.forEach(f => {
    const v = state.inner[f];
    activated[f] = v !== null && v !== '';
  });

  // Overlay + reset handlers
  allFields.forEach(f => {
    if (f === 'job') return; // Handled separately below

    const overlay = el.querySelector(`#${f}-overlay`);
    const body = overlay.closest('.slider-body');
    const resetBtn = el.querySelector(`#${f}-reset`);

    if (activated[f]) body.classList.add('active');

    overlay.addEventListener('click', () => {
      activated[f] = true;
      body.classList.add('active');
      resetBtn.style.display = '';
      // Trigger value display for sliders
      const range = body.querySelector('input[type="range"]');
      if (range) range.dispatchEvent(new Event('input'));
    });

    resetBtn.addEventListener('click', () => {
      activated[f] = false;
      body.classList.remove('active');
      resetBtn.style.display = 'none';
      // Clear text inputs
      const textInput = body.querySelector('input[type="text"]');
      if (textInput) textInput.value = '';
      // Clear value displays
      const valEl = el.querySelector(`#${f}-val`);
      if (valEl) valEl.textContent = '';
    });
  });

  // Job discrete toggle logic
  const jobToggles = el.querySelectorAll('#job-toggles .toggle-pill');
  const jobReset = el.querySelector('#job-reset');
  const jobOverlay = el.querySelector('#job-overlay');

  jobToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      jobToggles.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.inner.job = btn.dataset.val;
      activated.job = true;
      jobReset.style.display = '';
    });
  });

  // Override overlay for job
  const originalJobOverlayClick = () => {
    activated.job = true;
    el.querySelector('#job-overlay').closest('.slider-body').classList.add('active');
    jobReset.style.display = '';
    jobOverlay.style.display = 'none';
  };
  jobOverlay.addEventListener('click', originalJobOverlayClick);

  // Override reset for job
  jobReset.addEventListener('click', () => {
    activated.job = false;
    el.querySelector('#job-overlay').closest('.slider-body').classList.remove('active');
    jobReset.style.display = 'none';
    jobOverlay.style.display = '';
    state.inner.job = null;
    jobToggles.forEach(b => b.classList.remove('active'));
  });

  // Celebrity shortcut
  const multiSliders = el.querySelector('.multi-sliders');
  el.querySelector('#celeb-go').addEventListener('click', () => {
    const name = el.querySelector('#celeb-input').value.trim();
    if (!name) {
      state.inner.celebRef = null;
      multiSliders.style.opacity = '1';
      multiSliders.style.pointerEvents = 'auto';
      // Restore job slider pointer events
      const jobSliderContent = el.querySelector('[data-field="job"] .slider-content');
      if (jobSliderContent) jobSliderContent.style.pointerEvents = 'auto';
      el.querySelector('#celeb-go').textContent = '적용';
      return;
    }

    // Lock sliders, rely on Backend Ops
    state.inner.celebRef = name;
    state.inner.skipAll = false;

    allFields.forEach(f => {
      activated[f] = false;
      const body = el.querySelector(`#${f}-overlay`).closest('.slider-body');
      body.classList.remove('active');
      const resetBtn = el.querySelector(`#${f}-reset`);
      if (resetBtn) resetBtn.style.display = 'none';

      const textInput = body.querySelector('input[type="text"]');
      if (textInput) textInput.value = '';

      const valEl = el.querySelector(`#${f}-val`);
      if (valEl) valEl.textContent = '';

      state.inner[f] = null;
    });

    multiSliders.style.opacity = '0.3';
    multiSliders.style.pointerEvents = 'none';
    multiSliders.style.transition = 'opacity 0.3s ease';

    // Disable job slider pointer events specifically
    const jobSliderContent = el.querySelector('[data-field="job"] .slider-content');
    if (jobSliderContent) jobSliderContent.style.pointerEvents = 'none';

    el.querySelector('#celeb-go').textContent = '✓ 적용됨';
  });

  // Hydrate celebRef if navigating back
  if (state.inner.celebRef) {
    el.querySelector('#celeb-input').value = state.inner.celebRef;
    multiSliders.style.opacity = '0.3';
    multiSliders.style.pointerEvents = 'none';
    const jobSliderContent = el.querySelector('[data-field="job"] .slider-content');
    if (jobSliderContent) jobSliderContent.style.pointerEvents = 'none';
    el.querySelector('#celeb-go').textContent = '✓ 적용됨';
  }

  // Done
  el.querySelector('#inn-done').addEventListener('click', () => {
    state.inner.skipAll = false;
    sliderFields.forEach(f => {
      state.inner[f] = activated[f] ? +el.querySelector(`#${f}-range`).value : null;
    });
    // state.inner.job is already updated by click handlers, but ensure we clear if not activated
    if (!activated.job) state.inner.job = null;
    const jobSpec = el.querySelector('#jobSpecific-input').value.trim();
    state.inner.jobSpecific = (activated.jobSpecific && jobSpec) ? jobSpec : null;
    const interests = el.querySelector('#interests-input').value.trim();
    state.inner.interests = (activated.interests && interests) ? interests : null;
    state.innerDone = true;
    history.back();
  });

  el.querySelector('#inn-skip').addEventListener('click', () => {
    state.inner.skipAll = true;
    history.back();
  });
  el.querySelector('#inn-back').addEventListener('click', () => history.back());
});

// function closestJobLabel(val) {
//   const idx = Math.round(val / 100 * (jobTypes.length - 1));
//   return jobTypes[Math.max(0, Math.min(idx, jobTypes.length - 1))];
// }
