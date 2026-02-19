import { registerScreen, navigateTo, state } from '../app.js';

registerScreen(13, () => {
  const winner = state.worldCupWinner;
  if (!winner) return '<div class="flex-center flex-grow"><p>오류가 발생했어요</p></div>';

  return `
    <div class="flex-center flex-grow gap-lg">
      <div style="position: relative;">
        <div class="confirm-img" style="background: ${winner.gradient}; display:flex; align-items:center; justify-content:center; font-size: 4rem; width: 200px; height: 200px;">
          ${winner.emoji}
        </div>
      </div>

      <div class="text-center mt-lg">
        <h2 style="font-size: var(--fs-2xl); font-weight: 800;">
          <span class="text-gradient">${winner.name}</span>님을
        </h2>
        <h2 style="font-size: var(--fs-2xl); font-weight: 800; margin-top: 4px;">
          친구 추가하시겠습니까?
        </h2>
      </div>

      <div class="text-center mt-md">
        <p style="color: var(--text-secondary); font-size: var(--fs-sm);">
          ${winner.neighborhood} • ${winner.distance}km • ${winner.age}세<br/>
          ${winner.job} • ${winner.hobby}
        </p>
      </div>

      <button class="btn btn-primary btn-lg btn-full mt-xl" id="confirm-yes"
        style="max-width: 280px;">
        네 🎉
      </button>
    </div>
  `;
});

registerScreen('13_init', (el) => {
  el.querySelector('#confirm-yes').addEventListener('click', () => {
    navigateTo(14);
  });
});
