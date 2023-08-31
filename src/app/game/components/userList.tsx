import React from 'react';
import { useGameStore } from '../store';

const UserList = () => {
  const users = useGameStore(state => state.users);

  return <div className="column">
    <div className="window">
      <p>Currently in game</p>
      <ul>
        {users.map((e: string) => <li>{e}</li>)}
      </ul>
    </div>
  </div>
};
export default UserList;
