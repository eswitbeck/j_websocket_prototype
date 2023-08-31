import React, { useState, useEffect } from 'react';
import { useGameStore } from './store';
import * as constants from './constants';
import PendingView from './components/pendingView';
import { getUsersInRoom } from '../utils/gameState';

type User = {
  id: number,
  username: string,
  score: number
}

export const App = () =>  {
  const socketMessager = (room_id: number, user_id: number, socket: WebSocket) => (type: string, message:string): void => {
    const baseObject = { user_id, room_id };
    const updated = { ...baseObject, text: message, type };
    console.log('sending', updated);
    socket.send(JSON.stringify(updated));
  };
  const socket = useGameStore((state) => state.socket);
  const gameState = useGameStore(state => state.gameState);
  const roomId = useGameStore(state => state.roomId);
  const setUsers = useGameStore(state => state.setUsers);
  const [id, setId] = useState(Infinity);
  socket.onmessage = async e => {
    const message = JSON.parse(e.data);
    console.log('receiving', message);
    switch (message.type) {
      case 'error':
        console.error(message.payload);
        break;
      case 'init':
        const [user_id, username] = message.payload;
        setId(user_id);
        const messageSocket = socketMessager (Number(roomId), user_id, socket);
        messageSocket('room_init', '');
        break;
      case 'init_info':
        const users: User[] = await getUsersInRoom(Number(roomId));
        setUsers(users.map(u => u.username));
        break;
    }
  }

  useEffect(() => {
    const getUsers = async () => {
      const users: User[] = await getUsersInRoom(Number(roomId));
      const userNames: string[] = users.map(u => u.username);
      setUsers(userNames);
    }
    getUsers();
  }, []);

  return <>
    { gameState === constants.gameState.PENDING && <PendingView /> }
  </>
   
}
