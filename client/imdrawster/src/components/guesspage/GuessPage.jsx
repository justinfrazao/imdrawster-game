import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import './style.css';

class GuessPage extends React.Component
{
  constructor(props) {
    super(props);

    this.state = {
      guesses: [],
      currentGuess: "",
    };

    this.handleGuessChange = this.handleGuessChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.props.socket.on("imdrawster-guess", (guess, arrayLength) => {
      this.setState({ guesses: [...this.state.guesses, guess]});
    });
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners("imdrawster-guess");
  }

  handleGuessChange = (event) => {
    this.setState({ currentGuess: event.target.value });
  };

  onSubmit = (event) => {
    event.preventDefault();
    if (this.state.currentGuess === "") {
      alert("Enter your guess");
    } else {
      this.props.socket.emit("imdrawsters-guess", this.state.currentGuess, [...this.state.guesses, this.state.currentGuess]);
      this.setState({ currentGuess: "" });
    }
  }

  render() {
    let compo = 
      <Form onSubmit={this.onSubmit} className="enter-guess">
        <Form.Control
          type="text"
          placeholder="Guess"
          value={this.state.currentGuess}
          onChange={this.handleGuessChange}
          className="guess-input"
        />
        <div className="btn-holder">
          <Button variant="primary" type="submit" className="submit-btn">Submit</Button>
        </div>
      </Form>;
    let guessList = this.state.guesses.map((guess, i) => <li key={i}>{guess}</li>);
    return (
      <>
        <Modal.Header>
          <Modal.Title>Imdrawster is Guessing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="guess-list">{guessList}</ul>
          {this.props.isImdrawster ? compo : null}
        </Modal.Body>
      </>
    )
  }
}

export default GuessPage