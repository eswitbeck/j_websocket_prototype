import React from 'react';

const UserList = () => {
  const list = ['filler', 'junk'];

  return <div className="column">
    <div className="window">
      <p>Currently in game</p>
      <ul>
        {list.map(e => <li>{e}</li>)}
      </ul>
    </div>
  </div>
};
export default UserList;
