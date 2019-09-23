import React from 'react';
import { Frame, createTheme } from 'arwes';
import * as Colyseus from 'colyseus.js';
import { Stage, Layer, Line } from 'react-konva';
import './game.css';

class Game extends React.Component {
  constructor() {
    super();
    const client = new Colyseus.Client('ws://localhost:2567');
    client.joinOrCreate('my_room').then(room => this.initializeGame(room));
    this.state = {
      areaPhysicalSize: window.innerHeight - 60,
      areaVirtualSize: 0,
      stepSize: 0,
      players: {},
    };
  }

  render () {
    const theme = createTheme();
    return (
      <div class="game">
      <Frame animate={true} level={3} corners={4} layer='primary' classes="game-frame">
        <Stage width={this.state.areaPhysicalSize} height={this.state.areaPhysicalSize}>
          <Layer>
            {Object.keys(this.state.players).map(playerId =>
              <Line
                points={this.state.players[playerId].parts}
                stroke={theme.color.primary.dark}
                strokeWidth={this.state.stepSize}
              />
            )}
          </Layer>
        </Stage>
      </Frame>
    </div>
    );
  }

  initializeGame(room) {
    const updateUserState = (player, sessionId) => {
      const newPlayers = this.state.players,
        currentPlayerPart = player.currentPlayerPosition;
      this.setState({
        areaVirtualSize: room.state.areaVirtualSize,
        stepSize: this.state.areaPhysicalSize / room.state.areaVirtualSize,
      });
      let existingPLayerParts = [];
      if ('undefined' !== typeof newPlayers[sessionId]) {
        existingPLayerParts = newPlayers[sessionId].parts;
      }
      existingPLayerParts.push(currentPlayerPart.x * this.state.stepSize);
      existingPLayerParts.push(currentPlayerPart.y * this.state.stepSize);
      delete newPlayers[sessionId];
      newPlayers[sessionId] = {
        parts: existingPLayerParts,
      };
      this.setState({ players: newPlayers });
    };
    room.state.players.onAdd = updateUserState;
    room.state.players.onChange = updateUserState;
    room.state.players.onRemove = (_, sessionId) => {
      const newPlayers = this.state.players;
      delete newPlayers[sessionId];
      this.setState({ players: newPlayers });
    };
    window.addEventListener('keydown', function (e) {
      switch (e.which) {
        case 38: room.send({ direction: 'up' }); break;
        case 39: room.send({ direction: 'right' }); break;
        case 40: room.send({ direction: 'down' }); break;
        case 37: room.send({ direction: 'left' }); break;
      }
    });
  }
}

export default Game;
