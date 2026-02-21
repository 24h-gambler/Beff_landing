import { registerScreen, state } from '../app.js';

registerScreen(13, () => {
  const winner = state.worldCupWinner;
  const name = winner ? winner.name : '베프';

  return `
    <div class="flex-center flex-grow gap-lg">
      <div class="success-check">🎉</div>

      <h2 class="screen-title" style="font-size: var(--fs-xl);">
        선택하신 <span class="text-gradient">${name}</span>님에게<br/>
        회원님의 프로필을 전달했습니다.
      </h2>

      <p class="screen-subtitle" style="max-width: 290px; line-height: 1.7;">
        상대방이 접속하여 대화를 수락하면,<br/>
        <strong style="color: var(--text-primary);">어플을 통해 즉시 연락을 이어드릴게요!</strong>
      </p>

      <div style="width: 100%; max-width: 320px;" id="email-form">
        <input type="email" class="email-input" id="email-input"
          placeholder="알림 받을 이메일을 입력하세요" />
        <button class="btn btn-primary btn-full mt-md" id="email-submit">
          연락 기다리기 💌
        </button>
      </div>

      <div id="email-success" style="display: none; text-align: center; width: 100%; flex-direction: column; align-items: center;">
        <div class="success-check" style="width: 60px; height: 60px; font-size: 1.8rem; margin: 0 auto;">🎉</div>
        <p style="font-size: var(--fs-lg); font-weight: 700; margin-top: var(--sp-md);">
          사전 등록 완료!
        </p>

        ${winner ? `
        <div class="confirm-img" style="${winner.imageUrl ? '' : 'background:' + winner.gradient + ';'} display:flex; align-items:center; justify-content:center; font-size: 3.5rem; width: 140px; height: 140px; margin: var(--sp-md) auto var(--sp-sm) auto; border-radius: 50%; overflow: hidden;">
          ${winner.imageUrl
        ? `<img src="${winner.imageUrl}" alt="${winner.name}" style="width:100%;height:100%;object-fit:cover;" />`
        : winner.emoji}
        </div>
        <h3 style="font-size: var(--fs-lg); font-weight: 800; margin-bottom: 4px;">${winner.name}</h3>
        <p style="color: var(--text-secondary); font-size: var(--fs-xs); text-align: center; margin-bottom: var(--sp-lg);">
          ${winner.neighborhood} • ${winner.distance}km • ${winner.age}세<br/>
          ${winner.job} • ${winner.hobby}
        </p>
        ` : ''}

        <p style="color: var(--text-secondary); font-size: var(--fs-sm); line-height: 1.6; margin-bottom: var(--sp-lg);">
          정식 어플이 출시되면 이메일로<br/>
          가장 먼저 연락을 이어드리겠습니다.
        </p>

        <button class="btn btn-secondary btn-full" id="share-btn" style="max-width: 320px; font-weight: 700; border: 1px solid var(--border-color); color: var(--text-primary); background: transparent;">
          내 동네 이상형 공유하기 🚀
        </button>
      </div>

      <p class="anim-fade-in-4" style="color: var(--text-muted); font-size: var(--fs-xs); margin-top: var(--sp-lg); text-align: center; max-width: 260px;">
        수집된 이메일은 출시 알림 용도로만 사용되며,<br/>
        안전하게 암호화되어 보관됩니다.
      </p>
    </div>
  `;
});

registerScreen('13_init', (el) => {
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

    function buildNanoBananaPrompt(app, gender) {
      if (app.celebRef) return `A photorealistic portrait of someone who looks exactly like ${app.celebRef}, highest quality, 8k resolution, cinematic lighting`;

      let promptArr = ['Photorealistic portrait, highest quality, 8k resolution, cinematic lighting, 85mm lens'];

      if (gender) promptArr.push((gender === '남성' ? 'male' : 'female'));

      if (app.race !== null) {
        const r = app.race;
        if (r < 15) promptArr.push('100% pure East Asian (Korean/Japanese/Chinese) bone structure and facial features');
        else if (r < 40) promptArr.push('100% pure Southeast Asian features');
        else if (r < 65) promptArr.push('50/50 Eurasian mixed race, highly attractive blend');
        else if (r < 90) promptArr.push('100% Caucasian bone structure and facial features');
        else promptArr.push('100% Black African descent features');
      }

      if (app.eyelid !== null) {
        const e = app.eyelid;
        if (e < 25) promptArr.push('monolid eyes without double eyelid crease');
        else if (e < 50) promptArr.push('very thin inner double eyelids (sokssang)');
        else if (e < 75) promptArr.push('natural medium double eyelids');
        else promptArr.push('thick, deep outline double eyelids');
      }

      if (app.height !== null) {
        promptArr.push(`approximate height indicator: ${app.height}cm`);
      }

      if (app.bodyType !== null) {
        promptArr.push(`body composition metric (0=very skinny/slim, 100=muscular/curvy): ${app.bodyType}/100`);
      }

      return promptArr.join(', ');
    }

    // Save to localStorage
    state.email = email;
    const emails = JSON.parse(localStorage.getItem('beff_emails') || '[]');

    // Explicit AI prompt for downstream pipeline
    const generatedPrompt = buildNanoBananaPrompt(state.appearance, state.beffGenderPref);

    emails.push({
      email,
      timestamp: new Date().toISOString(),
      userAge: state.userAge,
      userGender: state.userGender,
      beffGenderPref: state.beffGenderPref,
      neighborhood: state.neighborhood,
      // The following objects contain the exact numerical values (0-100) 
      // or strings (e.g., celebRef, race) requested by the user
      appearancePrefs: { ...state.appearance },
      innerPrefs: { ...state.inner },
      worldCupWinner: state.worldCupWinner ? state.worldCupWinner.name : null,
      nanoBananaPrompt: generatedPrompt,
      generatedPhotoUrl: null,
    });
    localStorage.setItem('beff_emails', JSON.stringify(emails));

    // Show success
    form.style.display = 'none';
    successMsg.style.display = 'flex';

    // Share button logic
    const shareBtn = el.querySelector('#share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: 'BEFF - 내 주변 완벽한 이상형 월드컵',
            text: `나의 완벽한 1위 이상형은 ${state.worldCupWinner ? state.worldCupWinner.name : '누군가'}님! 내 동네 반경 5km 안에는 어떤 사람들이 있을까? 🔥`,
            url: window.location.origin
          }).catch(console.error);
        } else {
          alert('웹 브라우저의 공유하기 기능을 지원하지 않습니다. 링크를 복사해주세요.');
        }
      });
    }
  });
});
