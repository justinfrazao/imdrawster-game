const LiveGame = require('../models/LiveGame');

const createGameDatabase = async (roomId) => {
  try {
    const liveGame = new LiveGame({code: roomId});
    const createdGame = await liveGame.save();
    return createdGame.code;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const gameInDatabase = (roomId) => {
  try {
    LiveGame.find({ code: roomId }).exec((error, result) => {
      if (error) {
        return false;
      } else {
        if (result == null) return false;
        return true;
      }
    });
  } catch (error) {
    console.log(error);
  }
};
  
const playersInDatabase = (roomId, callback) => {
  try {
    LiveGame.find(
      { code: roomId },
      ["names"]).exec(
        (error, players) => {
          if (error) {
            console.log(error);
          } else {
            callback(players);
          }
        }
      );
  } catch (error) {
    console.log(error);
  }
};

const doesRoomExist = (roomId, callback) => {
  try {
    const foundGame = LiveGame.find({code: roomId}, (err, games) => {
      callback(err, games);
    });
  } catch (error) {
    console.log(error);
  }
};

const addPlayerDatabase = (roomId, socketid, nickname) => {
  try {
    LiveGame.updateOne(
      { code: roomId },
      { $push: { names: { socketid: socketid, name: nickname } } },
      (error, success) => {
        if (error) {
          console.log(error);
        } else {
          //console.log(success);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const removePlayerDatabase = (roomId, socketid) => {
  try {
    LiveGame.updateOne(
      { code: roomId },
      { $pull: { names: { socketid: socketid } } },
      (error, success) => {
        if (error) {
          console.log(error);
        } else {
          //console.log(success);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createGameDatabase,
  gameInDatabase,
  playersInDatabase,
  doesRoomExist,
  addPlayerDatabase,
  removePlayerDatabase,
};