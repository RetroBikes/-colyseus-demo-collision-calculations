import React from 'react';
import { Frame, Button, Heading, Link } from 'arwes';
import './home.css';
import { Stage, Layer, Rect } from 'react-konva';

class Home extends React.Component {
  render () {
    return (
      <div class="home">
        <div class="home-inner">
          <Frame animate={true} level={3} corners={4} layer='primary' classes="game-frame"
            style={{height: '100px', margin: '0 auto 15px', width: '100px'}}>
            <Stage width={window.innerWidth} height="100">
              <Layer>
                <Rect
                  x={20} y={20}
                  width={50}
                  height={50}
                  fill="#ffffff"
                  shadowBlur={5}
                />
              </Layer>
            </Stage>
          </Frame>
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
