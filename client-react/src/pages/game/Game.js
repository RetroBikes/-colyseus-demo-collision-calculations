import React from 'react';
import { Frame } from 'arwes';
import './game.css';
import * as Colyseus from 'colyseus.js';

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
        {Object.keys(this.state.players).map(playerId =>
          <div class="player" style={this.state.players[playerId]}>
            [{playerId}]
          </div>
        )}
      </Frame>
    </div>
    );
  }

  initializeGame(room) {
    const updateUserState = (player, sessionId) => {
      const newPlayers = this.state.players;
      newPlayers[sessionId] = {
        left: `${player.x}px`,
        top: `${player.y}px`,
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
