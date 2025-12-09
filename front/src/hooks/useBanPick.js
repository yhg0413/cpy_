import { useState, useEffect } from 'react';

export const useBanPick = (socket, roomId, myTeam) => {
  const [gameState, setGameState] = useState({
    draftHistory: [],
    stepIndex: 0,
    timeLeft: 50,
    isFinished: false,
    globalBans: [] // 서버에서 받아옴
  });

  useEffect(() => {
    if (!socket) return;

    // 1. 게임 상태 업데이트 수신
    socket.on('update_game_state', (newState) => {
      setGameState(newState);
    });

    // 2. 타이머 수신
    socket.on('timer_tick', (time) => {
      setGameState(prev => ({ ...prev, timeLeft: time }));
    });

    return () => {
      socket.off('update_game_state');
      socket.off('timer_tick');
    };
  }, [socket]);

  // 서버로 선택 요청 보내기
  const handleSelect = (charName) => {
    // 내 턴일 때만 전송
    socket.emit('select_char', { roomId, charName, team: myTeam });
  };

  return {
    ...gameState,
    handleSelect
  };
};