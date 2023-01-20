/**
 * Room object that manages the room session. Contains several components:
 * - PlayerManager Object - manages players in the room
 * - GameManager Object - manages the actual game
 * - ChatManager Object - manages the room's chat system
 */

const PlayerManager = require("./PlayerManager");
const ChatManager = require("./ChatManager");
const GameManager = require("../game/GameManager");

module.exports = class Room {
  constructor(creatorID) {
    this.creatorID = creatorID;
    this.roomCode = Room.generateRoomCode(4);
    this.playerManager = new PlayerManager();
    this.gameManager = new GameManager(this.playerManager);
    this.chatManager = new ChatManager(this.playerManager);
  }

  // generates a random string of length len
  static generateRoomCode(len) {
    let roomCode = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < len; i++) {
      roomCode += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
    }
    return roomCode;
  }
};
