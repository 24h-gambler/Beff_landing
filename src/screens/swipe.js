import { registerScreen, navigateTo, state, effectiveBeffGender } from '../app.js';
import { getSwipeImages, getPlaceholderGradient } from '../data/imagePool.js';

let cards = [];
let currentIndex = 0;
let startX = 0;
let currentX = 0;
let isDragging = false;

registerScreen(9, () => {
  // Build legacy preferences from new state for getSwipeImages compatibility
  const g = effectiveBeffGender();
  const prefs = {
    gender: g === 'female' ? '이성' : '동성',
    race: state.appearance?.race || '상관없음',
    bodyType: state.appearance?.bodyType || '보통',
  };
  cards = getSwipeImages(prefs);
  currentIndex = 0;
  state.swipeLikes = [];

  return `
    <div class="flex-center flex-grow">
      <h2 class="screen-title">끌리는 스타일을 골라주세요</h2>
      <p class="screen-subtitle">좌우로 스와이프!</p>

      <div class="swipe-area" id="swipe-area">
        ${renderCard(0)}
      </div>

      <div class="mt-md" style="display: flex; gap: var(--sp-xl); align-items: center;">
        <button class="btn btn-secondary" id="swipe-nope" style="font-size: 1.5rem; padding: 16px 24px; border-radius: 50%;">👎</button>
        <span style="color: var(--text-muted); font-size: var(--fs-sm);" id="swipe-counter">1 / ${cards.length}</span>
        <button class="btn btn-secondary" id="swipe-like" style="font-size: 1.5rem; padding: 16px 24px; border-radius: 50%;">👍</button>
      </div>
    </div>
  `;
});

function renderCard(index) {
  if (index >= cards.length) return '';
  const card = cards[index];
  return `
    <div class="swipe-card" id="active-card" style="background: ${getPlaceholderGradient(index)};">
      <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;">
        <span style="font-size:4rem;">🧑</span>
        <span style="font-size:var(--fs-lg);font-weight:600;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.3);">${card.label}</span>
      </div>
      <div class="swipe-overlay nope" id="overlay-nope">
        <span class="swipe-overlay-text">NOPE</span>
      </div>
      <div class="swipe-overlay like" id="overlay-like">
        <span class="swipe-overlay-text">LIKE</span>
      </div>
    </div>
  `;
}

function handleSwipe(direction, el) {
  const card = el.querySelector('#active-card');
  if (!card) return;

  if (direction === 'like') {
    state.swipeLikes.push(currentIndex);
  }

  // Animate out
  card.style.transition = 'transform 0.4s var(--ease-out), opacity 0.4s';
  card.style.transform = `translateX(${direction === 'like' ? 400 : -400}px) rotate(${direction === 'like' ? 20 : -20}deg)`;
  card.style.opacity = '0';

  currentIndex++;

  setTimeout(() => {
    if (currentIndex >= cards.length) {
      navigateTo(11); // Skip location (10) -> Go straight to loading (11)
      return;
    }

    const area = el.querySelector('#swipe-area');
    if (counter) counter.textContent = `${currentIndex + 1} / ${cards.length}`;
  }, 400);
}

function attachCardEvents(el) {
  const card = el.querySelector('#active-card');
  if (!card) return;

  const onStart = (x) => {
    isDragging = true;
    startX = x;
    card.style.transition = 'none';
  };

  const onMove = (x) => {
    if (!isDragging) return;
    currentX = x - startX;
    const rotation = currentX * 0.1;
    card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;

    const nopeOverlay = el.querySelector('#overlay-nope');
    const likeOverlay = el.querySelector('#overlay-like');
    const absX = Math.abs(currentX);
    const opacity = Math.min(absX / 100, 1);

    if (currentX < 0 && nopeOverlay) {
      nopeOverlay.style.opacity = opacity;
      if (likeOverlay) likeOverlay.style.opacity = 0;
    } else if (currentX > 0 && likeOverlay) {
      likeOverlay.style.opacity = opacity;
      if (nopeOverlay) nopeOverlay.style.opacity = 0;
    }
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    if (Math.abs(currentX) > 80) {
      handleSwipe(currentX > 0 ? 'like' : 'nope', el);
    } else {
      card.style.transition = 'transform 0.3s var(--ease-spring)';
      card.style.transform = 'translateX(0) rotate(0)';
      const nopeOverlay = el.querySelector('#overlay-nope');
      const likeOverlay = el.querySelector('#overlay-like');
      if (nopeOverlay) nopeOverlay.style.opacity = 0;
      if (likeOverlay) likeOverlay.style.opacity = 0;
    }
    currentX = 0;
  };

  // Mouse events
  card.addEventListener('mousedown', e => onStart(e.clientX));
  document.addEventListener('mousemove', e => onMove(e.clientX));
  document.addEventListener('mouseup', onEnd);

  // Touch events
  card.addEventListener('touchstart', e => onStart(e.touches[0].clientX), { passive: true });
  document.addEventListener('touchmove', e => onMove(e.touches[0].clientX), { passive: true });
  document.addEventListener('touchend', onEnd);
}

registerScreen('9_init', (el) => {
  attachCardEvents(el);

  el.querySelector('#swipe-nope')?.addEventListener('click', () => handleSwipe('nope', el));
  el.querySelector('#swipe-like')?.addEventListener('click', () => handleSwipe('like', el));
});
