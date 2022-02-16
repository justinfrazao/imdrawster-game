import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from './components/container/Container';
import Home from './components/home/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home/>}/>
        <Route exact path="/:roomId" element={<Container/>}/>
      </Routes>
    </Router>
  );
}

export default App;
