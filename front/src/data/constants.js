// 캐릭터 목록 (가나다순)
export const CHARACTERS = [
  "로라스","휴톤","루이스","타라","트리비아","카인","레나","드렉슬러","도일","토마스",
  "나이오비","시바","웨슬리","스텔라","앨리셔","클레어","다이무스","이글","마를렌","샬럿",
  "윌라드","레이튼","미쉘","린","빅터","카를로스","호타루","트릭시","히카르도","까미유",
  "자네트","피터","아이작","레베카","엘리","마틴","브루스","미아","드니스","제레온",
  "루시","티엔","하랑","J","벨져","리첼","리사","릭","제키엘","탄야",
  "캐럴","라이샌더","루드빅","멜빈","디아나","클리브","헬레나","에바","론","레오노르",
  "시드니","테이","티모시","엘프리데","티샤","카로슈","라이언","케니스","이사벨","헤나투",
  "숙희", "니콜라스","키아라","베로니카","주세페","루카","앤지 헌트","플로리안","에밀리",
  "파수꾼 A","그레타","바스티안","재뉴어리"
].sort();

// 밴픽 순서 (요청하신 로직 적용)
// Phase 1 (Ban): 1팀 1밴 -> 2팀 1밴
// Phase 2 (Pick): 1팀 1픽 -> 2팀 2픽
// Phase 3 (Ban): 1팀 2밴 -> 2팀 2밴
// Phase 4 (Pick): 1팀 2픽 -> 2팀 2픽
// Phase 5 (Ban): 1팀 1밴 -> 2팀 1밴
// Phase 6 (Pick): 1팀 2픽 -> 2팀 1픽
export const DRAFT_ORDER = [
  // Phase 1: Ban 1
  { type: 'ban', team: 'blue' }, { type: 'ban', team: 'red' },
  // Phase 2: Pick
  { type: 'pick', team: 'blue' }, 
  { type: 'pick', team: 'red' }, { type: 'pick', team: 'red' },
  // Phase 3: Ban 2
  { type: 'ban', team: 'blue' }, { type: 'ban', team: 'red' },
  { type: 'ban', team: 'blue' }, { type: 'ban', team: 'red' },
  // Phase 4: Pick
  { type: 'pick', team: 'blue' }, { type: 'pick', team: 'blue' },
  { type: 'pick', team: 'red' }, 
  // Phase 5: Ban 1
  { type: 'ban', team: 'blue' }, { type: 'ban', team: 'red' },
  // Phase 6: Last Pick
  { type: 'pick', team: 'red' },
  { type: 'pick', team: 'blue' }, { type: 'pick', team: 'blue' }
  , { type: 'pick', team: 'red' }
];