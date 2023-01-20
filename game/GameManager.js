/**
 * GameManager.js
 *
 * Handles game logic
 *
 */
const GAME_STATE_WAITING = 1;
const GAME_STATE_STARTED = 2;
const GAME_STATE_CHOOSING_WORD = 3;
const GAME_STATE_DRAWING = 4;
const GAME_STATE_END = 5;
const Words = require("./wordList");
const User = require("../User/UserModel");

module.exports = class GameManager {
  constructor(playerManager) {
    this.playerManager = playerManager;
    this.state = GAME_STATE_WAITING;
    this.guessedPlayers = new Set(); // # of players that have correctly guessed the drawing
    this.started = false;
    this.rounds = 3;
    this.currentRound = 1;
    this.currentDrawer = "none";
    this.currentDrawerIndex = 0;
    this.word = "";
    this.wordOptions = [];
    this.counter = 30;
    this.winner = "";
    this.interval = null;
  }

  startGame(rounds, counter) {
    this.playerManager.resetScores();
    this.rounds = rounds;
    this.counter = counter;
    this.wordOptions = Words.getWordOptions();
    this.state = GAME_STATE_CHOOSING_WORD;
    this.currentRound = 1;
    this.currentDrawerIndex = 0;
    this.currentDrawer =
      this.playerManager.playerList[this.currentDrawerIndex].username;
  }

  chooseWord(word) {
    this.word = word;
    this.state = GAME_STATE_DRAWING;
  }

  removePlayer(playerId) {
    this.playerManager.removePlayer(playerId);
    if (this.state !== 1) {
      if (this.playerManager.getPlayerCount() === 1) {
        clearInterval(this.interval);
        this.state = GAME_STATE_END;
        this.winner = this.playerManager.playerList[0].username;
      }
      if (this.playerManager.getPlayerCount() < this.currentDrawerIndex) {
        this.currentDrawerIndex = this.currentDrawerIndex - 1;
      }
    }
  }

  calculateScore() {
    return 1000 - this.guessedPlayers.size * 100 + this.counter * 50;
  }

  increaseDrawerScore() {
    this.playerManager.playerList[this.currentDrawerIndex].score =
      this.playerManager.playerList[this.currentDrawerIndex].score +
      100 * this.guessedPlayers.size;
  }

  increasePlayerScore(player) {
    player.score = player.score + this.calculateScore();
    this.guessedPlayers.add(player._id);
  }

  checkGuess(guess) {
    if (this.word.toLowerCase() == guess.toLowerCase()) {
      return true;
    } else {
      return false;
    }
  }

  checkCorrectGuesses() {
    if (this.guessedPlayers.size === this.playerManager.getPlayerCount() - 1) {
      return true;
    }
    return false;
  }

  getPlayersSortedByScore() {
    var players = JSON.parse(JSON.stringify(this.playerManager.playerList));
    return players.sort((a, b) => b.score - a.score);
  }

  nextGameState() {
    if (this.currentDrawerIndex < this.playerManager.getPlayerCount() - 1) {
      this.guessedPlayers.clear();
      this.increaseDrawerScore();
      this.currentDrawerIndex = ++this.currentDrawerIndex;
      this.wordOptions = Words.getWordOptions();
      this.state = GAME_STATE_CHOOSING_WORD;
    } else {
      if (this.currentRound < this.rounds) {
        this.guessedPlayers.clear();
        this.currentRound = ++this.currentRound;
        this.increaseDrawerScore();
        this.currentDrawerIndex = 0;
        this.wordOptions = Words.getWordOptions();
        this.state = GAME_STATE_CHOOSING_WORD;
      } else {
        this.winner = this.playerManager.getWinner().username;
        User.findOneAndUpdate(
          { username: this.winner },
          { $inc: { wins: 1 } }
        ).exec();
        this.state = GAME_STATE_END;
      }
    }
    this.currentDrawer =
      this.playerManager.playerList[this.currentDrawerIndex].username;
  }

  getState() {
    return {
      state: this.state,
      currentDrawer: this.currentDrawer,
      currentRound: this.currentRound,
      numberOfRounds: this.rounds,
      word: this.word,
      wordOptions: this.wordOptions,
      winner: this.winner,
    };
  }
};
