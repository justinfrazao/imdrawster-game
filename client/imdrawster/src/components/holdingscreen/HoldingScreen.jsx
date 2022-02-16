import React from 'react';
import { Button } from 'react-bootstrap';

import './style.css';

class HoldingScreen extends React.Component
{
  constructor(props) {
    super(props);

    this.state = {
      disconnects: {},
      cannotJoin: true,
    };

    this.replacePlayer = this.replacePlayer.bind(this);
  }

  componentDidMount() {

    this.props.socket.on("disconnects", (disconnects) => {
      this.setState({ disconnects: disconnects });
    });

    this.props.socket.on("cannotJoin", (cannotJoin) => {
      this.setState({ cannotJoin: cannotJoin});
    });

    this.props.socket.emit("disconnect-ask");
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners("disconnects");
    this.props.socket.removeAllListeners("cannotJoin");
  }

  replacePlayer(playerIndex) {
    this.props.socket.emit("replace-player", playerIndex);
  }

  render() {
    let disconnectList = 
      Object.keys(this.state.disconnects).map((disconnectKey, i) => 
        <Button key={i} variant="primary" onClick={() => this.replacePlayer(disconnectKey)} disabled={this.state.cannotJoin}>{this.state.disconnects[disconnectKey].name}</Button>
      );
    
    return (
      <>
        <div>A game is currently active.</div>
        <div>Replace a disconnected player or wait until this game ends.</div>
        <div>{disconnectList}</div>
      </>
    )
  }
}

export default HoldingScreen
