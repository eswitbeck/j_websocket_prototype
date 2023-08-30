import React from 'react';
import UserList from './userList';
import HostColumn from './hostColumn';
import './pending_style.scss';

const PendingView = () => {
  return <div className="pending-main">
    <UserList />
    <HostColumn />
  </div>
}

export default PendingView;
