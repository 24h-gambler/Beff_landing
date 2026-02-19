import { registerScreen, state } from '../app.js';

registerScreen(14, () => {
  const winner = state.worldCupWinner;
  const name = winner ? winner.name : '베프';

  return `
    <div class="flex-center flex-grow gap-lg">
      <div class="success-check">🎉</div>

      <h2 class="screen-title" style="font-size: var(--fs-2xl);">
        <span class="text-gradient">${name}</span>님과<br/>
        친구가 되었어요!
      </h2>

      <p class="screen-subtitle" style="max-width: 280px; line-height: 1.7;">
        BEFF는 곧 정식 런칭됩니다.<br/>
        이메일을 남겨주시면<br/>
        <strong style="color: var(--text-primary);">가장 먼저 알려드릴게요!</strong>
      </p>

      <div style="width: 100%; max-width: 320px;" id="email-form">
        <input type="email" class="email-input" id="email-input"
          placeholder="이메일 주소를 입력하세요" />
        <button class="btn btn-primary btn-full mt-md" id="email-submit">
          런칭 알림 받기 🔔
        </button>
      </div>

      <div id="email-success" style="display: none; text-align: center; width: 100%;">
        <div class="success-check" style="width: 60px; height: 60px; font-size: 1.8rem;">✅</div>
        <p style="font-size: var(--fs-lg); font-weight: 700; margin-top: var(--sp-md);">
          등록 완료!
        </p>
        <p style="color: var(--text-secondary); margin-top: var(--sp-sm); font-size: var(--fs-sm); line-height: 1.6;">
          런칭 시 가장 먼저 알려드릴게요 💌<br/>
          BEFF에서 ${name}님이 기다리고 있어요!
        </p>
      </div>

      <p style="color: var(--text-muted); font-size: var(--fs-xs); margin-top: var(--sp-lg); text-align: center; max-width: 260px;">
        수집된 이메일은 런칭 알림 용도로만 사용되며,<br/>
        그 이후에는 자동 파기됩니다.
      </p>
    </div>
  `;
});

registerScreen('14_init', (el) => {
  const input = el.querySelector('#email-input');
  const submitBtn = el.querySelector('#email-submit');
  const form = el.querySelector('#email-form');
  const successMsg = el.querySelector('#email-success');

  submitBtn.addEventListener('click', () => {
    const email = input.value.trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      input.style.borderColor = 'var(--danger)';
      input.placeholder = '올바른 이메일을 입력해주세요';
      setTimeout(() => {
        input.style.borderColor = '';
        input.placeholder = '이메일 주소를 입력하세요';
      }, 2000);
      return;
    }

    // Save to localStorage
    state.email = email;
    const emails = JSON.parse(localStorage.getItem('beff_emails') || '[]');
    emails.push({
      email,
      timestamp: new Date().toISOString(),
      appearance: { ...state.appearance },
      inner: { ...state.inner },
      userAge: state.userAge,
      userGender: state.userGender,
      beffGenderPref: state.beffGenderPref,
      neighborhood: state.neighborhood,
      winner: state.worldCupWinner ? state.worldCupWinner.name : null,
    });
    localStorage.setItem('beff_emails', JSON.stringify(emails));

    // Show success
    form.style.display = 'none';
    successMsg.style.display = 'block';
  });
});
