import React from 'react';
import { Button, Heading } from 'arwes';
import './home.css';

const Home = () => (
  <div class="home">
    <div class="home-inner">
      <Heading node='h1'>React Colyseus Demo</Heading>
      <Button animate layer='alert'>Entrar</Button>
    </div>
  </div>
);

export default Home;
