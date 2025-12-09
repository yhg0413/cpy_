import React, { useState, useEffect } from 'react';

const Timer = ({ isActive, turnIndex, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(50);

  // 턴(turnIndex)이 바뀔 때마다 타이머 리셋
  useEffect(() => {
    setTimeLeft(50);
  }, [turnIndex]);

  useEffect(() => {
    if (!isActive) return;
    
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isActive, onTimeout]);

  return (
    <div className={`timer-box ${timeLeft <= 10 ? 'urgent' : ''}`}>
      <div className="timer-text">{timeLeft}</div>
      <div className="timer-label">SECONDS</div>
    </div>
  );
};

export default Timer;