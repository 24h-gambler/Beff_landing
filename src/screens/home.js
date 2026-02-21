import { registerScreen, navigateTo } from '../app.js';

// Inline SVG matching the BEFF logo (glassmorphic speech bubbles)
const logoSVG = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bubble1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a8e063"/>
      <stop offset="50%" stop-color="#7ec8e3"/>
      <stop offset="100%" stop-color="#b8d4e3"/>
    </linearGradient>
    <linearGradient id="bubble2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5af19"/>
      <stop offset="60%" stop-color="#f7c26b"/>
      <stop offset="100%" stop-color="#f093fb"/>
    </linearGradient>
    <linearGradient id="dot1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a8e063"/>
      <stop offset="100%" stop-color="#56ab2f"/>
    </linearGradient>
    <linearGradient id="dot2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5af19"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <!-- Left speech bubble -->
  <path d="M44 70 C44 44, 66 30, 96 30 C126 30, 144 44, 144 70 C144 96, 126 110, 96 110 C86 110, 76 108, 68 104 L48 116 L56 100 C48 92, 44 82, 44 70Z" fill="url(#bubble1)" opacity="0.88" filter="url(#glow)"/>
  <!-- Highlight on left -->
  <ellipse cx="86" cy="56" rx="22" ry="14" fill="white" opacity="0.25"/>
  <!-- Right speech bubble -->
  <path d="M76 85 C76 62, 100 50, 124 50 C148 50, 168 62, 168 85 C168 108, 148 120, 124 120 C116 120, 108 118, 100 114 L80 124 L88 110 C80 102, 76 94, 76 85Z" fill="url(#bubble2)" opacity="0.85" filter="url(#glow)"/>
  <!-- Highlight on right -->
  <ellipse cx="132" cy="72" rx="18" ry="12" fill="white" opacity="0.2"/>
  <!-- Small decorative circles -->
  <circle cx="60" cy="24" r="12" fill="url(#dot1)" opacity="0.7"/>
  <ellipse cx="60" cy="20" rx="6" ry="4" fill="white" opacity="0.3"/>
  <circle cx="144" cy="20" r="10" fill="url(#dot2)" opacity="0.7"/>
  <ellipse cx="144" cy="17" rx="5" ry="3" fill="white" opacity="0.25"/>
</svg>`;

// ===== Screen 0: Home =====
registerScreen(0, () => `
  <div class="flex-center flex-grow gap-lg" style="padding-top: var(--sp-xl);">
    <div class="beff-logo-wrap anim-fade-in-1">
      <div class="beff-logo-glow"></div>
      ${logoSVG}
    </div>

    <h1 class="screen-title anim-fade-in-2" style="font-size: var(--fs-2xl); margin-top: var(--sp-lg);">
      <span class="text-gradient">BEFF</span>에 오신 걸 환영해요!
    </h1>

    <p class="screen-subtitle anim-fade-in-3" style="max-width: 320px; line-height: 1.7;">
      상상만 하던 완벽한 인연,<br/>지금 내 주변에서 찾아보세요
    </p>

    <button class="btn btn-primary btn-lg anim-fade-in-4" id="start-btn" style="margin-top: var(--sp-lg);">
      BEFF 시작하기
    </button>

    <p class="anim-fade-in-4" style="color: var(--text-muted); font-size: var(--fs-xs); margin-top: var(--sp-2xl);">
      내 주변에서 딱 맞는 베프를 찾아드려요
    </p>
  </div>
`);

registerScreen('0_init', (el) => {
  // Cloud Run warm-up: 페이지 로드 시 서버를 미리 깨움 (콜드스타트 방지)
  fetch('https://beff-api-554500464013.us-central1.run.app/docs', { mode: 'no-cors' }).catch(() => { });

  el.querySelector('#start-btn').addEventListener('click', () => navigateTo(2));
});
