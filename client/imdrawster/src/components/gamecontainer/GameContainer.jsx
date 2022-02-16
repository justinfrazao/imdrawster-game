import React from 'react';
import io from 'socket.io-client';
import LiveGame from '../livegame/LiveGame';
import { Spinner, Button } from 'react-bootstrap';

import './style.css';

class GameContainer extends React.Component
{
  socket;
  
  constructor(props) {
    super(props);

    this.state = {
      beforeStatusResponse: true,
      isGameLive: false,
      playersInLobby: [],
    };

    const { roomId, nickname } = this.props;
    const isPlayer = true;
    this.socket = io.connect('/', {
      query: { roomId, nickname, isPlayer },
      reconnection: false,
      path: '/socket',
    });
    //if this.socket doesn't connect, lift up to Container that isValidLobby is now false
    this.onStartGame = this.onStartGame.bind(this);
  }

  componentDidMount() {
    this.socket.on("disconnect", () => {
      //lift up to Container that isValidLobby is now false
      this.props.onDisconnect();
    });

    this.socket.on("status-update", (data) => {
      //find out if game is live
      this.setState({ beforeStatusResponse: false, isGameLive: data.isGameLive });
      if (!data.isGameLive) {
        this.socket.emit("lobby-ask");
      }

    });
    this.socket.on("lobby-update", (data) => {
      this.setState({ playersInLobby: data.players });
    });

    this.socket.emit("status-ask");
  }

  componentWillUnmount() {
    this.socket.removeAllListeners("disconnect");
    this.socket.removeAllListeners("status-update");
    this.socket.removeAllListeners("lobby-update");
  }

  onStartGame() {
    this.socket.emit("start-game");
  }

  render() {

    let nameList;
    let playerList;
    let compo;
    if (this.state.beforeStatusResponse) {
      compo = <Spinner animation="border" />;
    } else if (this.state.isGameLive) {
      compo = <LiveGame socket={this.socket}/>;
    } else {
      playerList = this.state.playersInLobby.map((player, i) => <p key={i} className="lobby-name">{player.name}</p>);
      nameList = <div className="lobby-names">{playerList}</div>;
      compo = 
        <div className="lobby-screen">
          <h1>Lobby Code: {this.props.roomId}</h1>
          <h3>Players:</h3>
          {nameList}
          <Button onClick={this.onStartGame}>Start Game</Button>
        </div>;
    }

    return (
      <>
        {compo}
      </>
    )
  }
}

export default GameContainer