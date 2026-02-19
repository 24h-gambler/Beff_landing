import { registerScreen, navigateTo, state } from '../app.js';
import { neighborhoods } from '../data/profiles.js';

registerScreen(10, () => {
  return `
    <div class="flex-center flex-grow gap-lg" id="location-main">
      <div style="font-size: 3rem;">📍</div>
      <h2 class="screen-title">이제 주변에 사는<br/>베프를 보여드릴게요!</h2>
      <p class="screen-subtitle">내 동네를 선택해주세요</p>

      <div class="select-wrap" style="width: 100%; max-width: 300px;">
        <select id="neighborhood-select">
          <option value="">동네를 선택하세요</option>
          ${neighborhoods.map(n => `<option value="${n}">${n}</option>`).join('')}
        </select>
      </div>

      <button class="btn btn-primary btn-full mt-lg" id="location-confirm" disabled>
        베프 찾으러 가기 🚀
      </button>

      <button class="btn btn-ghost mt-md" id="location-skip">나중에 할게요</button>
    </div>

    <div class="flex-center flex-grow gap-lg" id="location-blocked" style="display:none;">
      <div style="font-size: 3rem;">⚠️</div>
      <h2 class="screen-title">위치 정보 없이는<br/>내 주변의 BEFF를<br/>찾을 수 없어요</h2>
      <p class="screen-subtitle" style="max-width: 240px; line-height: 1.6;">
        동네를 선택해야 딱 맞는<br/>베프를 찾아드릴 수 있어요!
      </p>
      <button class="btn btn-primary btn-full mt-lg" id="location-retry">
        동네 선택하기
      </button>
    </div>
  `;
});

registerScreen('10_init', (el) => {
  const select = el.querySelector('#neighborhood-select');
  const confirmBtn = el.querySelector('#location-confirm');
  const skipBtn = el.querySelector('#location-skip');
  const retryBtn = el.querySelector('#location-retry');
  const mainView = el.querySelector('#location-main');
  const blockedView = el.querySelector('#location-blocked');

  select.addEventListener('change', () => {
    confirmBtn.disabled = !select.value;
  });

  confirmBtn.addEventListener('click', () => {
    state.neighborhood = select.value;
    navigateTo(11); // → loading
  });

  skipBtn.addEventListener('click', () => {
    mainView.style.display = 'none';
    blockedView.style.display = 'flex';
  });

  retryBtn.addEventListener('click', () => {
    blockedView.style.display = 'none';
    mainView.style.display = 'flex';
  });
});
