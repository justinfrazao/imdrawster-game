import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from "react-router-dom";
import { Spinner } from 'react-bootstrap';
import Nickname from '../nickname/Nickname';

import './style.css';


const Container = (props) => {
  const [isValidLobby, setIsValidLobby] = useState(false);
  const [beforeResponse, setBeforeResponse] = useState(true);
  const params = useParams();

  useEffect(() => {
    axios.get(`/api/room/${params.roomId}`)
      .then(response => {
        setIsValidLobby(response.data);
        setBeforeResponse(false);
      })
      .catch(error => {
        console.log(error);
        setIsValidLobby(false);
        setBeforeResponse(false);
      });
  }, [params.roomId]);

  const onDisconnect = () => {
    setIsValidLobby(false);
  };

  //check if lobby code provided is valid
  let compo;
  if (beforeResponse) {
    compo = <Spinner animation="border" />;
  } else if (isValidLobby) {
    compo = <Nickname roomId={params.roomId} onDisconnect={onDisconnect}/>;
  } else {
    compo = (
      <div className="invalid-lobby">
        <p>This lobby code does not exist</p>
        <Link to={'/'}>Return to homepage</Link>
      </div>
    );
  }
  return (
    <div className="base-container">
      {compo}
    </div>
  );

};

export default Container