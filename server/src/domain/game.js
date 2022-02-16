
class Game {
  constructor(code, players, prompt, closeGame) {
    this.code = code;
    this.players = players;
    this.prompt = prompt.text;
    this.category = prompt.category;
    this.currentPlayer = 0;
    this.imdrawster;
    this.closeGame = closeGame;
    this.socket;
    this.votes;
    this.voteCount;
    this.timeout;
    this.cannotJoin = false;
    this.voteOcurring = false;

    this.canvasObjects = {};
    this.canVote = {};
    this.hasVoted = {};
    this.disconnects = {};
  }

  //At start of game, pull snapshot of player list. Reference the snapshot for game logic and disconnect info
  play(roomId) {
    const isPlayer = false;
    this.socket = require('socket.io-client')(process.env.SOCKET_URL, {
      query: { roomId, isPlayer },
      path: '/socket',
    });

    // Shuffle the players for playing order (Fisher-Yates) and add index numbers for referencing
    var m = this.players.length, t, i;
    while(m) {
      i = Math.floor(Math.random() * m--);
      t = this.players[m];
      this.players[m] = this.players[i];
      this.players[i] = t;
      this.players[m].index = m;
      this.canvasObjects[m] = {"version":"4.5.1", "objects": []};
      this.canVote[m] = true;
      this.hasVoted[m] = false;
    }
    this.canvasObjects[-1] = {"version":"4.5.1", "objects": []};

    //Select a random index to be imdrawster
    this.imdrawster = Math.floor(Math.random() * this.players.length);

    this.timeout = setTimeout(this.closeGame, 3000000);

    this.socket.on('is-player-in-game', () => {
      this.socket.emit('player-is-in-game', this.players);
    });

    this.socket.on('board-ask', (sockId) => {
      this.socket.emit('drawing-prompt-server', this.players[this.imdrawster].socketid, this.players, this.prompt, this.category);
      this.socket.emit('current-player-server', this.players[this.currentPlayer], true);
      this.socket.emit('can-player-vote', this.players, this.canVote);
      this.socket.emit('canvas-data', sockId, this.canvasObjects[-1]);
      if (this.voteOcurring) {
        this.socket.emit('go-vote', this.players, this.canvasObjects);
      }
    });

    this.socket.on('player-submission-game', (canvasString) => {
      this.canvasObjects[-1] = JSON.parse(canvasString);
      this.canvasObjects[this.currentPlayer].objects.push(JSON.parse(canvasString).objects.pop());
      
      this.socket.emit('current-player-server', this.players[this.currentPlayer], false);
      this.currentPlayer++;
      if (this.currentPlayer >= this.players.length) {
        this.currentPlayer = 0;
      }
      this.socket.emit('current-player-server', this.players[this.currentPlayer], true);
    });

    this.socket.on('imdrawster-guess', (guess, guessesArray) => {
      if (guess.toLowerCase() === this.prompt.toLowerCase()) {
        this.socket.emit('end-game', true, this.prompt, this.players[this.imdrawster].name, guessesArray);
      } else if (guessesArray.length > 2) {
        this.socket.emit('end-game', false, this.prompt, this.players[this.imdrawster].name, guessesArray);
      }
    });

    this.socket.on('initiate-vote', (socketid) => {
      this.voteOcurring = true;

      let ind = this.players.findIndex(o => o.socketid === socketid);
      if (ind >= 0) {
        this.canVote[ind] = false;
      }

      this.socket.emit('go-vote', this.players, this.canvasObjects);
      this.voteCount = 0;
      this.votes = {};
      this.votes[-1] = 0;
      this.players.forEach(player => {
        this.votes[player.index] = 0;
      });
    });

    this.socket.on('player-vote', (playerSelected, socketid) => {
      let ind = this.players.findIndex(o => o.socketid === socketid);
      if (ind >= 0) {
        if (!this.hasVoted[ind]) {
          this.hasVoted[ind] = true;
          this.votes[playerSelected]++;
          this.voteCount++;
          this.checkVote();
        }
      }
    });

    this.socket.on('player-disconnecting', (socketid) => {
      let ind = this.players.findIndex(o => o.socketid === socketid);
      if (ind === this.imdrawster && this.cannotJoin) {
        this.socket.emit('end-game', false, this.prompt, this.players[this.imdrawster].name, []);
      }
      else if (ind >= 0) {
        this.disconnects[ind] = this.players[ind];
        this.socket.emit('disconnects', this.disconnects);
      }
    });

    this.socket.on('disconnect-ask', () => {
      this.socket.emit('disconnects', this.disconnects, this.cannotJoin);
    });

    this.socket.on('replace-player', (playerIndex, data) => {
      if (this.disconnects.hasOwnProperty(playerIndex)) {
        delete this.disconnects[playerIndex];
        this.players[playerIndex] = data;
        this.socket.emit('player-is-in-game', this.players);
      }
      this.socket.emit('disconnects', this.disconnects);
    });

    this.socket.on('imdrawster-guessing', () => {
      this.cannotJoin = true;
    });

    this.socket.on('return-to-lobby', () => {
      this.closeGame();
    });

    this.socket.emit('ready-to-play');

  }

  close() {
    //close this.timeout
    clearTimeout(this.timeout);
    this.timeout = null;
    //disconnect the instance from the lobby
    this.socket.close();
  }

  checkVote() {
    if (this.voteCount == this.players.length) {
      let tie = false, top = 0, topIndex;
      for (let index = -1; index < this.players.length; index++) {
        if (this.votes[index] > top) {
          top = this.votes[index];
          topIndex = index;
          tie = false;
        } else if (this.votes[index] == top) {
          tie = true;
        }
      }
      if (tie || topIndex == -1) {
        this.voteOcurring = false;
        this.socket.emit('close-vote');
        if (Object.values(this.canVote).every(v => v === false)) {
          this.socket.emit('end-game', true, this.prompt, this.players[this.imdrawster].name, []);
        }
        Object.keys(this.hasVoted).forEach(v => this.hasVoted[v] = false);
      } else {
        this.socket.emit('end-game', topIndex != this.players[this.imdrawster].index, this.prompt, this.players[this.imdrawster].name, [])
      }
    }
  }

}

module.exports = Game;