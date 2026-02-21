import { registerScreen, navigateTo, state } from '../app.js';

const API_BASE = 'http://localhost:8000';

let bracket = [];
let round = '8강';
let matchIndex = 0;
let sessionId = null;

registerScreen(12, () => {
  // Initialize bracket with 8 profiles
  bracket = [...state.generatedProfiles];
  round = '8강';
  matchIndex = 0;
  sessionId = null;

  const p1 = bracket[0];
  const p2 = bracket[1];

  return `
    <div style="text-align:center; margin-bottom: var(--sp-md);">
      <h2 class="screen-title">🏆 베프 월드컵</h2>
      <p style="color: var(--accent-bright); font-weight: 600; font-size: var(--fs-lg);" id="round-label">${round}</p>
      <p class="screen-subtitle" id="match-label">매치 1</p>
    </div>

    <div class="vs-container" id="vs-container">
      ${renderMatchup(p1, p2)}
    </div>
  `;
});

function renderMatchup(p1, p2) {
  return `
    <div class="worldcup-card" data-id="${p1.id}" id="wc-card-1">
      <div class="worldcup-card-img" style="${p1.imageUrl ? '' : 'background:' + p1.gradient + ';'} display:flex; align-items:center; justify-content:center; font-size:3rem; overflow:hidden;">
        ${p1.imageUrl
      ? `<img src="${p1.imageUrl}" alt="${p1.name}" style="width:100%;height:100%;object-fit:cover;" />`
      : p1.emoji}
      </div>
      <div class="worldcup-card-info">
        <div class="profile-card-name">${p1.name}</div>
        <div class="profile-card-meta">
          <span>📍 ${p1.neighborhood} (${p1.distance}km)</span>
          <span>🎂 ${p1.age}세</span>
        </div>
        <div class="profile-card-meta mt-sm">
          <span>💼 ${p1.job}</span>
        </div>
        <div class="profile-card-meta mt-sm">
          <span>❤️ ${p1.hobby}</span>
        </div>
      </div>
    </div>

    <div class="vs-badge">VS</div>

    <div class="worldcup-card" data-id="${p2.id}" id="wc-card-2">
      <div class="worldcup-card-img" style="${p2.imageUrl ? '' : 'background:' + p2.gradient + ';'} display:flex; align-items:center; justify-content:center; font-size:3rem; overflow:hidden;">
        ${p2.imageUrl
      ? `<img src="${p2.imageUrl}" alt="${p2.name}" style="width:100%;height:100%;object-fit:cover;" />`
      : p2.emoji}
      </div>
      <div class="worldcup-card-info">
        <div class="profile-card-name">${p2.name}</div>
        <div class="profile-card-meta">
          <span>📍 ${p2.neighborhood} (${p2.distance}km)</span>
          <span>🎂 ${p2.age}세</span>
        </div>
        <div class="profile-card-meta mt-sm">
          <span>💼 ${p2.job}</span>
        </div>
        <div class="profile-card-meta mt-sm">
          <span>❤️ ${p2.hobby}</span>
        </div>
      </div>
    </div>
  `;
}

let winners = [];

registerScreen('12_init', (el) => {
  winners = [];

  // 세션 생성 (비동기 — UI 블로킹 없이)
  if (state._surveyId) {
    fetch(`${API_BASE}/beff/worldcup/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ survey_id: state._surveyId }),
    })
      .then(r => r.json())
      .then(data => { sessionId = data.session_id; })
      .catch(err => console.error('세션 생성 실패:', err));
  }

  attachMatchEvents(el);
});

function attachMatchEvents(el) {
  const card1 = el.querySelector('#wc-card-1');
  const card2 = el.querySelector('#wc-card-2');

  const handlePick = (selectedId) => {
    const pairIndex = matchIndex * 2;
    const p1 = bracket[pairIndex];
    const p2 = bracket[pairIndex + 1];
    const winner = bracket.find(p => p.id === selectedId);
    const loser = (winner === p1) ? p2 : p1;
    if (!winner) return;

    winners.push(winner);

    // 라운드 결과 API 전송 (비동기)
    if (sessionId && winner.imageId && loser.imageId) {
      fetch(`${API_BASE}/beff/worldcup/round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          round_name: round,
          winner_id: winner.imageId,
          loser_id: loser.imageId,
        }),
      }).catch(err => console.error('라운드 저장 실패:', err));
    }

    matchIndex++;
    const nextPairIndex = matchIndex * 2;

    if (nextPairIndex < bracket.length) {
      // Next match in this round
      const np1 = bracket[nextPairIndex];
      const np2 = bracket[nextPairIndex + 1];
      const container = el.querySelector('#vs-container');
      const matchLabel = el.querySelector('#match-label');

      container.style.opacity = '0';
      container.style.transform = 'scale(0.95)';

      setTimeout(() => {
        container.innerHTML = renderMatchup(np1, np2);
        if (matchLabel) matchLabel.textContent = `매치 ${matchIndex + 1}`;
        container.style.transition = 'all 0.35s var(--ease-out)';
        container.style.opacity = '1';
        container.style.transform = 'scale(1)';
        attachMatchEvents(el);
      }, 350);
    } else {
      // Round complete — advance
      if (winners.length === 1) {
        // Final winner!
        state.worldCupWinner = winners[0];

        // 월드컵 완료 API (비동기)
        if (sessionId && winners[0].imageId) {
          fetch(`${API_BASE}/beff/worldcup/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              final_image_id: winners[0].imageId,
            }),
          }).catch(err => console.error('월드컵 완료 저장 실패:', err));
        }

        setTimeout(() => navigateTo(13), 500);
        return;
      }

      // Next round
      bracket = [...winners];
      winners = [];
      matchIndex = 0;

      if (bracket.length === 4) round = '4강';
      else if (bracket.length === 2) round = '결승';

      const roundLabel = el.querySelector('#round-label');
      const matchLabel = el.querySelector('#match-label');
      const container = el.querySelector('#vs-container');

      if (roundLabel) roundLabel.textContent = round;
      if (matchLabel) matchLabel.textContent = '매치 1';

      container.style.opacity = '0';
      setTimeout(() => {
        const np1 = bracket[0];
        const np2 = bracket[1];
        container.innerHTML = renderMatchup(np1, np2);
        container.style.opacity = '1';
        attachMatchEvents(el);
      }, 350);
    }
  };

  if (card1) card1.addEventListener('click', () => handlePick(parseInt(card1.dataset.id)));
  if (card2) card2.addEventListener('click', () => handlePick(parseInt(card2.dataset.id)));
}
