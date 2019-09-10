import React from 'react';
import Home from './pages/home/Home';
import Game from './pages/game/Game';
import { BrowserRouter, Route } from 'react-router-dom';

const Routes = () => (
  <BrowserRouter>
    <Route path="/" exact="true" component={Home} />
    <Route path="/game" exact="true" component={Game} />
  </BrowserRouter>
);

export default Routes;
