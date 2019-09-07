import React from 'react';
import { Button, Heading, Link } from 'arwes';
import './home.css';

class Home extends React.Component {
  render () {
    return (
      <div class="home">
        <div class="home-inner">
          <Heading node='h1'>React Colyseus Demo</Heading>
          <Button animate layer='alert'>
            <Link href="/game">Entrar</Link>
          </Button>
        </div>
      </div>
    );
  }
}

export default Home;
