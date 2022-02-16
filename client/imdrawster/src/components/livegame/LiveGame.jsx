import React from 'react';
import { Button } from 'react-bootstrap';
import Board from '../board/Board';
import HoldingScreen from '../holdingscreen/HoldingScreen';

import './style.css';

class LiveGame extends React.Component
{
  constructor(props) {
    super(props);

    this.state = {
      inGame: false,
      prompt: "",
      gameOver: false,
      imdrawsterWin: false,
      imdrawsterName: "",
      guessesArray: [],
    };

    this.returnToLobby = this.returnToLobby.bind(this);
  }

  componentDidMount() {

    this.props.socket.on("game-over", (imdrawsterWin, prompt, imdrawsterName, guessesArray) => {
      this.setState({ imdrawsterWin: imdrawsterWin, prompt: prompt, gameOver: true, imdrawsterName: imdrawsterName, guessesArray: guessesArray});
    });

    this.props.socket.on("player-is-in-game", () => {
      this.setState({ inGame: true });
    });

    this.props.socket.emit("in-game-ask");
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners("game-over");
    this.props.socket.removeAllListeners("player-is-in-game");
  }

  returnToLobby() {
    this.props.socket.emit("returning-to-lobby");
  }

  render() {

    let compo;
    let guessCompo;
    let guesses;
    if (this.state.gameOver) {
      if (this.state.guessesArray.length > 0) {
        guesses = this.state.guessesArray.map((guess, i) => <p key={i}>{guess}</p>);
        guessCompo = 
        <>
          <p>Imdrawster's guesses:</p>
          {guesses}
        </>;
      }
      compo =
      <div className="game-over-container">
        <h1 className="overflow-text">Imdrawster {this.state.imdrawsterWin ? 'Wins' : 'Loses'}</h1>
        <h3 className="overflow-text">{this.state.imdrawsterName} was the Imdrawster</h3>
        <h3 className="overflow-text">The drawing prompt was {this.state.prompt}</h3>
        {guessCompo}
        <Button onClick={this.returnToLobby}>Return to lobby</Button>
      </div>;
    } else if (this.state.inGame){
      compo = 
      <div className="live-game-container">
        <div className="board-container">
          <Board socket={this.props.socket}/>
        </div>
      </div>;
    } else {
      compo = 
      <HoldingScreen socket={this.props.socket}/>;
    }

    return (
      <>
        {compo}
      </>
    )
  }
}

export default LiveGame