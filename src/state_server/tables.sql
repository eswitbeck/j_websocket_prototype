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
  room_id int NOT NULL,
  text varchar(255),
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (room_id) REFERENCES Rooms(id)
);

CREATE TABLE Replies (
  id SERIAL PRIMARY KEY,
  user_id int NOT NULL,
  room_id int NOT NULL,
  question_id int NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (room_id) REFERENCES Rooms(id),
  FOREIGN KEY (question_id) REFERENCES Questions(id)
);

CREATE TABLE UserRoomState (
  user_id int NOT NULL,
  room_id int NOT NULL,
  text varchar(255),
  FOREIGN KEY (user_id) REFERENCES Users(id),
  FOREIGN KEY (room_id) REFERENCES Rooms(id)
);
