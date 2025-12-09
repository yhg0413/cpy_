import React, { useState } from 'react';

const LobbyPage = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');

  const handleEnter = () => {
    if (!roomId.trim()) return;
    onJoin(roomId);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>CYPHERS BAN/PICK ONLINE</h1>
      <div style={styles.inputBox}>
        <input 
          type="text" 
          placeholder="방 번호 입력 (예: room1)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleEnter()}
          style={styles.input}
        />
        <button onClick={handleEnter} style={styles.button}>입장하기</button>
      </div>
    </div>
  );
};

// 스타일 (App.js에 있던 것 이동)
const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100vh', backgroundColor: '#121212', color: 'white'
  },
  title: { fontSize: '2.5rem', marginBottom: '40px', letterSpacing: '2px', fontWeight: '900' },
  inputBox: { display: 'flex', gap: '10px' },
  input: { padding: '15px', fontSize: '1.2rem', borderRadius: '5px', border: 'none', width: '250px', outline: 'none' },
  button: { padding: '15px 30px', fontSize: '1.2rem', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: '#4caf50', color: 'white', fontWeight: 'bold' },
};

export default LobbyPage;