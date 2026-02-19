/**
 * BEFF App Core — State, Registry, Navigation, Routing
 */

const screenNames = {
    0: 'home',
    1: 'profile',
    2: 'hub',
    3: 'appearance',
    4: 'inner',
    9: 'swipe', 10: 'location', 11: 'loading',
    12: 'worldcup', 13: 'confirm', 14: 'email'
};

const screenIds = {};
for (const [id, name] of Object.entries(screenNames)) {
    screenIds[name] = parseInt(id);
}

// ===== Global State =====
export const state = {
    currentScreen: 0,

    // User personal info
    userAge: 25,
    userGender: null,      // '남성' | '여성'

    // Beff gender preference
    beffGenderPref: null,  // 'same' | 'any' | 'opposite'

    // Appearance (set via sliders or celebrity shortcut)
    appearance: {
        celebRef: null,
        height: null,
        bodyType: null,
        hair: null,
        race: null,
        eyelid: null,
    },

    // Inner (set via sliders or celebrity shortcut)
    inner: {
        celebRef: null,
        relationship: null,
        attention: null,
        sharing: null,
        chatStyle: null,
        interests: null,
        job: null,
        jobSpecific: null,
    },

    // Hub completion tracking
    appearanceDone: false,
    innerDone: false,

    // Downstream (unchanged)
    swipeLikes: [],
    neighborhood: null,
    generatedProfiles: [],
    worldCupWinner: null,
    email: null,
};

/**
 * Compute the effective gender of the beff based on user gender + preference.
 * Returns 'male' | 'female' | 'neutral'
 */
export function effectiveBeffGender() {
    const u = state.userGender;
    const p = state.beffGenderPref;
    if (!u || !p || p === 'any') return 'neutral';
    if (p === 'same') return u === '남성' ? 'male' : 'female';
    /* opposite */ return u === '남성' ? 'female' : 'male';
}

// ===== Screen Registry =====
const screens = {};
export function registerScreen(id, renderFn) { screens[id] = renderFn; }

// ===== Navigation =====
const sleep = ms => new Promise(r => setTimeout(r, ms));
let isNavigating = false;

export async function navigateTo(screenId, { replace = false } = {}) {
    if (isNavigating) return;
    isNavigating = true;

    const container = document.getElementById('screen-container');
    const current = container.querySelector('.screen');

    if (current) {
        current.classList.add('exit-left');
        current.classList.remove('active');
        await sleep(300);
        current.remove();
    }

    state.currentScreen = screenId;

    const name = screenNames[screenId] || `s${screenId}`;
    if (replace) {
        window.history.replaceState({ screenId }, '', `#${name}`);
    } else {
        window.history.pushState({ screenId }, '', `#${name}`);
    }

    const renderFn = screens[screenId];
    if (!renderFn) { isNavigating = false; return; }

    const el = document.createElement('div');
    el.className = 'screen';
    el.innerHTML = renderFn();
    container.appendChild(el);

    void el.offsetHeight;
    el.classList.add('active');

    const initFn = screens[`${screenId}_init`];
    if (initFn) initFn(el);

    container.scrollTop = 0;
    isNavigating = false;
}

// ===== Popstate =====
window.addEventListener('popstate', (e) => {
    let id = null;
    if (e.state && typeof e.state.screenId === 'number') {
        id = e.state.screenId;
    } else {
        const hash = window.location.hash.slice(1);
        if (hash && screenIds[hash] !== undefined) id = screenIds[hash];
    }
    if (id !== null && id !== state.currentScreen) {
        navigateTo(id, { replace: true });
    }
});

// ===== Boot =====
export function boot() {
    const hash = window.location.hash.slice(1);
    const id = (hash && screenIds[hash] !== undefined) ? screenIds[hash] : 0;
    navigateTo(id, { replace: true });
}
