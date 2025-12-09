import React from 'react';
import { DRAFT_ORDER } from '../data/constants';
import { getCharImage } from '../utils/imageHelper';

const TeamPanel = ({ team, draftHistory, currentStepIndex }) => {
  const isBlue = team === 'blue';
  const bans = draftHistory.filter(d => d.team === team && d.type === 'ban');
  const picks = draftHistory.filter(d => d.team === team && d.type === 'pick');

  return (
    <div className={`team-panel ${isBlue ? 'team-blue' : 'team-red'}`}>
      <div className="team-header">{isBlue ? 'BLUE TEAM' : 'RED TEAM'}</div>

      {/* 밴 영역 (이미지로 작게 표시) */}
      <div className="ban-container">
        {[0, 1, 2, 3].map(i => {
           const isCurrentBan = currentStepIndex < DRAFT_ORDER.length &&
                                DRAFT_ORDER[currentStepIndex].team === team &&
                                DRAFT_ORDER[currentStepIndex].type === 'ban' &&
                                i === bans.length;
           const charName = bans[i]?.char;
           
           return (
            <div key={`ban-${i}`} className={`slot ban ${charName ? 'filled' : ''} ${isCurrentBan ? 'active-turn' : ''}`}>
              {charName ? (
                 <img src={getCharImage(charName)} alt={charName} className="ban-img" />
              ) : (isCurrentBan ? '...' : '')}
            </div>
           );
        })}
      </div>

      {/* 픽 영역 (배경 이미지 + 그라데이션) */}
      <div className="pick-container">
        {[0, 1, 2, 3, 4].map(i => {
           const isCurrentPick = currentStepIndex < DRAFT_ORDER.length &&
                                 DRAFT_ORDER[currentStepIndex].team === team &&
                                 DRAFT_ORDER[currentStepIndex].type === 'pick' &&
                                 i === picks.length;
           const charName = picks[i]?.char;

           // 스타일 객체 동적 생성 (배경 이미지 적용)
           const slotStyle = charName ? {
             backgroundImage: isBlue 
               ? `linear-gradient(90deg, rgba(21, 101, 192, 0.9) 0%, rgba(21, 101, 192, 0.4) 100%), url(${getCharImage(charName)})`
               : `linear-gradient(-90deg, rgba(198, 40, 40, 0.9) 0%, rgba(198, 40, 40, 0.4) 100%), url(${getCharImage(charName)})`,
             backgroundSize: 'cover',
             backgroundPosition: 'top 40% center'
           } : {};

           return (
            <div 
              key={`pick-${i}`} 
              className={`slot pick ${isCurrentPick ? 'active-turn' : ''} ${charName ? 'filled' : ''}`}
              style={slotStyle}
            >
              <span className="slot-label">PICK {i + 1}</span>
              <span className="char-name-text">{charName}</span>
            </div>
           );
        })}
      </div>
    </div>
  );
};

export default TeamPanel;