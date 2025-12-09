import React, { useState, useEffect, useMemo } from 'react';
import TeamPanel from '../components/TeamPanel';
import ChampionPool from '../components/ChampionPool';
import StatusBar from '../components/StatusBar';
import { DRAFT_ORDER } from '../data/constants';
import FearlessHistory from '../components/FearlessHistory';

const GamePage = ({ socket, roomId, myTeam }) => {
  // --- 상태 관리 ---
  const [isGameStarted, setIsGameStarted] = useState(false); // 준비 단계 vs 게임 단계
  const [readyStatus, setReadyStatus] = useState({ blue: false, red: false });
  
  const [gameState, setGameState] = useState({
    draftHistory: [],
    stepIndex: 0,
    timeLeft: 50,
    isFinished: false,
    setCount: 1,
    globalBans: []
  });

  // --- 소켓 이벤트 리스너 ---
  useEffect(() => {
    if (!socket) return;

    // 1. 준비 상태 업데이트
    socket.on('update_ready', (status) => setReadyStatus(status));

    // 2. 게임 시작 신호
    socket.on('game_start', () => setIsGameStarted(true));

    // 3. 게임 상태 동기화 (밴/픽 진행)
    socket.on('update_game_state', (newState) => setGameState(newState));

    // 4. 타이머 동기화
    socket.on('timer_tick', (time) => setGameState(prev => ({ ...prev, timeLeft: time })));

    // 컴포넌트 언마운트 시 리스너 정리 (중복 방지)
    return () => {
      socket.off('update_ready');
      socket.off('game_start');
      socket.off('update_game_state');
      socket.off('timer_tick');
    };
  }, [socket]);

  // --- Derived State ---
  const currentTurn = useMemo(() => {
    if (gameState.stepIndex >= DRAFT_ORDER.length) return null;
    return DRAFT_ORDER[gameState.stepIndex];
  }, [gameState.stepIndex]);

  const isMyTurn = useMemo(() => {
    console.log(gameState)
    if (gameState.isFinished || !currentTurn) return false;
    console.log(currentTurn.team,myTeam)
    return currentTurn.team === myTeam;
  }, [gameState.isFinished, currentTurn, myTeam]);

  const globalBansSet = useMemo(() => new Set(gameState.globalBans), [gameState.globalBans]);

  // --- 핸들러 ---
  const handleReady = () => {
    socket.emit('player_ready', { roomId, team: myTeam });
  }
  const handleSelect = (charName) => {
    if (!isMyTurn) return;
    const isAlreadySelected = gameState.draftHistory.some(h => h.char === charName);

    if (globalBansSet.has(charName)) {
        alert("이미 이전 세트에서 사용된 캐릭터입니다 (Hard Fearless).");
        return;
    }
    if (isAlreadySelected) {
        // 굳이 alert까지 띄울 필요 없으면 생략 가능
        return; 
    }
    socket.emit('select_char', { roomId, charName });
  };
  const handleNextSet = () => socket.emit('request_next_set', roomId);

  // --- 렌더링: 1. 준비 화면 (Ready Phase) ---
  if (!isGameStarted) {
    return (
      <div style={styles.readyContainer}>
        <h2 style={styles.readyTitle}>ROOM: {roomId}</h2>
        <div style={styles.teamCard}>
          <span style={{color: '#aaa'}}>YOUR TEAM</span>
          <h1 style={{ color: myTeam === 'blue' ? '#4fc3f7' : '#e57373', fontSize: '3rem', margin: '10px 0' }}>
            {myTeam?.toUpperCase()}
          </h1>
        </div>
        <div style={styles.statusBox}>
          <div style={{...styles.playerStatus, color: readyStatus.blue ? '#4fc3f7' : '#555'}}>
            BLUE: {readyStatus.blue ? 'READY' : 'WAITING'}
          </div>
          <div style={{...styles.playerStatus, color: readyStatus.red ? '#e57373' : '#555'}}>
            RED: {readyStatus.red ? 'READY' : 'WAITING'}
          </div>
        </div>
        {!readyStatus[myTeam] ? (
          <button onClick={handleReady} style={styles.readyButton}>READY</button>
        ) : (
          <div style={styles.waitingMsg}>상대방을 기다리는 중...</div>
        )}
      </div>
    );
  }

  // --- 렌더링: 2. 게임 화면 (Main Game Phase) ---
  return (
    <div className="game-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. 상단 상태바 */}
      <StatusBar 
        setCount={gameState.setCount}
        isFinished={gameState.isFinished}
        currentTurn={currentTurn}
        onNextSet={handleNextSet} 
      />

      {/* 2. 메인 보드 (높이 자동 조절) */}
      <div className="board" style={{ flex: 1, display: 'flex', padding: '10px 20px', gap: '20px', minHeight: 0 }}>
        <TeamPanel team="blue" draftHistory={gameState.draftHistory} currentStepIndex={gameState.stepIndex} />
        
        <div className="center-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
          {/* 타이머 */}
          {!gameState.isFinished && (
            <div className={`timer-box ${gameState.timeLeft <= 10 ? 'urgent' : ''}`}>
              <div className="timer-text">{gameState.timeLeft}</div>
            </div>
          )}
          {/* 캐릭터 풀 (스크롤 가능) */}
          <ChampionPool 
            globalBans={globalBansSet}
            draftHistory={gameState.draftHistory}
            onSelect={handleSelect}
          />
        </div>

        <TeamPanel team="red" draftHistory={gameState.draftHistory} currentStepIndex={gameState.stepIndex} />
      </div>

      {/* 3. 하단 피어리스 히스토리 (높이 고정) */}
      <div style={{ height: '100px', backgroundColor: '#0f0f0f', borderTop: '1px solid #333' }}>
        <FearlessHistory globalBans={globalBansSet} />
      </div>

      {/* 내 턴 알림 */}
      {isMyTurn && !gameState.isFinished && (
        <div style={styles.myTurnOverlay}>내 차례입니다!</div>
      )}
    </div>
  );
};

// 내부 스타일
const styles = {
  readyContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#121212', color: 'white' },
  readyTitle: { fontSize: '1.5rem', color: '#888' },
  teamCard: { textAlign: 'center', marginBottom: '40px' },
  statusBox: { display: 'flex', gap: '50px', marginBottom: '40px', fontSize: '1.5rem', fontWeight: 'bold' },
  playerStatus: { transition: 'color 0.3s' },
  readyButton: { padding: '20px 60px', fontSize: '1.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer', backgroundColor: '#2196f3', color: 'white', fontWeight: '900' },
  waitingMsg: { fontSize: '1.2rem', color: '#aaa', fontStyle: 'italic' },
  myTurnOverlay: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '10px 30px', borderRadius: '20px', border: '1px solid white', fontWeight: 'bold', pointerEvents: 'none', animation: 'pulse 2s infinite' }
};

export default GamePage;