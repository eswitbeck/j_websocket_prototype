import { create } from 'zustand';
import * as constants from './constants';

interface GameStore {
  gameState: string,
  updateGameState: (gameState: string) => void,
  roomId: string
}

export const useGameStore = create<GameStore>()((set) => ({
  gameState: constants.gameState.PENDING,
  updateGameState: (gameState: string) => set({ gameState }),
  roomId: window.location.pathname
}));
  
