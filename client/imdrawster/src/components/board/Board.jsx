import { fabric } from "fabric";
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import GuessPage from '../guesspage/GuessPage';
import VotePage from '../votepage/VotePage';
import PromptDisplay from '../prompt/PromptDisplay';
import './style.css';

class Board extends React.Component
{
  timeout;
  canvas;
  canvasVersions = [];

  
  constructor(props) {
    super(props);

    this.state = {
      canSubmit: false,
      canRedo: false,
      prompt: "",
      isImdrawster: false,
      canVote: true,
      showGuess: false,
      showVote: false,
      playerDrawing: "",
      players: [],
      brushColor: "#000000",
      canvasObjects: {},
    }

    //this.setDrawingToTrue = this.setDrawingToTrue.bind(this);
    this.submitDrawing = this.submitDrawing.bind(this);
    this.undoDrawing = this.undoDrawing.bind(this);
    this.redoDrawing = this.redoDrawing.bind(this);
    this.imdrawsterGuess = this.imdrawsterGuess.bind(this);
    this.playerVote = this.playerVote.bind(this);
    this.handleBrushColorChange = this.handleBrushColorChange.bind(this);
  }

  componentDidMount() {

    this.canvas = new fabric.Canvas('drawarea');
    this.canvasVersions[0] = JSON.stringify(this.canvas);
    fabric.Object.prototype.selectable = false;
    this.canvas.selection = false;
    this.canvas.isDrawingMode = false;
    this.canvas.freeDrawingBrush.width = 5;
    this.canvas.on('mouse:up', () => {
      if (this.canvas.isDrawingMode) {
        this.canvas.isDrawingMode = false;
        this.canvasVersions[1] = JSON.stringify(this.canvas);
        this.setState({ canSubmit: true });
      }
    });


    this.props.socket.on("canvas-data", (data) => {
      this.canvas.loadFromJSON(data);
      this.canvasVersions[0] = data;
    });

    this.props.socket.on("current-player", (data) => {
      this.canvas.isDrawingMode = data;
    });

    this.props.socket.on("who-is-drawing", (data) => {
      this.setState({playerDrawing: data});
    });

    this.props.socket.on("drawing-prompt", (prompt, category) => {
      this.setState({ prompt: prompt, category: category });
    });

    this.props.socket.on("isImdrawster", (category) => {
      this.setState({ prompt: "You are the Imdrawster", category: category, isImdrawster: true });
    });

    this.props.socket.on("can-player-vote", (canVote) => {
      this.setState({ canVote: canVote });
    });

    this.props.socket.on("imdrawster-guessing", () => {
      this.setState({ showGuess: true });
    });

    this.props.socket.on("go-vote", (players, canvasObjs) => {
      if (!this.state.showVote) {
        let stateCanvasObjects = canvasObjs;
        stateCanvasObjects[-1] = JSON.stringify(canvasObjs[-1]);
        players.forEach(player => {
          stateCanvasObjects[player.index] = JSON.stringify(canvasObjs[player.index]);
        });
        this.setState({ showVote: true, players: players, canvasObjects: stateCanvasObjects});
      }
    });
    
    this.props.socket.on("close-vote", () => {
      this.setState({ showVote: false});
    });

    this.props.socket.emit("board-ask");
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners("canvas-data");
    this.props.socket.removeAllListeners("current-player");
    this.props.socket.removeAllListeners("who-is-drawing");
    this.props.socket.removeAllListeners("drawing-prompt");
    this.props.socket.removeAllListeners("isImdrawster");
    this.props.socket.removeAllListeners("can-player-vote");
    this.props.socket.removeAllListeners("imdrawster-guessing");
    this.props.socket.removeAllListeners("go-vote");
    this.props.socket.removeAllListeners("close-vote");
  }

  submitDrawing() {
    this.props.socket.emit('player-submission', JSON.stringify(this.canvas));
    this.setState({ canSubmit: false, canRedo: false });
  }

  undoDrawing() {
    this.canvas.loadFromJSON(this.canvasVersions[0]);
    this.setState({ canSubmit: false, canRedo: true });
    this.canvas.isDrawingMode = true;
  }

  redoDrawing() {
    this.canvas.loadFromJSON(this.canvasVersions[1]);
    this.setState({ canSubmit: true, canRedo: false });
    this.canvas.isDrawingMode = false;
  }

  imdrawsterGuess() {
    //Guessing Modal
    this.props.socket.emit("imdrawster-guessing");
  }

  playerVote() {
    this.setState({canVote: false});
    this.props.socket.emit("initiate-vote");
  }

  handleBrushColorChange(event) {
    this.setState({brushColor: event.target.value}, () => {
      this.canvas.freeDrawingBrush.color = this.state.brushColor;
    });
  }


  render() {
    let submitCompo;
    let undoCompo;
    let redoCompo;
    let voteCompo = null;
    let guessCompo = null;
    if (this.state.canSubmit)  {
      submitCompo = <Button onClick={this.submitDrawing} className="draw-button">Submit</Button>;
      undoCompo = <Button onClick={this.undoDrawing} className="draw-button">Undo</Button>;
    } else if (this.state.canRedo) {
      redoCompo = <Button onClick={this.redoDrawing} className="draw-button">Redo</Button>;
    }
    if (this.state.isImdrawster) {
      guessCompo = <Button variant="danger" onClick={this.imdrawsterGuess} className="game-button">Guess</Button>;
    }
    if (this.state.canVote) {
      voteCompo = <Button onClick={this.playerVote} className="game-button">Vote</Button>
    }
    return (
      <div className="board-width">
        <Modal show={this.state.showGuess} backdrop="static">
          <GuessPage socket={this.props.socket} isImdrawster={this.state.isImdrawster}/>
        </Modal>

        <Modal show={this.state.showVote} backdrop="static">
          <VotePage socket={this.props.socket} players={this.state.players} canvasObjects={this.state.canvasObjects}/>
        </Modal>

        <PromptDisplay prompt={this.state.prompt} category={this.state.category}/>
        <p>{this.state.playerDrawing} is drawing</p>

        <div className="brush-container">
          <input
            type="color"
            value={this.state.brushColor}
            onChange={this.handleBrushColorChange}/>
        </div>

        <div className="sketch" id="sketch">
          <canvas width="342" height="420" id="drawarea"></canvas>
        </div>
        <div className="board-buttons">
          <div className="game-buttons">
            {undoCompo}
            {submitCompo}
            {redoCompo}
          </div>
          <div className="game-buttons">
            {voteCompo}
            {guessCompo}
          </div>
        </div>
      </div>
    )
  }

}

export default Board