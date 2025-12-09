import React, { useState } from 'react';

const LobbyPage = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');
  const [nickname, setNickname] = useState(''); // [NEW] 닉네임 상태

  const handleEnter = () => {
    if (!roomId.trim() || !nickname.trim()) {
      alert("방 번호와 닉네임을 모두 입력해주세요.");
      return;
    }
    console.log("Join")
    onJoin(roomId, nickname); // 닉네임도 같이 전달
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>CYPHERS BAN/PICK ONLINE</h1>
      <div style={styles.inputBox}>
        {/* 방 번호 입력 */}
        <input 
          type="text" 
          placeholder="방 번호 (Room ID)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={styles.input}
        />
        {/* 닉네임 입력 */}
        <input 
          type="text" 
          placeholder="닉네임 (Nickname)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
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
  inputBox: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '15px', fontSize: '1.2rem', borderRadius: '5px', border: 'none', width: '300px', outline: 'none', textAlign: 'center' },
  button: { padding: '15px 30px', fontSize: '1.2rem', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: '#4caf50', color: 'white', fontWeight: 'bold' },
};

export default LobbyPage;