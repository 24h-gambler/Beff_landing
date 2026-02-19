import { registerScreen, navigateTo, state, effectiveBeffGender } from '../app.js';
import { randomKoreanName, randomJobTitle, randomHobbies, randomDistance, nearbyNeighborhood } from '../data/profiles.js';
import { getPlaceholderGradient, getPersonEmoji } from '../data/imagePool.js';

registerScreen(11, () => {
    return `
    <div class="loading-screen">
      <div class="loading-particles" id="particles"></div>
      <h2 class="screen-title" style="font-size: var(--fs-xl);">
        ✨ 당신의 베프를 찾고 있어요...
      </h2>
      <p class="screen-subtitle" id="loading-status">AI가 분석 중이에요</p>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" id="loading-bar" style="width: 0%;"></div>
      </div>
      <p style="color: var(--text-muted); font-size: var(--fs-sm);" id="loading-percent">0%</p>
    </div>
  `;
});

registerScreen('11_init', (el) => {
    // Create particles
    const particlesEl = el.querySelector('#particles');
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const angle = (i / 12) * Math.PI * 2;
        const radius = 40 + Math.random() * 20;
        p.style.setProperty('--tx', `${Math.cos(angle) * radius}px`);
        p.style.setProperty('--ty', `${Math.sin(angle) * radius}px`);
        p.style.left = '50%';
        p.style.top = '50%';
        p.style.animationDelay = `${i * 0.15}s`;
        p.style.background = i % 3 === 0 ? '#c084fc' : i % 3 === 1 ? '#f472b6' : '#7c5cff';
        particlesEl.appendChild(p);
    }

    // Loading animation
    const bar = el.querySelector('#loading-bar');
    const percent = el.querySelector('#loading-percent');
    const statusEl = el.querySelector('#loading-status');

    const statuses = [
        { at: 10, text: '취향을 분석하고 있어요...' },
        { at: 30, text: '주변 베프를 탐색 중...' },
        { at: 55, text: 'AI가 얼굴을 그리고 있어요...' },
        { at: 75, text: '프로필을 정리하고 있어요...' },
        { at: 90, text: '거의 다 됐어요! ✨' },
    ];

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 4 + 1;
        if (progress >= 100) progress = 100;

        bar.style.width = `${progress}%`;
        percent.textContent = `${Math.round(progress)}%`;

        const status = statuses.filter(s => s.at <= progress).pop();
        if (status) statusEl.textContent = status.text;

        if (progress >= 100) {
            clearInterval(interval);
            // Generate fake profiles
            generateProfiles();
            setTimeout(() => navigateTo(12), 500);
        }
    }, 80);
});

function generateProfiles() {
    const g = effectiveBeffGender();
    const gender = g === 'female' ? 'female' : g === 'male' ? 'male' : (Math.random() > 0.5 ? 'male' : 'female');
    const neighborhood = state.neighborhood || '강남구 역삼동';
    const dongName = neighborhood.split(' ')[1] || neighborhood;

    state.generatedProfiles = [];
    const usedNames = new Set();

    for (let i = 0; i < 8; i++) {
        let name;
        do {
            name = randomKoreanName(gender);
        } while (usedNames.has(name));
        usedNames.add(name);

        state.generatedProfiles.push({
            id: i,
            name,
            age: 24 + Math.floor(Math.random() * 9),
            job: randomJobTitle(null),
            neighborhood: i < 3 ? dongName : nearbyNeighborhood(neighborhood),
            distance: randomDistance(),
            hobby: randomHobbies(2),
            gradient: getPlaceholderGradient(i),
            emoji: getPersonEmoji(i),
        });
    }
}
