import React from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

import "./style.css";

const Home = () => {
  const [roomName, setRoomName] = React.useState("");
  const navigate = useNavigate();

  const handleRoomNameChange = (event) => {
    setRoomName(event.target.value);
  };

  const linkToLobby = () => {
    navigate(`/${roomName}`);
  }

  const onCreateRoom = async () => {
    try {
      await axios.post('/api/create')
        .then(response => {
          setRoomName(response.data);
          navigate(`/${response.data}`);
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log(`Axios post request failed: ${error}`);
    }
  };

  return (
    <div className="home-container">
      <h1>Imdrawster</h1>
      <p>Use your drawing and deduction skills</p>
      <div className="flex-container">
        <div className="lobby-div">
          <Button onClick={onCreateRoom}>Create Lobby</Button>
          <h3>Or</h3>
          <Form onSubmit={linkToLobby} className="join-div">
            <Form.Control
              type="text"
              placeholder="Room"
              value={roomName}
              onChange={handleRoomNameChange}
              className="text-input-field"
            />
            <Button variant="primary" type="submit" className="join-lobby-button">Join Lobby</Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Home;