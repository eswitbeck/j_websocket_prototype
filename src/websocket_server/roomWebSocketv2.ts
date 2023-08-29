// TODO filter out messages to clients on connect
// TODO add health checks to connections
import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { v4 as uuid } from 'uuid';
import * as gameState from './models/gameState';

type MessageType = 'room_init' |
                   'claim_host' | 
                   'post_question' |
                   'post_response' |
                   'choose_response' |
                   'change_username';

interface Message {
  type: MessageType,
  text?: string,
  user_id: number,
  room_id?: number,
  question_id?: number
}

type Socket_Id = number;
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

interface Rooms {
  [index: Room_Id]: {
    host: Host | null,
    connections: UserState[]
  }
}

const socketIndex: SocketIndex = {};
const rooms: Rooms = {};

export const handleSocket = (server: Server) => {
  const wss = new WebSocketServer({
    noServer: true,
    path: '/roomSocket'
  });

 wss.on('connection', async ws => {
   // generate username and unique id
   const user = await gameState.addUser();
   const { username, id } = user;

   socketIndex[id] = {
     user_id: id,
     rooms: [],
     username: username,
     socket: ws
   };

   // generate regular heartbeat check
   // on interval, clear setTimeout of disconnect
   // then set new interval
   const aliveState = <{ isAlive: boolean, interval: NodeJS.Timer | null }>{ isAlive: true, interval: null };

   function ping (ws: WebSocket) {
     if (!aliveState.isAlive) disconnect(ws, id, socketIndex);
     aliveState.isAlive = false;
     ws.ping();
   };

   aliveState.interval = setInterval(() => ping(ws), 5000);

   function heartbeat () {
     aliveState.isAlive = true;
   }
   
   function disconnect (ws: WebSocket, id: number, socketIndex: SocketIndex) {
     clearInterval(aliveState.interval);
     // starting with socketId
     const userInfo = socketIndex[id];
     // otherwise close fires twice, firing an error
     if (userInfo !== undefined) {
       const room_ids = userInfo.rooms;
       room_ids.map(room_id => {
         const room = rooms[room_id];
         // broadcast disconnect
         broadcastFrom(room_id, id, `${userInfo.username} disconnected`);
         // update rooms
         if (rooms[room_id].host?.socket_id === id) rooms[room_id].host = null;
         rooms[room_id].connections = rooms[room_id].connections
           .filter((uState: UserState) => uState.socket_id !== id);
         // clear up db (slightly)
         gameState.leaveRoom(id, room_id);
         // always remove all rooms?
         // then need to batch cleanup
         // on last -> delete all replies, qs, rooms, user
       });
       // clean up user
       delete socketIndex[id];
       ws.terminate();
     }
   }

   ws.on('pong', heartbeat);

   ws.on('error', (err: Error) => {
     console.error(err);
     // send notice to client
   });
   ws.on('message', async data => {
     const dataString = data.toString('utf-8');
     const message = JSON.parse(dataString);
     if (!isValidMessage(message)) {
       // log on server
       ws.send('Invalid message');
       return;
     }
     const { type, user_id, room_id } = message;
     const userInfo = socketIndex[id];
     
     switch(type) {
       case 'room_init':
         const roomInfo = await gameState.joinRoom(id, room_id);
         console.log(roomInfo);
         // as long as not already in room
         if (!userInfo.rooms.includes(room_id)) {
           const uState: UserState = {
             score: roomInfo.score, // db?
             socket_id: id,
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
           broadcastFrom(room_id, id, `${userInfo.username} connected`);
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
           rooms[room_id].host = { socket_id: id, username: userInfo.username };
           // alert relevant clients 
           broadcastFrom(room_id, id, `Host claimed by: ${userInfo.username}`);
           // send ok
           ws.send('ok');
         }
         break;
       case 'post_question':
         // confirm in room
         if (!userInfo.rooms.includes(room_id)) ws.send('Not in room');
         // confirm is host
         else if (rooms[room_id].host?.socket_id !== id) ws.send('Not host.');
         // update db?
         // broadcast to rel clients
         else {
           const { text } = message;
           const question = await gameState.postQuestion(id, room_id, text);
           console.log('q:', question);
           // change for client updates
           const questionText = `Host ${userInfo.username} prompted:
             ${text}.`
           broadcastFrom(room_id, id, questionText);
           ws.send('question posted.');
         }
         break;
       case 'post_response':
         // TODO: needs question id to reply to
         // confirm in room
         if (!userInfo.rooms.includes(room_id)) ws.send('Not in room');
         // confirm is not host
         else if (rooms[room_id].host?.socket_id === id) ws.send("Can't send as host.");
         // if no host claimed
         else if (rooms[room_id].host === null) ws.send('Game will start when host is claimed');
         // update db?
         // send to host
         else {
           const { question_id } = message;
           const reply = await gameState.postReply(id, room_id, question_id, message.text);
           console.log(reply);
           const host = rooms[room_id].host;
           const replyText = `Reply from ${userInfo.username}:
             ${reply.text}`;
           socketIndex[host.socket_id].socket.send(replyText);
           ws.send('sent response.');
         }
         break;
       case 'choose_response':
         // confirm in room
         // confirm is host
         // update db?
         // broadcast to rel clients
         break;
       case 'change_username':
         // update socketIndex
         const oldUsername = userInfo.username;
         // missing error handling
         const updatedUser = await gameState.changeUsername(id, message.text);
         userInfo.username = updatedUser.username;
         // update rooms
         userInfo.rooms.map(room_id => {
           const room = rooms[room_id];
           // check host
           if (room.host?.socket_id === id)
             room.host.username = userInfo.username;
           // check connections
           const roomUserState = room.connections.find(({ socket_id }) => 
                                                       socket_id === id);
           roomUserState.username = userInfo.username;
           // broadcast change
           const nameChange = `${oldUsername} changed name to ${userInfo.username}`;
           broadcastFrom(room_id, id, nameChange);
           // add error handling
           ws.send('ok');
         });
         break;
     }

     ws.on('close', () => disconnect(ws, id, socketIndex));
   });

   ws.send('connected to server');
 });

 wss.on('close', async () => {
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
      (messageJSON.type !== 'change_username' &&
        (!messageJSON?.room_id ||
        typeof messageJSON.room_id !== 'number')) ||
      ((messageJSON.type === 'post_question' ||
        messageJSON.type === 'post_response' ||
        messageJSON.type === 'choose_response' ||
        messageJSON.type === 'change_username') &&
       (!messageJSON?.text ||
        typeof messageJSON.text !== 'string')) ||
      (messageJSON.type === 'post_response' &&
       !messageJSON?.question_id)
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
