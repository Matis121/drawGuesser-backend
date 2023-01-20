/**
 * PlayerManager manages a list of Player objects
 * Player Object - represents a user
 */

const Player = require("./Player");

module.exports = class PlayerManager {
  constructor() {
    this.playerList = [];
  }

  addPlayer(user) {
    if (this.getPlayer(user._id) === null) {
      this.playerList.push(new Player(user._id, user.username, user.name));
    }
  }

  removePlayer(player_id) {
    this.playerList = this.playerList.filter((user) => user._id !== player_id);
  }

  getPlayerCount() {
    return this.playerList.length;
  }

  getPlayer(player_id) {
    let usr = this.playerList.find((user) => {
      return JSON.stringify(player_id) === JSON.stringify(user._id);
    });
    if (usr) {
      return usr;
    }
    return null;
  }
  getWinner() {
    let winner = this.playerList.reduce((max, player) =>
      max.score > player.score ? max : player
    );
    return winner;
  }
  resetScores() {
    let players = this.playerList;

    for (let i = 0; i < players.length; i++) {
      players[i].score = 0;
    }
  }
};
