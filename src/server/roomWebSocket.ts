import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { v4 as uuid } from 'uuid';

type MessageType = 'room_init' |
                   'claim_host' | 
                   'post_question' |
                   'post_response' |
                   'choose_response';

interface Message {
  type: MessageType,
  text?: string,
  user_id: number,
  room_id: number
}

type Socket_Id = string;
type Room_Id = number;

interface SocketIndex {
  [index: Socket_Id]: {
    user_id: number | null,
    rooms: Room_Id[],
    username: string | null,
    socket: WebSocket
  }
}

// access username on each message, or via database?
interface UserState {
  score: number,
  socket_id: Socket_Id,
  username: string
}

interface Host {
  socket_id: Socket_Id,
  username: string
}

interface Room {
  host: Host | null,
  connections: UserState[]
}

interface Rooms {
  [index: string]: Room
}

// superior method would be with uuid
const socketIndex: SocketIndex = {};
const rooms: Rooms = {};

export const handleSocket = (server: Server) => {
  const wss = new WebSocketServer({
    noServer: true,
    path: '/roomSocket'
  });

 wss.on('connection', ws => {
   const socketId = uuid();
   socketIndex[socketId] = {
     user_id: null,
     rooms: [],
     username: null,
     socket: ws
   };

   ws.on('error', err => {
     console.error(err);
     // send notice to client
   });
   ws.on('message', data => {
     const dataString = data.toString('utf-8');
     const message = JSON.parse(dataString);
     if (!isValidMessage(message)) {
       // log on server
       ws.send('Invalid message');
       return;
     }
     const { type, user_id, room_id } = message;
     const userInfo = socketIndex[socketId];
     // confirm id info tracked
     if (userInfo.user_id === null) userInfo.user_id = user_id;
     // force username immediately
     if (userInfo.username === null) userInfo.username = `User_${user_id}`;
     
     // case switch for types
     switch(type) {
       case 'room_init':
         // as long as not already in room
         if (!userInfo.rooms.includes(room_id)) {
           const uState: UserState = {
             score: 0, // db?
             socket_id: socketId,
             username: userInfo.username
           };
           // if first in room, initialize
           if (!rooms[room_id]) rooms[room_id] = {
             host: null,
             connections: []
           };
           // (eventually, confirm allowed)
           // push to room memory
           rooms[room_id].connections.push(uState);
           userInfo.rooms.push(room_id);
           // update db if needed
           // alert clients
           broadcastFrom(room_id, socketId, `${userInfo.username} connected`);
         }
         // send all room info
         ws.send(JSON.stringify(rooms[room_id]));
         break;
       case 'claim_host':
         // confirm in room
         if (!userInfo.rooms.includes(room_id)) {
           ws.send('Invalid room selection'); // superfluous
         } else if (rooms[room_id].host !== null) {
         // confirm no other host
           // if yes, send already claimed
           ws.send('Host already claimed'); // superfluous
         } else {
           // if not, update room, db
           rooms[room_id].host = { socket_id: socketId, username: userInfo.username };
           // alert relevant clients 
           broadcastFrom(room_id, socketId, `Host claimed by: ${userInfo.username}`);
           // send ok
           ws.send('ok');
         }
         break;
       case 'post_question':
         // confirm in room
         // confirm is host
         // update db?
         // broadcast to rel clients
         // send ok
         break;
       case 'post_response':
         // confirm in room
         // confirm is not host
         // update db?
         // send to host
         break;
       case 'choose_response':
         // confirm in room
         // confirm is host
         // update db?
         // broadcast to rel clients
         break;
     }

     ws.on('close', () => {
       // starting with socketId
       const userInfo = socketIndex[socketId];
       // otherwise close fires twice, firing an error
       if (userInfo !== undefined) {
         const room_ids = userInfo.rooms;
         room_ids.map(room_id => {
           const room = rooms[room_id];
           // broadcast disconnect
           broadcastFrom(room_id, socketId, `${userInfo.username} disconnected`);
           // update rooms
           if (rooms[room_id].host?.socket_id === socketId) rooms[room_id].host = null;
           rooms[room_id].connections = rooms[room_id].connections
             .filter((uState: UserState) => uState.socket_id !== socketId);
         });
         // clear up db
         // clean up user
         delete socketIndex[socketId];
       }
     });
   });

   ws.send('connected to server');
 });

 wss.on('close', () => {
   // tidy all connections in db; inform all clients
 });

  server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, sock => {
      wss.emit('connection', sock, req);
    });
  });
}

function isValidMessage (messageJSON: Message): boolean {
  if (!messageJSON?.type ||
      typeof messageJSON.type !== 'string' ||
      !messageJSON?.user_id ||
      typeof messageJSON.user_id !== 'number' ||
      !messageJSON?.room_id ||
      typeof messageJSON.room_id !== 'number' ||
      ((messageJSON.type === 'post_question' ||
        messageJSON.type === 'post_response' ||
        messageJSON.type === 'choose_response') &&
       (!messageJSON?.text ||
        typeof messageJSON.text !== 'string'))
     ) return false;
   else return true;
}

function broadcastFrom (room_id: number, from_id: Socket_Id, message: string) {
  rooms[room_id].connections
    .filter((userState: UserState) => userState.socket_id !== from_id)
    .map((userState: UserState)  => {
      const { socket_id } = userState;
      const socket = socketIndex[socket_id].socket;
      socket.send(message); // TODO fill out so client can update
    });
}
