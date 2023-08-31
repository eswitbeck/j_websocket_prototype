import { create } from 'zustand';
import * as constants from './constants';

interface GameStore {
  gameState: string,
  updateGameState: (gameState: string) => void,
  roomId: string,
  socket: WebSocket,
  users: string[],
  setUsers: (users: string[]) => void
}

export const useGameStore = create<GameStore>()((set) => ({
  gameState: constants.gameState.PENDING,
  updateGameState: (gameState: string) => set({ gameState }),
  roomId: window.location.pathname.match(/(?:[^\/](?!\/))+$/)[0],
  socket: new WebSocket(`ws://${window.location.host}/roomSocket`),
  users: [],
  setUsers: (users: string[]) => set({ users })
}));
  
