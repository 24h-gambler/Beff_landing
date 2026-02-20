import { registerScreen, navigateTo, state, effectiveBeffGender } from '../app.js';

// ===== Gender-aware slider options =====
function getOpts() {
  const g = effectiveBeffGender();
  return {
    height: g === 'female'
      ? {
        min: 150, max: 180, def: 162, bands: [
          { upto: 155, l: '작은 편' }, { upto: 161, l: '조금 작음' },
          { upto: 167, l: '보통' }, { upto: 173, l: '큰 편' }, { upto: 180, l: '매우 큰 편' }
        ]
      }
      : g === 'male'
        ? {
          min: 160, max: 195, def: 175, bands: [
            { upto: 167, l: '작은 편' }, { upto: 173, l: '조금 작음' },
            { upto: 179, l: '보통' }, { upto: 186, l: '큰 편' }, { upto: 195, l: '매우 큰 편' }
          ]
        }
        : {
          min: 155, max: 195, def: 170, bands: [
            { upto: 162, l: '작은 편' }, { upto: 168, l: '조금 작음' },
            { upto: 175, l: '보통' }, { upto: 183, l: '큰 편' }, { upto: 195, l: '매우 큰 편' }
          ]
        },
    body: g === 'female'
      ? ['매우 마름', '마른', '슬림탄탄', '보통', '통통한', '글래머러스']
      : g === 'male'
        ? ['매우 마름', '마른', '슬림', '보통', '조금 통통', '근육질', '건장한']
        : ['매우 마름', '마른', '슬림', '보통', '조금 통통', '근육질', '덩치 큰'],
    hair: g === 'female'
      ? ['숏컷', '단발', '중단발', '레이어드', '긴머리']
      : g === 'male'
        ? ['크롭', '짧은 머리', '단정', '댄디', '가르마', '애즈펌', '장발', '리프컷']
        : ['숏컷', '크롭', '단발', '댄디', '가르마', '장발'],
    race: ['동양인', '동남아인', '혼혈', '백인', '흑인'],
    eyelid: ['무쌍', '얇은 속쌍', '자연스러운 유쌍', '진한 유쌍']
  };
}

function bandLabel(v, bands) {
  for (const b of bands) if (v <= b.upto) return b.l;
  return bands[bands.length - 1].l;
}

function sliderRow(id, label) {
  const isSet = state.appearance[id] !== null;
  return `
    <div class="ms-row" data-field="${id}">
      <div class="ms-top">
        <span class="ms-label">${label}</span>
        <span class="ms-value" id="${id}-val"></span>
        <button class="ms-reset" id="${id}-reset" style="${isSet ? '' : 'display:none'}">상관없음</button>
      </div>
      <div class="slider-body${isSet ? ' active' : ''}">
        <div class="slider-content" id="${id}-content"></div>
        <button class="slider-overlay" id="${id}-overlay">
          <span>상관없음</span>
          <small>터치해서 설정</small>
        </button>
      </div>
    </div>`;
}

// ===== Screen 3: Appearance =====
registerScreen(3, () => {
  return `
    <div class="custom-screen">
      <div class="custom-header">
        <span class="section-tag">외형</span>
        <button class="custom-back" id="app-back">← 돌아가기</button>
      </div>

      <div class="celeb-box">
        <div class="celeb-input-wrap">
          <input type="text" class="celeb-input" id="celeb-input"
            placeholder="닮았으면 하는 연예인" value="${state.appearance.celebRef || ''}" />
          <button class="celeb-go" id="celeb-go">적용</button>
        </div>
      </div>
      <button class="btn-skip" id="app-skip" style="margin-top: 8px; margin-bottom: 24px;">전부 상관없음 (건너뛰기)</button>

      <div class="custom-divider"></div>

      <div class="multi-sliders">
        ${sliderRow('race', '인종')}
        ${sliderRow('height', '키')}
        ${sliderRow('bodyType', '체형')}
        ${sliderRow('eyelid', '쌍꺼풀')}
        ${sliderRow('hair', '헤어')}
      </div>

      <button class="btn btn-primary btn-full" id="app-done" style="margin-top: var(--sp-xl);">완료</button>
    </div>`;
});

registerScreen('3_init', (el) => {
  const o = getOpts();
  const activated = {
    height: state.appearance.height !== null,
    bodyType: state.appearance.bodyType !== null,
    hair: state.appearance.hair !== null,
    race: state.appearance.race !== null,
    eyelid: state.appearance.eyelid !== null
  };

  // HEIGHT
  const hDef = state.appearance.height || o.height.def;
  el.querySelector('#height-content').innerHTML = `
        <div class="ms-badge" id="h-badge">${bandLabel(hDef, o.height.bands)}</div>
        <input type="range" class="ms-range" id="h-range"
            min="${o.height.min}" max="${o.height.max}" value="${hDef}" step="1" />`;
  el.querySelector('#height-val').textContent = activated.height ? hDef + 'cm' : '';

  const hRange = el.querySelector('#h-range');
  const hBadge = el.querySelector('#h-badge');
  hRange.addEventListener('input', () => {
    el.querySelector('#height-val').textContent = +hRange.value + 'cm';
    hBadge.textContent = bandLabel(+hRange.value, o.height.bands);
  });

  // BODY TYPE
  const bDef = state.appearance.bodyType !== null ? state.appearance.bodyType : 50;
  el.querySelector('#bodyType-content').innerHTML = `
        <input type="range" class="ms-range" id="b-range" min="0" max="100" value="${bDef}" step="1" />
        <div class="ms-ticks">${o.body.map(t => `<span class="ms-tick">${t}</span>`).join('')}</div>`;
  el.querySelector('#bodyType-val').textContent = activated.bodyType ? closestLabel(bDef, o.body) : '';

  const bRange = el.querySelector('#b-range');
  bRange.addEventListener('input', () => {
    el.querySelector('#bodyType-val').textContent = closestLabel(+bRange.value, o.body);
  });

  // HAIR
  const hiDef = state.appearance.hair !== null ? state.appearance.hair : 50;
  el.querySelector('#hair-content').innerHTML = `
        <input type="range" class="ms-range" id="hr-range" min="0" max="100" value="${hiDef}" step="1" />
        <div class="ms-ticks">${o.hair.map(t => `<span class="ms-tick">${t}</span>`).join('')}</div>`;
  el.querySelector('#hair-val').textContent = activated.hair ? closestLabel(hiDef, o.hair) : '';

  const hrRange = el.querySelector('#hr-range');
  hrRange.addEventListener('input', () => {
    el.querySelector('#hair-val').textContent = closestLabel(+hrRange.value, o.hair);
  });

  // RACE
  const rDef = state.appearance.race !== null ? state.appearance.race : 50;
  el.querySelector('#race-content').innerHTML = `
        <input type="range" class="ms-range" id="r-range" min="0" max="100" value="${rDef}" step="1" />
        <div class="ms-ticks">${o.race.map(t => `<span class="ms-tick">${t}</span>`).join('')}</div>`;
  el.querySelector('#race-val').textContent = activated.race ? closestLabel(rDef, o.race) : '';

  const rRange = el.querySelector('#r-range');
  rRange.addEventListener('input', () => {
    el.querySelector('#race-val').textContent = closestLabel(+rRange.value, o.race);
  });

  // EYELID
  const eDef = state.appearance.eyelid !== null ? state.appearance.eyelid : 0;
  el.querySelector('#eyelid-content').innerHTML = `
        <input type="range" class="ms-range" id="e-range" min="0" max="100" value="${eDef}" step="1" />
        <div class="ms-ticks">${o.eyelid.map(t => `<span class="ms-tick">${t}</span>`).join('')}</div>`;
  el.querySelector('#eyelid-val').textContent = activated.eyelid ? closestLabel(eDef, o.eyelid) : '';

  const eRange = el.querySelector('#e-range');
  eRange.addEventListener('input', () => {
    el.querySelector('#eyelid-val').textContent = closestLabel(+eRange.value, o.eyelid);
  });

  // Overlay + reset
  const fields = ['height', 'bodyType', 'hair', 'race', 'eyelid'];
  fields.forEach(f => {
    const overlay = el.querySelector(`#${f}-overlay`);
    const body = overlay.closest('.slider-body');
    const resetBtn = el.querySelector(`#${f}-reset`);
    if (activated[f]) body.classList.add('active');

    overlay.addEventListener('click', () => {
      activated[f] = true;
      body.classList.add('active');
      resetBtn.style.display = '';
      const range = body.querySelector('input[type="range"]');
      if (range) range.dispatchEvent(new Event('input'));
    });

    resetBtn.addEventListener('click', () => {
      activated[f] = false;
      body.classList.remove('active');
      resetBtn.style.display = 'none';
      el.querySelector(`#${f}-val`).textContent = '';
    });
  });

  // Celebrity shortcut
  const multiSliders = el.querySelector('.multi-sliders');
  el.querySelector('#celeb-go').addEventListener('click', () => {
    const name = el.querySelector('#celeb-input').value.trim();
    if (!name) {
      // Unlock if empty
      state.appearance.celebRef = null;
      multiSliders.style.opacity = '1';
      multiSliders.style.pointerEvents = 'auto';
      el.querySelector('#celeb-go').textContent = '적용';
      return;
    }

    // Lock sliders, rely on Backend Ops
    state.appearance.celebRef = name;
    state.appearance.skipAll = false;

    // Reset individual sliders to avoid mixing logic
    fields.forEach(f => {
      activated[f] = false;
      const body = el.querySelector(`#${f}-overlay`).closest('.slider-body');
      body.classList.remove('active');
      el.querySelector(`#${f}-reset`).style.display = 'none';
      if (el.querySelector(`#${f}-val`)) el.querySelector(`#${f}-val`).textContent = '';
      state.appearance[f] = null;
    });

    multiSliders.style.opacity = '0.3';
    multiSliders.style.pointerEvents = 'none';
    multiSliders.style.transition = 'opacity 0.3s ease';

    el.querySelector('#celeb-go').textContent = '✓ 적용됨';
  });

  // Hydrate celebRef if navigating back
  if (state.appearance.celebRef) {
    el.querySelector('#celeb-input').value = state.appearance.celebRef;
    multiSliders.style.opacity = '0.3';
    multiSliders.style.pointerEvents = 'none';
    el.querySelector('#celeb-go').textContent = '✓ 적용됨';
  }

  // Done
  el.querySelector('#app-done').addEventListener('click', () => {
    state.appearance.skipAll = false;
    state.appearance.height = activated.height ? +hRange.value : null;
    state.appearance.bodyType = activated.bodyType ? +bRange.value : null;
    state.appearance.hair = activated.hair ? +hrRange.value : null;
    state.appearance.race = activated.race ? +rRange.value : null;
    state.appearance.eyelid = activated.eyelid ? +eRange.value : null;
    state.appearanceDone = true;
    history.back();
  });

  el.querySelector('#app-skip').addEventListener('click', () => {
    state.appearance.skipAll = true;
    history.back();
  });
  el.querySelector('#app-back').addEventListener('click', () => history.back());
});

function closestLabel(val, labels) {
  const idx = Math.round(val / 100 * (labels.length - 1));
  return labels[Math.max(0, Math.min(idx, labels.length - 1))];
}
