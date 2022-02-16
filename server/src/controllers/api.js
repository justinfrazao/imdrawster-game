const express = require("express");
const router = new express.Router();
const { createGameDatabase, gameInDatabase, doesRoomExist } = require('../data/liveGameService');

router.get('/room/:roomId', async (req, res) => {
  doesRoomExist(req.params.roomId, (err, games) => {
    if (err) return res.send(false);
    if (games.length < 1) {
      res.send(false);
    } else {
      res.send(true);
    }
  });
});
  
// This creates a lobby, not a game instance
router.post('/create', async (req, res) => {
  var roomCode;
  do {
    roomCode = '';
    var possible = "abcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < 4; i++) {
      roomCode += possible.charAt(
        Math.floor(Math.random() * possible.length)
      );
    }
  } while (gameInDatabase(roomCode));
  //above searches database for code
  res.send(await createGameDatabase(roomCode));
});

module.exports = router;