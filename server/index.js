const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); // [필수] 경로 처리를 위해 추가

const CHARACTERS = [
  "로라스","휴톤","루이스","타라","트리비아","카인","레나","드렉슬러","도일","토마스",
  "나이오비","시바","웨슬리","스텔라","앨리셔","클레어","다이무스","이글","마를렌","샬럿",
  "윌라드","레이튼","미쉘","린","빅터","카를로스","호타루","트릭시","히카르도","까미유",
  "자네트","피터","아이작","레베카","엘리","마틴","브루스","미아","드니스","제레온",
  "루시","티엔","하랑","J","벨져","리첼","리사","릭","제키엘","탄야",
  "캐럴","라이샌더","루드빅","멜빈","디아나","클리브","헬레나","에바","론","레오노르",
  "시드니","테이","티모시","엘프리데","티샤","카로슈","라이언","케니스","이사벨","헤나투",
  "숙희", "니콜라스","키아라","베로니카","주세페","루카","앤지 헌트","플로리안","에밀리",
  "파수꾼 A","그레타","바스티안","재뉴어리"
]

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // React 개발 서버 접속 허용
});

const PORT = process.env.PORT || 4000;

// 게임 상태 저장소 (메모리)
const rooms = {};

// 밴픽 순서 (클라이언트와 동일한 상수 사용 추천)
const DRAFT_ORDER = [
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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 1. 방 입장
  socket.on('join_room', ({roomId,nickname}) => {
    // 방이 없으면 생성
    console.log(roomId,nickname)
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: { blue: null, red: null },
        ready: { blue: false, red: false },
        gameState: {
          draftHistory: [],
          stepIndex: 0,
          globalBans: [], // 하드 피어리스용
          timeLeft: 50,
          isFinished: false,
          setCount: 1
        },
        timerInterval: null
      };
    }

    const room = rooms[roomId];
    let myTeam = null;

    if (room.players.blue && room.players.blue.nickname === nickname) {
      console.log(`[재접속] ${nickname} -> BLUE TEAM`);
      room.players.blue.socketId = socket.id; // 소켓 ID 갱신 (중요!)
      myTeam = 'blue';
    } 
    else if (room.players.red && room.players.red.nickname === nickname) {
      console.log(`[재접속] ${nickname} -> RED TEAM`);
      room.players.red.socketId = socket.id; // 소켓 ID 갱신
      myTeam = 'red';
    }

    if (!myTeam) {
      if (!room.players.blue) {
        room.players.blue = { nickname, socketId: socket.id };
        myTeam = 'blue';
      } else if (!room.players.red) {
        room.players.red = { nickname, socketId: socket.id };
        myTeam = 'red';
      } else {
        // 방이 꽉 찼고, 기존 멤버도 아님
        socket.emit('room_full');
        return;
      }
    }

    // 4. 접속 처리 완료
    socket.join(roomId);
    
    // 팀 정보 알려주기
    socket.emit('assign_team', myTeam);

    socket.emit('update_ready', room.ready);
    if (room.gameState.draftHistory.length > 0 || room.gameState.setCount > 1) {
      socket.emit('game_start'); // 이미 게임 중이면 게임 화면으로
    }
    socket.emit('update_game_state', room.gameState);
    console.log(`User ${nickname} joined room ${roomId} as ${myTeam}`);
  });

  // 2. 준비 완료 (Ready)
  socket.on('player_ready', (data) => {
    const {roomId, team} = data
    const room = rooms[roomId];
    if (!room) return;

    room.ready[team] = true;
    io.to(roomId).emit('update_ready', room.ready);
    // 둘 다 준비되면 게임 시작
    if (room.ready.blue && room.ready.red) {
      startGame(roomId);
    }
  });

  // 3. 캐릭터 선택 (Ban/Pick)
  socket.on('select_char', ({ roomId, charName }) => {
    console.log(roomId, charName)
    const room = rooms[roomId];
    if (!room) return;
    
    // 로직 검증 (내 턴인지, 중복인지 등)은 서버에서 수행
    const currentStep = DRAFT_ORDER[room.gameState.stepIndex];
    // ...검증 로직...

    // 상태 업데이트
    room.gameState.draftHistory.push({ ...currentStep, char: charName });
    room.gameState.timeLeft = 50; // 시간 초기화
    
    // 다음 단계로
    if (room.gameState.stepIndex + 1 < DRAFT_ORDER.length) {
      room.gameState.stepIndex++;
    } else {
      room.gameState.isFinished = true;
      clearInterval(room.timerInterval);
    }
    console.log("Emmit",room.gameState,DRAFT_ORDER.length)
    io.to(roomId).emit('update_game_state', room.gameState);
  });

  // 연결 끊김 처리
  socket.on('disconnect', () => {
    // 플레이어 퇴장 처리 로직 필요
  });

  socket.on('request_swap', (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    // 상대방 찾기
    let opponentSocketId = null;
    if (room.players.blue && room.players.blue.socketId === socket.id) {
      opponentSocketId = room.players.red?.socketId;
    } else if (room.players.red && room.players.red.socketId === socket.id) {
      opponentSocketId = room.players.blue?.socketId;
    }

    // 상대방이 없으면 에러 처리
    if (!opponentSocketId) {
      socket.emit('error_message', '상대방이 없어서 요청할 수 없습니다.');
      return;
    }

    // 상대방에게 "교체 신청이 왔다"고 알림
    io.to(opponentSocketId).emit('receive_swap_request');
  });

  // [NEW] 2. 교체 응답 (Responder -> Server)
  socket.on('answer_swap', ({ roomId, accept }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (accept) {
      // --- 수락 시: 실제 스왑 로직 실행 ---
      const temp = room.players.blue;
      room.players.blue = room.players.red;
      room.players.red = temp;

      // 준비 상태 초기화
      room.ready = { blue: false, red: false };

      // 양쪽 모두에게 변경된 팀 정보 전송
      if (room.players.blue) io.to(room.players.blue.socketId).emit('assign_team', 'blue');
      if (room.players.red) io.to(room.players.red.socketId).emit('assign_team', 'red');
      
      // 모두에게 완료 신호 (UI 업데이트용)
      io.to(roomId).emit('update_ready', room.ready);
      io.to(roomId).emit('swap_completed'); // [NEW] 완료 알림
      
      console.log(`[SWAP] Teams swapped in room ${roomId}`);

    } else {
      // --- 거절 시: 신청자에게 거절 알림 ---
      // (현재 소켓이 거절한 사람이므로, 상대방을 찾아야 함)
      let requesterSocketId = null;
      if (room.players.blue && room.players.blue.socketId === socket.id) {
        requesterSocketId = room.players.red?.socketId;
      } else {
        requesterSocketId = room.players.blue?.socketId;
      }

      if (requesterSocketId) {
        io.to(requesterSocketId).emit('swap_rejected');
      }
    }
  });

  socket.on('leave_room', (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    let leftTeam = null;

    // 누가 나갔는지 확인하고 자리 비우기
    if (room.players.blue && room.players.blue.socketId === socket.id) {
      room.players.blue = null; // 자리 삭제
      leftTeam = 'blue';
    } else if (room.players.red && room.players.red.socketId === socket.id) {
      room.players.red = null; // 자리 삭제
      leftTeam = 'red';
    }

    if (leftTeam) {
      console.log(`[LEAVE] User left ${leftTeam} team in room ${roomId}`);
      
      // 준비 상태 초기화
      room.ready = { blue: false, red: false };
      
      // 방에 남은 사람에게 "상대방 나갔음" 알림 (업데이트된 준비 상태 전송)
      io.to(roomId).emit('update_ready', room.ready);
      
      // (선택) 남은 사람에게 채팅이나 알림을 띄우고 싶다면
      // io.to(roomId).emit('notification', '상대방이 방을 나갔습니다.');
    }
  });

  socket.on('request_next_set', (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    // 1. 현재 세트에서 'PICK'된 캐릭터들만 추출 (BAN은 풀어줌 -> 하드 피어리스 규칙)
    // 만약 밴 된 것도 못 쓰게 하려면 filter 조건을 수정하면 됩니다.
    const currentPicks = room.gameState.draftHistory
      .filter(action => action.type === 'pick' && action.char)
      .map(action => action.char);

    // 2. Global Bans에 추가 (중복 방지)
    const newGlobalBans = new Set([...room.gameState.globalBans, ...currentPicks]);
    room.gameState.globalBans = Array.from(newGlobalBans);

    // 3. 게임 상태 리셋 (세트 수 증가, 히스토리 초기화)
    room.gameState.draftHistory = [];
    room.gameState.stepIndex = 0;
    room.gameState.isFinished = false;
    room.gameState.timeLeft = 50; // 시간 초기화
    room.gameState.setCount += 1;

    // 4. 변경된 상태 모든 클라이언트에 전송
    room.ready = { blue: false, red: false };

    // 4. [핵심] 모든 클라이언트에게 "대기방으로 가라"고 신호 전송
    io.to(roomId).emit('return_to_ready', {
      ready: room.ready,
      gameState: room.gameState
    });
  });
});

function startGame(roomId) {
  const room = rooms[roomId];
  io.to(roomId).emit('game_start');
  
  // 서버 사이드 타이머 시작
  if (room.timerInterval) clearInterval(room.timerInterval);
  
  room.timerInterval = setInterval(() => {
    room.gameState.timeLeft--;
    
    if (room.gameState.timeLeft <= 0) {
      performTimeoutAction(roomId);
    } else {
      // 시간 전송
      io.to(roomId).emit('timer_tick', room.gameState.timeLeft);
    }
  }, 1000);
}

function performTimeoutAction(roomId) {
  const room = rooms[roomId];
  if (!room || room.gameState.isFinished) return;

  const currentStepIndex = room.gameState.stepIndex;
  // DRAFT_ORDER 배열은 위에서 정의되어 있어야 합니다 (클라이언트와 동일)
  const currentTurn = DRAFT_ORDER[currentStepIndex]; 

  let selectedChar = null;

  if (currentTurn.type === 'ban') {
    // 1. 밴 타임아웃 -> "기권(NO BAN)" 처리
    selectedChar = "NO BAN";
  } else {
    // 2. 픽 타임아웃 -> "랜덤" 처리
    // 이미 픽/밴 된 캐릭터들 제외
    const usedChars = new Set([
      ...room.gameState.globalBans,
      ...room.gameState.draftHistory.map(h => h.char)
    ]);
    
    // 사용 가능한 캐릭터 목록
    const availableChars = CHARACTERS.filter(c => !usedChars.has(c));
    
    if (availableChars.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableChars.length);
      selectedChar = availableChars[randomIndex];
    } else {
      selectedChar = "Unknown"; // 남은 캐릭터가 없을 때(이론상 불가능)
    }
  }

  // 게임 상태 업데이트
  room.gameState.draftHistory.push({ ...currentTurn, char: selectedChar });
  room.gameState.timeLeft = 50; // 시간 초기화

  // 다음 턴으로 이동 or 게임 종료
  if (room.gameState.stepIndex + 1 < DRAFT_ORDER.length) {
    room.gameState.stepIndex++;
  } else {
    room.gameState.isFinished = true;
    clearInterval(room.timerInterval);
  }

  // 변경된 상태 전송
  io.to(roomId).emit('update_game_state', room.gameState);
}

app.use(express.static(path.join(__dirname, 'build')));

app.get('/^\/.*$', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(PORT, '0.0.0.0',() => {
  console.log('Server running on port 4000');
});