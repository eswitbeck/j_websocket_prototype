import React, { useEffect } from 'react';
import { useGameStore } from './store';
import * as constants from './constants';
import PendingView from './components/pendingView';

export const App = () =>  {
  const roomId = useGameStore((state) => state.roomId);
  const gameState = useGameStore(state => state.gameState);
  useEffect(() => {
    console.log(roomId);
  }, []);

  return <>
    { gameState === constants.gameState.PENDING && <PendingView /> }
  </>
   
}
