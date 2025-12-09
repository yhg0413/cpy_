import React from 'react';
import { getCharImage } from '../utils/imageHelper';

const FearlessHistory = ({ globalBans }) => {
  // Set을 배열로 변환
  const bannedList = Array.from(globalBans);

  if (bannedList.length === 0) return null;

  return (
    <div className="fearless-container">
      <div className="fearless-title">HARD FEARLESS HISTORY (USED)</div>
      <div className="fearless-list">
        {bannedList.map(char => (
          <div key={char} className="fearless-item" title={char}>
            <img src={getCharImage(char)} alt={char} />
            <div className="fearless-overlay"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FearlessHistory;