import { fabric } from "fabric";
import React from 'react';
import { Modal, ToggleButtonGroup, ToggleButton, Button } from 'react-bootstrap';
import './style.css';

class VotePage extends React.Component
{
  votingCanvas;

  constructor(props) {
    super(props);

    this.state = {
      players: this.props.players,
      playerSelected: "",
      notSelected: true,
      hasSubmitted: false,
    };

    this.votePick = this.votePick.bind(this);
    this.submitVote = this.submitVote.bind(this);
  }

  componentDidMount() {

    this.votingCanvas = new fabric.Canvas('votingcanvas');
    fabric.Object.prototype.selectable = false;
    this.votingCanvas.selection = false;
    this.votingCanvas.isDrawingMode = false;
    this.votingCanvas.loadFromJSON(this.props.canvasObjects[-1]);
  }

  votePick(event) {
    this.setState({ playerSelected: event, notSelected: false });
    this.votingCanvas.loadFromJSON(this.props.canvasObjects[event]);
  }

  submitVote() {
    this.setState({ hasSubmitted: true });
    this.props.socket.emit("player-vote", this.state.playerSelected);
  }

  render() {
    let playerButtons = 
      this.state.players.map((player, i) => 
        <ToggleButton 
          key={i}
          className="Voting-Toggle-Button"
          variant="secondary" 
          value={player.index}
          disabled={this.state.hasSubmitted}
        >
          {player.name}
        </ToggleButton>);
    return (
      <>
        <Modal.Header>
          <Modal.Title>Vote on the Imdrawster</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ToggleButtonGroup 
            vertical 
            type="radio"
            name="radio"
            value={this.state.playerSelected}
            onChange={this.votePick}
          >
            <ToggleButton className="Voting-Toggle-Button" variant="secondary" value={-1} disabled={this.state.hasSubmitted}>Skip Vote</ToggleButton>
            {playerButtons}
          </ToggleButtonGroup>
          <div className="voting-canvas-div">
            <canvas width="342" height="420" id="votingcanvas"></canvas>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={this.submitVote} disabled={this.state.notSelected || this.state.hasSubmitted}>Vote</Button>
        </Modal.Footer>
      </>
    )
  }
}

export default VotePage