import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';

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

// access username on each message, or via database?
interface UserState {
  username: string,
  score: number,
  user_id: number
}

interface Room {
  host: number | null,
  players: UserState[]
}

interface Connections {
  [index: string]: WebSocket
}

interface Rooms {
  [index: string]: Room
}

interface UserRoomIndex {
  [index: string]: number[]
}

const connections: Connections = {};
const rooms: Rooms = {};
const userRoomIndex: UserRoomIndex = {};

export const handleSocket = (server: Server) => {
  const wss = new WebSocketServer({
    noServer: true,
    path: '/roomSocket'
  });

 wss.on('connection', ws => {
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
     // case switch for types
     switch(type) {
       case 'room_init':
         // confirm tracking connection
         if (!connections[user_id]) connections[user_id] = ws;
         if (!userRoomIndex[user_id]) userRoomIndex[user_id] = [];
         // as long as not already in room
         if (!userRoomIndex[user_id].includes(room_id)) {
           const username = 'filler' // db or message?
           const uState: UserState = {
             username,
             score: 0, // db?
             user_id
           };
           // if first in room
           if (!rooms[room_id]) rooms[room_id] = {
             host: null,
             players: []
           };
           // (eventually, confirm allowed)
           // push to room memory
           rooms[room_id].players.push(uState);
           userRoomIndex[user_id].push(room_id);
           // update db if needed
           // alert clients
           broadcastFrom(room_id, user_id, `${username} connected`);
         }
         // send all room info
         ws.send(JSON.stringify(rooms[room_id]));
         break;
       case 'claim_host':
         // confirm in room
         if (!userRoomIndex[user_id].includes(room_id)) {
           ws.send('Invalid room selection'); // superfluous
         } else if (rooms[room_id].host !== null) {
         // confirm no other host
           // if yes, send already claimed
           ws.send('Host already claimed'); // superfluous
         } else {
           const username = 'filler';
           // if not, update room, db
           rooms[room_id].host = user_id;
           // alert relevant clients 
           broadcastFrom(room_id, user_id, `Host claimed by: ${username}`);
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
       // clear up db
       // clear up memory
       // (room, roomIndex, user)
       // broadcast update to clients
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

function broadcastFrom (room_id: number, from_id: number, message: string) {
  rooms[room_id].players
    .filter((userState: UserState) => userState.user_id !== from_id)
    .map((userState: UserState)  => {
      const { user_id } = userState;
      const socket = connections[user_id];
      socket.send(message); // TODO fill out so client can update
    });
}
