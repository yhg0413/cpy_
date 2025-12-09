const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); // [필수] 경로 처리를 위해 추가

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // React 개발 서버 접속 허용
});

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
  socket.on('join_room', (roomId) => {
    // 방이 없으면 생성
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

    // 빈 자리 할당 (Blue -> Red 순서)
    if (!room.players.blue) {
      room.players.blue = socket.id;
      socket.emit('assign_team', 'blue');
    } else if (!room.players.red) {
      room.players.red = socket.id;
      socket.emit('assign_team', 'red');
    } else {
      socket.emit('room_full');
      return;
    }

    socket.join(roomId);
    io.to(roomId).emit('update_players', room.players);
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
    io.to(roomId).emit('update_game_state', room.gameState);
    
    // 5. 타이머 다시 시작 (필요하다면)
    startGame(roomId); // 바로 시작할지, 대기할지는 선택
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
      // 시간 초과 로직 (자동 선택/기권) 수행
      // performAutoPick(room);
      room.gameState.timeLeft = 50;
      // emit update...
    }
    
    // 매초 시간 전송 (또는 5초마다 동기화)
    io.to(roomId).emit('timer_tick', room.gameState.timeLeft);
  }, 1000);
}

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});