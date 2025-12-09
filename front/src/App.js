import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import LobbyPage from './pages/LobbyPage'; // 분리된 페이지
import GamePage from './pages/GamePage';   // 분리된 페이지
import './App.css'; // 전역 스타일

const SERVER_URL = "/";

const App = () => {
  const [socket, setSocket] = useState(null);
  
  // 페이지 상태: 'lobby' (기본값) | 'game' (방 입장 후)
  const [view, setView] = useState('lobby');
  
  // 유저/방 정보
  const [roomId, setRoomId] = useState('');
  const [nickname, setNickname] = useState(''); // [NEW]
  const [myTeam, setMyTeam] = useState(null);

  // 1. 소켓 연결 (앱 시작 시 한 번만)
  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    // [이벤트 수신] 팀 배정 -> 방 입장 성공 의미 -> 게임 페이지로 이동
    newSocket.on('assign_team', (team) => {
      setMyTeam(team);
      setView('game'); // 페이지 전환
    });

    // [이벤트 수신] 방 꽉 참
    newSocket.on('room_full', () => {
      alert('방이 꽉 찼습니다. 다른 방 번호를 입력해주세요.');
      setRoomId(''); // 입력 초기화
    });

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // 세션 스토리지에 정보가 남아있으면 자동으로 join 시도
    const savedRoom = sessionStorage.getItem('cyp_roomId');
    const savedNick = sessionStorage.getItem('cyp_nickname');

    if (savedRoom && savedNick) {
      console.log(`자동 재접속 시도: ${savedRoom} / ${savedNick}`);
      setRoomId(savedRoom);
      setNickname(savedNick);
      // 소켓 연결되자마자 join 요청
      socket.emit('join_room', { roomId: savedRoom, nickname: savedNick });
    }
  }, [socket]);

  // 2. 로비에서 입장 버튼 클릭 시 호출
  const handleJoin = (inputRoomId, inputNickname) => {
    setRoomId(inputRoomId);
    setNickname(inputNickname);
    
    // 세션에 저장 (새로고침 대비)
    sessionStorage.setItem('cyp_roomId', inputRoomId);
    sessionStorage.setItem('cyp_nickname', inputNickname);
    socket.emit('join_room', { roomId: inputRoomId, nickname: inputNickname });
  };

  const handleLeave = () => {
    if (!socket) return;
    
    // 1. 서버에 "나 간다"고 알림
    socket.emit('leave_room', roomId);

    // 2. [핵심] 재접속 방지: 세션 스토리지 삭제
    sessionStorage.removeItem('cyp_roomId');
    sessionStorage.removeItem('cyp_nickname');

    // 3. 상태 초기화 및 로비로 이동
    setRoomId('');
    setNickname('');
    setMyTeam(null);
    setView('lobby');
  };

  // --- 화면 렌더링 분기 ---
  
  // A. 로비 화면 (기본)
  if (view === 'lobby') {
    return <LobbyPage onJoin={handleJoin} />;
  }

  // B. 게임 화면 (준비 + 밴픽)
  // socket, roomId, myTeam을 props로 넘겨줍니다.
  if (view === 'game') {
    return (
      <GamePage 
        socket={socket} 
        roomId={roomId} 
        myTeam={myTeam} 
        nickname={nickname}
        onLeave={handleLeave}
      />
    );
  }

  return null;
};

export default App;