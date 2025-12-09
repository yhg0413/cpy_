import React, { useState } from 'react';

const Lobby = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');

  return (
    <div className="lobby-container">
      <h1>CYPHERS BAN/PICK ONLINE</h1>
      <input 
        type="text" 
        placeholder="방 번호 입력 (예: room1)" 
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={() => roomId && onJoin(roomId)}>입장하기</button>
    </div>
  );
};

export default Lobby;