// client/src/socket.js
import io from 'socket.io-client';

// 서버 주소 확인! (포트 3001)
const SERVER_URL = 'http://localhost:3001';

export const socket = io(SERVER_URL, {
  transports: ['websocket'], // 폴링 방지, 웹소켓 강제 사용
  withCredentials: true,
  autoConnect: true,
});