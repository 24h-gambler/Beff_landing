import { registerScreen, navigateTo, state } from '../app.js';
import { koreanNeighborhoods } from '../data/koreanNeighborhoods.js';

registerScreen(10, () => {
  return `
    <div class="flex-center flex-grow gap-lg" id="location-scanning">
      <div class="loading-particles" style="margin-bottom: var(--sp-lg)">
        <div class="radar-ring"></div>
        <div class="radar-ring"></div>
        <div class="radar-ring"></div>
        <div style="font-size: 3rem; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:10;">📍</div>
      </div>
      <h2 class="screen-title mb-sm" style="margin-top:20px;">내 주변 완벽한 인연 찾기</h2>
      <p class="screen-subtitle">가장 가까운 거리에 있는<br/>이상형을 추천해 드립니다.</p>
      
      <button class="btn btn-primary btn-full mt-lg" id="geo-btn">
        📍 현재 위치 허용하기
      </button>
      <button class="btn btn-ghost mt-sm" id="manual-btn">
        직접 입력하기
      </button>
    </div>

    <div class="flex-center flex-grow gap-lg" id="location-manual" style="display:none; width:100%; max-width: 320px; margin: 0 auto;">
      <h2 class="screen-title mb-sm">동네 직접 검색</h2>
      <p class="screen-subtitle">내 지역을 입력해주세요.</p>

      <div style="position: relative; width: 100%;">
        <input type="text" class="location-search" id="neighborhood-input" placeholder="동 단위로 검색 (예: 연남동)" autocomplete="off">
        <div class="location-results" id="neighborhood-results"></div>
      </div>

      <button class="btn btn-primary btn-full mt-lg" id="location-confirm" disabled>
        선택 완료
      </button>
    </div>
  `;
});

registerScreen('10_init', (el) => {
  const scanningView = el.querySelector('#location-scanning');
  const manualView = el.querySelector('#location-manual');

  const searchInput = el.querySelector('#neighborhood-input');
  const resultsDiv = el.querySelector('#neighborhood-results');
  const confirmBtn = el.querySelector('#location-confirm');

  let selectedRealValue = '';

  // Auto-complete logici
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    resultsDiv.innerHTML = '';
    selectedRealValue = '';
    confirmBtn.disabled = true;

    if (!query) {
      resultsDiv.style.display = 'none';
      return;
    }

    const matches = koreanNeighborhoods.filter(n => n.toLowerCase().includes(query)).slice(0, 30); // Max 30 results for performance
    if (matches.length > 0) {
      matches.forEach(m => {
        const item = document.createElement('div');
        item.className = 'location-result-item';
        item.dataset.value = m;
        item.textContent = m;
        resultsDiv.appendChild(item);
      });
      resultsDiv.style.display = 'block';
    } else {
      resultsDiv.style.display = 'none';
    }
  });

  // Handle clicks via event delegation
  resultsDiv.addEventListener('click', (e) => {
    const item = e.target.closest('.location-result-item');
    if (item) {
      const val = item.dataset.value;
      searchInput.value = val;
      selectedRealValue = val;
      resultsDiv.style.display = 'none';
      confirmBtn.disabled = false;
    }
  });

  // Hide dropdown if clicked outside
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput && !resultsDiv.contains(e.target)) {
      resultsDiv.style.display = 'none';
    }
  });

  confirmBtn.addEventListener('click', () => {
    state.neighborhood = selectedRealValue;
    navigateTo(11); // Route to Loading
  });

  const geoBtn = el.querySelector('#geo-btn');
  const manualBtn = el.querySelector('#manual-btn');

  geoBtn.addEventListener('click', () => {
    geoBtn.innerHTML = '위치 확인 중...';
    geoBtn.disabled = true;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success: Use randomly selected real neighborhood for MVP fallback
          state.neighborhood = koreanNeighborhoods[Math.floor(Math.random() * koreanNeighborhoods.length)];
          setTimeout(() => navigateTo(11), 1500); // Route to loading
        },
        (error) => {
          // Denied or failed
          console.warn('Geolocation failed or denied:', error);
          alert('위치 권한이 차단되었습니다. 브라우저 설정에서 위치 권한을 허용하시거나 직접 검색해주세요.');
          geoBtn.innerHTML = '📍 현재 위치 허용하기';
          geoBtn.disabled = false;
          scanningView.style.display = 'none';
          manualView.style.display = 'flex';
        },
        { timeout: 5000 }
      );
    } else {
      alert('현재 브라우저 환경에서 위치 권한을 지원하지 않습니다.');
      geoBtn.innerHTML = '📍 현재 위치 허용하기';
      geoBtn.disabled = false;
      scanningView.style.display = 'none';
      manualView.style.display = 'flex';
    }
  });

  manualBtn.addEventListener('click', () => {
    scanningView.style.display = 'none';
    manualView.style.display = 'flex';
  });
});
