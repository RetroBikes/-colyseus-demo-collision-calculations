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
      direction: '',
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
      // Calculate the step size based on physical game area
      // size and the game virtual size setted on server.
      this.setState({
        areaVirtualSize: room.state.areaVirtualSize,
        stepSize: this.state.areaPhysicalSize / room.state.areaVirtualSize,
        direction: player.direction,
      });

      // Get the players data and the current player position.
      const newPlayers = this.state.players,
        currentPlayerPart = player.currentPosition;
      let existingPlayerParts = [];

      // Take the player parts, if already exists.
      if ('undefined' !== typeof newPlayers[sessionId]) {
        existingPlayerParts = newPlayers[sessionId].parts;
      }

      // Calculate the true position of the player new step based on stepSize setted above.
      existingPlayerParts.push(currentPlayerPart.x * this.state.stepSize);
      existingPlayerParts.push(currentPlayerPart.y * this.state.stepSize);

      // Update players list (and update game state on canvas automagically).
      delete newPlayers[sessionId];
      newPlayers[sessionId] = {
        parts: existingPlayerParts,
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

    window.addEventListener('keydown', event => {
      let direction = '';
      switch (event.which) {
        case 38: direction = 'up'; break;
        case 39: direction = 'right'; break;
        case 40: direction = 'down'; break;
        case 37: direction = 'left'; break;
      }
      if ('' === direction) {
        return;
      }
      room.send({ direction: direction });
    });
  }
}

export default Game;
