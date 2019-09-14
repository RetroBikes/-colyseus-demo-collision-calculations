import React from 'react';
import { Frame, Button, Heading, Link, createTheme } from 'arwes';
import { Stage, Layer, Line } from 'react-konva';
import './home.css';

class Home extends React.Component {
  render () {
    const theme = createTheme();
    return (
      <div class="home">
        <div class="home-inner">
          <Frame animate={true} level={3} corners={4} layer='primary' classes="game-frame"
            style={{height: '90px', margin: '0 auto 15px', width: '90px'}}>
            <Stage width={window.innerWidth} height="100">
              <Layer>
                <Line
                  points={[20, 10, 20, 60, 40, 60, 40, 40, 70, 40, 70, 25, 40, 25, 40, 10, 80, 10]}
                  stroke={theme.color.primary.dark}
                  strokeWidth={5}
                />
                <Line
                  points={[80, 80, 80, 50, 50, 50, 50, 75, 10, 75, 10, 10, 30, 10 ]}
                  stroke={theme.color.secondary.base}
                  strokeWidth={5}
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
