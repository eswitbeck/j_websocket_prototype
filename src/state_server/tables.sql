CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  username varchar(20) NOT NULL
);

CREATE TABLE Rooms (
  id SERIAL PRIMARY KEY,
  name varchar(20)
);

CREATE TABLE Questions (
  id SERIAL PRIMARY KEY,
  user_id int NOT NULL,
  room_id int NOT NULL
);

CREATE TABLE Replies (
  id SERIAL PRIMARY KEY,
  user_id int NOT NULL,
  room_id int NOT NULL
);

CREATE TABLE UserRoomState (
  user_id int NOT NULL,
  room_id int NOT NULL,
  text varchar(255)
);
