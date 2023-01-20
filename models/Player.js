module.exports = class Player {
  constructor(_id, username) {
    this._id = _id;
    this.username = username;
    this.roomCreator = false;
    this.gameReady = false;
    this.score = 0;
  }
};
