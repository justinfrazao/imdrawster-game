const Game = require('../domain/game');
const gameWords = require('../domain/words_en.json');
const { gameInDatabase, playersInDatabase, doesRoomExist, addPlayerDatabase, removePlayerDatabase } = require('../data/liveGameService');

let gameInstances = {};

module.exports = (io, socket) => {

  const { roomId, nickname, isPlayer } = socket.handshake.query;
  //Double check here that room is still valid
  doesRoomExist(roomId, (err, games) => {
    if (err) return socket.disconnect(true);
    if (games.length < 1) {
      socket.disconnect(true);
    }
  });
  

  socket.join(roomId);

  
  if (isPlayer === 'true') {
    addPlayerDatabase(roomId, socket.id, nickname);
  } else {
    //Game instance connected
  }

  socket.on('status-ask', () => {
    io.in(roomId).emit('status-update', { isGameLive: gameInstances.hasOwnProperty(roomId) });
  });

  socket.on('lobby-ask', () => {
    playersInDatabase(roomId, (playersInData) => {
      if (playersInData.length > 0) {
        io.in(roomId).emit('lobby-update', { players: playersInData[0].names });
      } else {
        if (gameInDatabase(roomId)) {

        } else {
          socket.disconnect(true);
        }
      }
    });
  });

    //socket on play game event
    socket.on('start-game', (data) => {
      if (!gameInstances.hasOwnProperty(roomId)) {
        playersInDatabase(roomId, (playersInData) => {
          if (playersInData.length > 0) {
            gameInstances[roomId] = new Game(roomId, playersInData[0].names, gameWords.words_en[Math.floor(Math.random() * gameWords.words_en.length)], () => {
              //This is the function to handle the deletion of the game instance, not the lobby
              if (gameInstances.hasOwnProperty(roomId)) {
                gameInstances[roomId].close();
                gameInstances[roomId] = null;
                delete gameInstances[roomId];
              }
              io.in(roomId).emit('status-update', { isGameLive: gameInstances.hasOwnProperty(roomId) });
            });
            //Maybe substitute this status-update with one directed by the game instance itself
            gameInstances[roomId].play(roomId);
          } else {
            if (gameInDatabase(roomId)) {

            } else {
              socket.disconnect(true);
            }
          }
        });
      }
    });

    socket.on('ready-to-play', () => {
      io.in(roomId).emit('status-update', { isGameLive: gameInstances.hasOwnProperty(roomId) });
    });

    socket.on('in-game-ask', () => {
      //client is looking for canJoin flag as well as player button list in return
      io.in(roomId).emit('is-player-in-game');
    });

    socket.on('player-is-in-game', (players) => {
      players.forEach(player => {
        socket.to(player.socketid).emit('player-is-in-game');
      });
    });

    socket.on('drawing-prompt-server', (imSockID, players, prompt, category) => {
      players.forEach(player => {
        if (player.socketid === imSockID) {
          socket.to(imSockID).emit('isImdrawster', category);
        } else {
          socket.to(player.socketid).emit('drawing-prompt', prompt, category);
        }
      });
    });

    socket.on('board-ask', () => {
      io.in(roomId).emit('board-ask', socket.id);
    });

    socket.on('current-player-server', (player, bool) => {
      socket.to(player.socketid).emit('current-player', bool);
      if (bool) {
        io.in(roomId).emit('who-is-drawing', player.name);
      }
    });

    socket.on('can-player-vote', (players, canVote) => {
      players.forEach(player => {
        socket.to(player.socketid).emit('can-player-vote', canVote[player.index]);
      });
    });

    socket.on('player-submission', (data) => {
      io.in(roomId).emit('canvas-data', data);
      io.in(roomId).emit('player-submission-game', data);
    });

    socket.on('canvas-data', (sockId, data) => {
      socket.to(sockId).emit('canvas-data', data);
    });

    socket.on('imdrawster-guessing', () => {
      io.in(roomId).emit('cannotJoin', true);
      io.in(roomId).emit('imdrawster-guessing');
    });

    socket.on('imdrawsters-guess', (guess, guessesArray) => {
      io.in(roomId).emit('imdrawster-guess', guess, guessesArray);
    });

    socket.on('initiate-vote', () => {
      io.in(roomId).emit('initiate-vote', socket.id);
    });

    socket.on('go-vote', (players, canvasObjs) => {
      io.in(roomId).emit('go-vote', players, canvasObjs);
    });

    socket.on('player-vote', (playerSelected) => {
      io.in(roomId).emit('player-vote', playerSelected, socket.id);
    });

    socket.on('close-vote', () => {
      io.in(roomId).emit('close-vote');
    });

    socket.on('end-game', (imdrawsterWin, prompt, imdrawsterName, guessesArray) => {
      io.in(roomId).emit('game-over', imdrawsterWin, prompt, imdrawsterName, guessesArray);
    });

    socket.on('returning-to-lobby', () => {
      io.in(roomId).emit('return-to-lobby');
    });

    socket.on('disconnects', (disconnects, cannotJoin) => {
      io.in(roomId).emit('cannotJoin', cannotJoin);
      io.in(roomId).emit('disconnects', disconnects);
    });

    socket.on('disconnect-ask', () => {
      io.in(roomId).emit('disconnect-ask',  );
    });

    socket.on('replace-player', (playerIndex) => {
      io.in(roomId).emit('replace-player', playerIndex, {socketid: socket.id, name: nickname, index: playerIndex});
    });

  socket.on('disconnect', () => {

    io.in(roomId).emit('player-disconnecting', socket.id);
    socket.leave(roomId);

    if (isPlayer) {
      removePlayerDatabase(roomId, socket.id);
    }

    playersInDatabase(roomId, (playersInData) => {
      if (playersInData.length > 0) {
        io.in(roomId).emit('lobby-update', { players: playersInData[0].names });
      }
    });
  });
}
