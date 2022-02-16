import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useSearchParams } from "react-router-dom";
import GameContainer from '../gamecontainer/GameContainer';

import './style.css';

const Nickname = (props) => {
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  const [nickname, setNickname] = useState("");
  const [nicknameComplete, setNicknameComplete] = useState(false);
  const [beforeLoad, setBeforeLoad] = useState(true);

  useEffect(() => {
    let paramName = searchParams.get("nickname");
    if (paramName) {
      setNickname(paramName.length > 22 ? paramName.substring(0, 22) : paramName);
      setNicknameComplete(true);
    }
    setBeforeLoad(false);
  }, [searchParams]);

  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  const handleSubmit = () => {
    if (nickname === "") {
      alert("Enter a name");
    } else {
      setNicknameComplete(true);
    }
  }
  if (beforeLoad) {
    return <Spinner animation="border" />;
  } else if (nicknameComplete) {
    return <GameContainer roomId={props.roomId} nickname={nickname} onDisconnect={props.onDisconnect}/>;
  } else {
    return (
      <div className="form-container">
        <Form onSubmit={handleSubmit} className="nickname">
          <Form.Control
            type="text"
            maxLength="22"
            placeholder="Nickname"
            value={nickname}
            onChange={handleNicknameChange}
            className="nickname-input"
          />
          <Button variant="primary" type="submit" className="submit-btn">Submit</Button>
        </Form>
      </div>
    );
  }
}

export default Nickname;