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
      players: {},
    };
  }

  render () {
    const theme = createTheme();
    return (
      <div class="game">
      <Frame animate={true} level={3} corners={4} layer='primary' classes="game-frame">
        <Stage width={window.innerWidth - 60} height={window.innerHeight - 60}>
          <Layer>
            {Object.keys(this.state.players).map(playerId =>
              <Line
                points={this.state.players[playerId].parts}
                stroke={theme.color.primary.dark}
                strokeWidth={5}
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
        currentPlayerPart = player.playerParts[player.playerSize - 1];
      if ('undefined' === typeof newPlayers[sessionId]) {
        newPlayers[sessionId] = {
          parts: []
        };
      }
      newPlayers[sessionId].parts.push(currentPlayerPart.x);
      newPlayers[sessionId].parts.push(currentPlayerPart.y);
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
        case 38: room.send({ position: 'up' }); break;
        case 39: room.send({ position: 'right' }); break;
        case 40: room.send({ position: 'down' }); break;
        case 37: room.send({ position: 'left' }); break;
      }
    });
  }
}

export default Game;
