import React from 'react';
import { Frame } from 'arwes';
import * as Colyseus from 'colyseus.js';
import { Stage, Layer, Rect } from 'react-konva';
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
    return (
      <div class="game">
      <Frame animate={true} level={3} corners={4} layer='primary' classes="game-frame">
        <Stage width={window.innerWidth - 60} height={window.innerHeight - 60}>
          <Layer>
            {Object.keys(this.state.players).map(playerId =>
              <Rect
                x={this.state.players[playerId].x}
                y={this.state.players[playerId].y}
                width={50}
                height={50}
                fill="blue"
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
      const newPlayers = this.state.players;
      newPlayers[sessionId] = {
        x: player.x,
        y: player.y,
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
        case 38: room.send({ position: 'up' }); break;
        case 39: room.send({ position: 'right' }); break;
        case 40: room.send({ position: 'down' }); break;
        case 37: room.send({ position: 'left' }); break;
      }
    });
  }
}

export default Game;
