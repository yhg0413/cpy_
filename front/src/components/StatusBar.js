import React from 'react';

const StatusBar = ({ setCount, isFinished, currentTurn, onNextSet }) => {
  return (
    <div className="status-bar">
      <div className="set-info">SET {setCount} - Hard Fearless</div>
      <div className="turn-info">
        {isFinished ? (
          <button className="next-set-btn" onClick={onNextSet}>
            다음 세트 (현재 픽 영구 금지)
          </button>
        ) : (
          currentTurn && (
            <span style={{ color: currentTurn.team === 'blue' ? '#4fc3f7' : '#e57373' }}>
              [{currentTurn.team.toUpperCase()}] {currentTurn.type.toUpperCase()}
            </span>
          )
        )}
      </div>
    </div>
  );
};

export default StatusBar;