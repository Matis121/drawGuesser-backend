/**
 * socketlogic.js
 *
 * Manage Socket IO Functionality
 *
 */

const Room = require("../models/Room");
const Words = require("../game/wordList");
const { count } = require("../User/UserModel");

let roomCollection = new Map();
exports.socketapp = function (io, socket) {
  // createGame - creates a new Room object and returns the roomCode
  socket.on("createGame", (data) => {
    socket.userId = data._id;
    let user = data;
    let room = new Room(data._id); // create new Room
    socket.room = room.roomCode;
    room.playerManager.addPlayer(user);
    room.playerManager.getPlayer(user._id).roomCreator = true;
    roomCollection.set(room.roomCode, room);
    socket.emit("roomCode", room.roomCode); // send code back to user
    socket.emit("host", room.creatorID);
    socket.join(room.roomCode); // Join Room
    sendPlayerList(room);
    sendGameUpdate(room);
  });

  // joinGame - join room using gameCode
  socket.on("joinGame", (data) => {
    socket.userId = data.user._id;
    const code = data.roomCode;
    const user = data.user;
    let room = roomCollection.get(code);

    if (room) {
      if (room.gameManager.state === 1) {
        // accept join room request
        socket.join(code);
        room.playerManager.addPlayer(user); // add self to Room's playerlist
        socket.emit("roomCode", room.roomCode); // send roomCode to user   // notify subscribers
        socket.emit("host", room.creatorID);
        socket.emit("joinSuccess");
        socket.room = room.roomCode;
        sendPlayerList(room);
      } else {
        // unable to join because game is in progress
        socket.emit("roomCode", room.roomCode); // send roomCode to user
        io.to(room.roomCode).emit("playerListUpdate", room.userlist); // notify subscribers
      }
    } else {
      // unable to find room
      socket.emit("error", "Room does not exist");
    }
  });

  socket.on("disconnect", () => {
    handleLeaveRoom(socket.room);
  });

  socket.on("leaveLobby", () => {
    let room;
    let roomCode = socket.room;
    if (roomCode) {
      room = roomCollection.get(roomCode);
    }
    if (room) {
      if (room.creatorID === socket.userId) {
        roomCollection.delete(socket.room);
      } else {
        room.gameManager.removePlayer(socket.userId);
      }
      socket.leave(socket.room);
    }
  });

  // room's creator starts game
  socket.on("playerListStart", (code) => {
    let room = roomCollection.get(code);
    let player = room.playerManager.getPlayer(socket.request.user._id);
    if (player.roomCreator && room.playerManager.playersReady()) {
      player.gameReady = true;
      room.gameManager.nextGameState();
      sendGameUpdate(room);
    }
    sendPlayerList(room);
  });

  // Send words to choose
  socket.on("wordOptions", () => {
    const words = Words.getWordOptions();
    socket.emit("wordOptionsUpdate", words);
  });

  // New chat message
  socket.on("newMessage", (data) => {
    const code = data.code;
    let room = roomCollection.get(code);
    let player = room.playerManager.getPlayer(data._id);
    let correct = room.gameManager.checkGuess(data.message);
    if (room.gameManager.currentDrawer !== player.username) {
      if (correct) {
        room.chatManager.newServerMessage(
          player.username + " has guessed the word!"
        );
        room.gameManager.increasePlayerScore(player);
        room.gameManager.increaseDrawerScore();
      }

      if (room.gameManager.checkCorrectGuesses()) {
        room.chatManager.newServerMessage(
          "The word was " + room.gameManager.word
        );
        room.gameManager.nextGameState();
        clearInterval(room.gameManager.interval);
        sendGameUpdate(room);
      }
      room.chatManager.newMessage(player.username, data.message, correct);
      sendMessageList(room);
      sendPlayerList(room);
    }
  });

  // Drawer chooses a ward
  socket.on("wordChosen", (data) => {
    const { code, word } = data;
    let room = roomCollection.get(code);
    room.gameManager.chooseWord(word);
    io.in(room.roomCode).emit("clearDrawing");
    room.chatManager.newServerMessage(
      room.gameManager.currentDrawer + " is drawing now!"
    );
  //   socket.on("timerGame", ({code, counter}) => {
  //     console.log("room code is: "+ code);
  //     console.log("Counter in game is : "+ counter);
  // })
    runTimer(code);
    sendGameUpdate(room);
    sendMessageList(room);
  });

  // Drawing
  socket.on("draw", ({ code, line }) => {
    socket.to(code).emit("drawLine", line);
  });

  // Player starts the game
  socket.on("startGame", ({ code, rounds }) => {
    console.log("Start Game" + rounds);
    let room = roomCollection.get(code);
    if (room.playerManager.getPlayerCount() > 1) {
      io.in(code).emit("startedGame");
      room.gameManager.startGame(rounds);
      room.chatManager.newServerMessage(
        room.gameManager.currentDrawer + " is choosing a word!"
      );
      sendMessageList(room);
      sendGameUpdate(room);
    } else {
      socket.emit("error", "Not enough players");
    }
  });

  // Handle leaving room
  function handleLeaveRoom(roomCode) {
    let room;
    if (roomCode) {
      room = roomCollection.get(roomCode);
    }
    if (room) {
      if (room.creatorID === socket.userId) {
        socket.to(room.roomCode).emit("roomDeleted");
        roomCollection.delete(socket.room);
      } else {
        room.gameManager.removePlayer(socket.userId);
        sendGameUpdate(room);
        sendPlayerList(room);
      }
    }
  }

  function sendPlayerList(room) {
    io.in(room.roomCode).emit(
      "playerListUpdate",
      room.gameManager.getPlayersSortedByScore()
    );
  }

  function sendMessageList(room) {
    io.in(room.roomCode).emit("messageUpdate", room.chatManager.messageList);
  }

  function sendGameUpdate(room) {
    io.in(room.roomCode).emit("gameUpdate", room.gameManager.getState());
  }

  function runTimer(code) {
    let room = roomCollection.get(code);
    room.gameManager.counter = 30;
    room.gameManager.interval = setInterval(() => {
      io.in(code).emit("timer", room.gameManager.counter);
      if (room.gameManager.counter === 0) {
        clearInterval(room.gameManager.interval);
        room.gameManager.nextGameState();
        room.chatManager.newServerMessage(
          "The word was " + room.gameManager.word
        );
        sendMessageList(room);
        sendGameUpdate(room);
      }
      room.gameManager.counter--;
    }, 1000);
  }

    // socket.on("timerGame", ({counter}) => {
    //     console.log("Atktualny timer wynosi: "+ counter)
    // })
};
