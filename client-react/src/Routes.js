import React from 'react';
import Home from './pages/Home';
import { BrowserRouter, Route } from 'react-router-dom';

const Routes = () => (
  <BrowserRouter>
    <Route path="/" exact="true" component={Home} />
  </BrowserRouter>
);

export default Routes;
