// client/src/styles.js
import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body {
    background-color: #121212;
    color: #e0e0e0;
    font-family: 'Noto Sans KR', sans-serif;
    margin: 0;
    overflow: hidden;
  }
`;

export const Container = styled.div`
  display: flex;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  gap: 20px;
`;

export const TeamSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 2px solid ${props => props.color};
  background-color: #1e1e1e;
  padding: 10px;
`;

export const CenterSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const TimerBox = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: ${props => props.time < 10 ? '#ff4d4d' : 'white'};
  margin-bottom: 20px;
`;

export const InfoText = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  color: #ffcc00;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  width: 100%;
  overflow-y: auto;
  max-height: 80vh;
  padding-right: 5px;

  &::-webkit-scrollbar {
    width: 8px;
    background: #2c2c2c;
  }
  &::-webkit-scrollbar-thumb {
    background: #555;
  }
`;

export const CharCard = styled.div`
  background-color: #333;
  border: 1px solid #444;
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 12px;
  position: relative;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    background-color: #444;
    border-color: #888;
  }

  ${props => props.disabled && `
    opacity: 0.2;
    pointer-events: none;
    filter: grayscale(100%);
    background-color: #111;
  `}
`;

export const PickSlot = styled.div`
  height: 80px;
  background-color: #252525;
  border-left: 5px solid ${props => props.team === 'blue' ? '#3498db' : '#e74c3c'};
  display: flex;
  align-items: center;
  padding-left: 20px;
  font-size: 18px;
  font-weight: bold;
`;

export const BanSlot = styled(PickSlot)`
  height: 50px;
  border-left: 5px solid #555;
  font-size: 14px;
  color: #aaa;
`;