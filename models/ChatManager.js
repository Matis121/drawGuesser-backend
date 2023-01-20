/**
 * ChatManager manages a list of Message objects
 * Message Object - represents a single message
 */

const uuid = require("uuid");

module.exports = class ChatManager {
  constructor() {
    this.messageList = [];
  }

  // creates a new message object with player object's _id.
  newMessage(username, message, correctGuess) {
    this.messageList.push(new Message(username, message, correctGuess));
  }

  // server custom message - messages sent from the server to the room
  newServerMessage(message) {
    this.messageList.push(new Message("SERVER", message, false));
  }

  // admin custom message - messages sent from admin to the room
  newAdminMessage(message) {
    this.messageList.push(new Message(2, message, false));
  }
};

class Message {
  constructor(username, message, correctGuess) {
    this.username = username;
    this.message = message;
    this.correctGuess = correctGuess;
  }
}
