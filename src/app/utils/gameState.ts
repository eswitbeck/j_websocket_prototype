// TODO: should be packaged to throw specific errors
// TODO: define schema for returns
// wrapper for all state_server functions
const baseUrl = 'http://localhost:3001';

const get = async (url: string): Promise<any> => {
  return await fetch(url).then(r => r.json());
}

const post = async (url: string, body?: { [index: string]: string | number }): Promise<any> => {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : '',
  }).then(r => r.json());
}

const put = async (url: string, body?: { [index: string]: string | number }): Promise<any> => {
  return await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : '',
  }).then(r => r.json());
}

const fdelete = async (url: string, query?: { [index: string]: string | number }): Promise<any> => {
  if (query !== undefined) {
    const keyValues = Object.entries(query);
    const [firstKey, firstVal] = keyValues.shift();
    url = `${url}?${firstKey}=${firstVal}`;
    while (keyValues.length) {
      const [k, v] = keyValues.shift();
      url = `${url}&${k}=${v}`;
    }
  }
  return await fetch(url, {
    method: "DELETE"
  }).then(r => r.status === 204 ? 'success' : 'failure');
}

const fetchAndLog = (cb: Function, ...params: any[]): void => {
  cb(...params).then((r: any) => {
    console.log(r);
  });
}

// addQuestion
export const postQuestion = async (user_id: number, room_id: number, text: string): Promise<any> => {
  return await post(`${baseUrl}/questions/`, { user_id, room_id, text });
}

// updateQuestion
export const updateQuestion = async (question_id: number, text: string): Promise<any> => {
  return await put(`${baseUrl}/questions/${question_id}`, { text });
}

// addReply
export const postReply = async (user_id: number,
                                room_id: number,
                                question_id: number,
                                text: string
                               ): Promise<any> => {
  return await post(`${baseUrl}/replies/`, { user_id, room_id, question_id, text });
}

// getUsersInRoom
export const getUsersInRoom = async (room: number): Promise<any> => {
  return await get(`${baseUrl}/rooms/${room}/users/`);
}

// getRoom
export const getRoom = async (room: number): Promise<any> => {
  return await get(`${baseUrl}/rooms/${room}`);
}

// getAllRooms
export const getAllRooms = async (): Promise<any> => {
  return await get(`${baseUrl}/rooms`);
}

// createRoom
export const createRoom = async (name?: string): Promise<any> => {
  if (name !== undefined) return await post(`${baseUrl}/rooms`, { name });
  else return await post(`${baseUrl}/rooms`);
}

// updateRoom
export const updateRoom = async (room_id: number, name: string): Promise<any> => {
  return await put(`${baseUrl}/rooms/${room_id}/`, { name });
}

// deleteRoom
export const deleteRoom = async (room_id: number): Promise<any> => {
  return await fdelete(`${baseUrl}/rooms/${room_id}/`);
}

// joinRoom
export const joinRoom = async (user_id: number, room_id: number): Promise<any> => {
  return await post(`${baseUrl}/userRoomStates/`, { user_id, room_id });
}

// leaveRoom
export const leaveRoom = async (user_id: number, room_id: number): Promise<any> => {
  return await fdelete(`${baseUrl}/userRoomStates`, { user_id, room_id });
}

// updateScore (updateUserRoomState)
export const updateScore = async (user_id: number, room_id: number, amount: number): Promise<any> => {
  return await put(`${baseUrl}/userRoomStates/`, { user_id, room_id, amount });
}

// addUser
export const addUser = async (username?: string): Promise<any> => {
  if (username !== undefined) return await post(`${baseUrl}/users`, { username });
  else return await post(`${baseUrl}/users`);
}

// changeUsername (updateUser)
export const changeUsername = async (user_id: number, username: string): Promise<any> => {
  return await put(`${baseUrl}/users/${user_id}`, { username });
}

// deleteUser
export const deleteUser = async (user_id: number): Promise<any> => {
  return await fdelete(`${baseUrl}/users/${user_id}/`);
}
