# 프론트엔드 JS 수정 내역

> **목적**: 기존 플레이스홀더(이모지+그라디언트) 기반 월드컵을 **백엔드 API와 연동**하여 실제 생성 이미지로 교체.
> **백엔드 API**: `http://localhost:8000` (FastAPI)
> **수정일**: 2026-02-21

---

## 수정된 파일 목록

| 파일 | 변경 종류 | 핵심 |
|------|----------|------|
| `src/screens/loading.js` | **대폭 수정** | 가짜 프로필 → API 호출로 교체 |
| `src/screens/worldcup.js` | **대폭 수정** | 이미지 표시 + 세션/라운드 API 연동 |
| `src/screens/email.js` | 소폭 수정 | 우승자 실제 이미지 표시 |
| `src/screens/confirm.js` | 소폭 수정 | 우승자 실제 이미지 표시 |

---

## 1. `loading.js` — 이미지 생성 API 연동

### 변경 전
- `generateProfiles()` 함수가 `imagePool.js`에서 그라디언트+이모지로 가짜 프로필 8개 생성
- 로딩 바가 ~8초 동안 채워진 후 바로 월드컵 화면으로 이동

### 변경 후

#### 새로운 함수: `fetchWorldcupImages()`
```javascript
// loading.js (line ~96)
async function fetchWorldcupImages() {
  const body = {
    user_id: 'anonymous-' + Date.now(),
    gender,                                              // effectiveBeffGender()에서 파생
    height:    normalizeHeight(state.appearance.height, gender),  // cm → 0~100 변환
    race:      state.appearance.race      ?? 50,
    body_type: state.appearance.bodyType  ?? 50,
    hair:      state.appearance.hair      ?? 50,
    eyelid:    state.appearance.eyelid    ?? 50,
    job:       state.inner.jobSpecific || state.inner.job || '직장인',
    preferences: { ... },                                // 모든 입력값 (DB 저장용, 이미지 생성에 미사용)
  };

  const res = await fetch('http://localhost:8000/beff/worldcup', { ... });
  const data = await res.json();
  // data = { survey_id, images: [{id, url, scene_name, order}] }

  state.generatedProfiles = data.images.map(...);  // 프로필 형식으로 변환
  state._surveyId = data.survey_id;                // worldcup.js에서 세션 생성 시 사용
}
```

#### 로딩 바 동작 변경
- API 응답 올 때까지 **90%에서 멈춤** (기존: 100%까지 바로 진행)
- API 완료 → 100%로 빠르게 채우고 월드컵 화면으로 전환
- API 실패 시 → `generateFallbackProfiles()`로 기존 가짜 프로필 사용 (폴백)

#### `normalizeHeight()` 추가
```javascript
// 프론트 슬라이더는 cm (150~195), API는 0~100 범위
function normalizeHeight(cm, gender) {
  const ranges = { female: [150, 180], male: [160, 195] };
  const [min, max] = ranges[gender] || [155, 195];
  return Math.max(0, Math.min(100, Math.round((cm - min) / (max - min) * 100)));
}
```

#### `preferences` 객체 (DB 저장용)
```javascript
preferences: {
  beffGenderPref,           // 'same' | 'any' | 'opposite'
  ageDiffPref,              // -1 | 0 | 1
  appearanceCelebRef,       // 연예인 참조 이름
  inner: {
    celebRef, relationship, attention, sharing,
    chatStyle, interests, job, jobSpecific,
  },
  swipeLikes,               // 스와이프 선택 배열
  neighborhood,             // 동네
}
```

---

## 2. `worldcup.js` — 이미지 표시 + 세션 트래킹

### 변경 전
- 그라디언트+이모지로 카드 렌더링
- 로컬 `state`에만 결과 저장
- API 호출 없음

### 변경 후

#### 이미지 렌더링
```javascript
// renderMatchup() 내부
<div class="worldcup-card-img" style="${p.imageUrl ? '' : 'background:' + p.gradient + ';'} ...">
  ${p.imageUrl
    ? `<img src="${p.imageUrl}" style="width:100%;height:100%;object-fit:cover;" />`
    : p.emoji}
</div>
```
- `imageUrl`이 있으면 → `<img>` 태그로 실제 이미지 표시
- 없으면 → 기존 그라디언트+이모지 **폴백**

#### API 호출 3곳 추가 (모두 비동기, UI 블로킹 없음)

| 시점 | 코드 위치 | API |
|------|----------|-----|
| 월드컵 화면 진입 | `12_init` | `POST /beff/worldcup/session` → `sessionId` 저장 |
| 매치에서 선택 | `handlePick()` | `POST /beff/worldcup/round` → 승패 기록 |
| 최종 우승 결정 | `handlePick()` (winners.length === 1) | `POST /beff/worldcup/complete` → 최종 이미지 ID |

#### 승패 판별 로직 추가
```javascript
// handlePick 내부 — 기존에는 winner만 추적, 이제 loser도 파악
const p1 = bracket[pairIndex];
const p2 = bracket[pairIndex + 1];
const winner = bracket.find(p => p.id === selectedId);
const loser = (winner === p1) ? p2 : p1;
```

---

## 3. `email.js` — 사전등록완료 화면

### 변경 전
```html
<div class="confirm-img" style="background: ${winner.gradient}; ...">
  ${winner.emoji}
</div>
```

### 변경 후
```html
<div class="confirm-img" style="${winner.imageUrl ? '' : 'background:' + winner.gradient + ';'} ...; border-radius: 50%; overflow: hidden;">
  ${winner.imageUrl
    ? `<img src="${winner.imageUrl}" style="width:100%;height:100%;object-fit:cover;" />`
    : winner.emoji}
</div>
```
- 우승자의 실제 이미지가 **원형**으로 표시됨

---

## 4. `confirm.js` — 친구 추가 확인 화면

`email.js`와 동일한 패턴으로 수정. `imageUrl` → `<img>`, 없으면 → 이모지 폴백.

---

## 프로필 객체 스키마

기존 vs 변경 후:

```diff
 {
   id: 0,
+  imageId: "uuid-from-db",     // beff_images 테이블의 id
+  imageUrl: "https://...",      // Supabase Storage 공개 URL
-  name: "scene_name"           // ❌ 장면 이름이었음
+  name: "김민준",               // ✅ randomKoreanName()
   age: 27,
   job: "디자이너",
   neighborhood: "역삼동",
   distance: 2.3,
   hobby: "카페, 영화",
   gradient: "linear-gradient(...)",  // 폴백용 (유지)
   emoji: "👩",                       // 폴백용 (유지)
 }
```

---

## `state` 추가 필드

| 필드 | 설정 위치 | 사용 위치 |
|------|----------|----------|
| `state._surveyId` | `loading.js` (API 응답) | `worldcup.js` (세션 생성 시) |
| `state.generatedProfiles[].imageId` | `loading.js` | `worldcup.js` (라운드 결과 전송 시) |
| `state.generatedProfiles[].imageUrl` | `loading.js` | `worldcup.js`, `email.js`, `confirm.js` |

---

## 환경 설정

프론트에서 API 주소가 하드코딩되어 있음:
```javascript
// loading.js, worldcup.js
const API_BASE = 'http://localhost:8000';
```

> ⚠️ **배포 시** 이 값을 실제 서버 URL로 변경 필요. 환경변수화 권장.

---

## 백엔드 API 요약

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/beff/worldcup` | POST | `{user_id, gender, height, race, body_type, hair, eyelid, job, preferences}` | `{survey_id, images: [{id, url, scene_name, order}]}` |
| `/beff/worldcup/session` | POST | `{survey_id}` | `{session_id}` |
| `/beff/worldcup/round` | POST | `{session_id, round_name, winner_id, loser_id}` | `{status: "ok"}` |
| `/beff/worldcup/complete` | POST | `{session_id, final_image_id}` | `{status: "completed"}` |
