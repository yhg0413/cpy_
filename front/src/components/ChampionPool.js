import React from 'react';
import { CHARACTERS } from '../data/constants';
import { getCharImage } from '../utils/imageHelper';

const ChampionPool = ({ globalBans, draftHistory, onSelect }) => {
  return (
    <div className="champion-pool">
      {CHARACTERS.map(char => {
        const isGlobalBanned = globalBans.has(char);
        const historyItem = draftHistory.find(h => h.char === char);
        
        let className = "char-card";
        if (isGlobalBanned) className += " global-banned";
        else if (historyItem) {
          className += historyItem.type === 'ban' ? " banned" : " picked";
        }

        return (
          <div 
            key={char} 
            className={className}
            onClick={() => onSelect(char)}
          >
            {/* 이미지 렌더링 */}
            <img 
              src={getCharImage(char)} 
              alt={char} 
              className="char-img"
              onError={(e) => { e.target.style.display = 'none'; }} // 이미지 깨지면 숨김
            />
            {/* 이미지가 없을 때나 호버 시 이름을 보여주기 위한 텍스트 */}
            <span className="char-name-overlay">{char}</span>
            
            {/* 밴 표시 (X) */}
            {(isGlobalBanned || (historyItem && historyItem.type === 'ban')) && (
              <div className="ban-overlay"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChampionPool;