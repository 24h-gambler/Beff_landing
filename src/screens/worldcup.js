import { registerScreen, navigateTo, state } from '../app.js';

let bracket = [];
let round = '8강';
let matchIndex = 0;

registerScreen(12, () => {
  // Initialize bracket with 8 profiles
  bracket = [...state.generatedProfiles];
  round = '8강';
  matchIndex = 0;

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
      <div class="worldcup-card-img" style="background: ${p1.gradient}; display:flex; align-items:center; justify-content:center; font-size:3rem;">
        ${p1.emoji}
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
      <div class="worldcup-card-img" style="background: ${p2.gradient}; display:flex; align-items:center; justify-content:center; font-size:3rem;">
        ${p2.emoji}
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
  attachMatchEvents(el);
});

function attachMatchEvents(el) {
  const card1 = el.querySelector('#wc-card-1');
  const card2 = el.querySelector('#wc-card-2');

  const handlePick = (selectedId) => {
    const winner = bracket.find(p => p.id === selectedId);
    if (!winner) return;
    winners.push(winner);

    matchIndex++;
    const pairIndex = matchIndex * 2;

    if (pairIndex < bracket.length) {
      // Next match in this round
      const p1 = bracket[pairIndex];
      const p2 = bracket[pairIndex + 1];
      const container = el.querySelector('#vs-container');
      const matchLabel = el.querySelector('#match-label');

      container.style.opacity = '0';
      container.style.transform = 'scale(0.95)';

      setTimeout(() => {
        container.innerHTML = renderMatchup(p1, p2);
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
        const p1 = bracket[0];
        const p2 = bracket[1];
        container.innerHTML = renderMatchup(p1, p2);
        container.style.opacity = '1';
        attachMatchEvents(el);
      }, 350);
    }
  };

  if (card1) card1.addEventListener('click', () => handlePick(parseInt(card1.dataset.id)));
  if (card2) card2.addEventListener('click', () => handlePick(parseInt(card2.dataset.id)));
}
