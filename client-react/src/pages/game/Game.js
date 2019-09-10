import React from 'react';
import { Frame } from 'arwes';
import './game.css';
import * as Colyseus from 'colyseus.js';

class Game extends React.Component {
  constructor() {
    super();
    const client = new Colyseus.Client('ws://localhost:2567');
    client.joinOrCreate('my_room').then(room => this.initializeGame(room));
    this.players = {};
  }

  render () {
    return (
      <div class="game">
      <Frame animate={true} level={3} corners={4} layer='primary' classes="game-frame">
      </Frame>
    </div>
    );
  }

  initializeGame(room) {
    var colors = ['red', 'green', 'yellow', 'blue', 'cyan', 'magenta'];

    // listen to patches coming from the server
    room.state.players.onAdd = (player, sessionId) => {
      var dom = document.createElement("div");
      dom.className = "player";
      dom.style.left = player.x + "px";
      dom.style.top = player.y + "px";
      dom.style.background = colors[Math.floor(Math.random() * colors.length)];
      dom.innerHTML = "Player " + sessionId;

      this.players[sessionId] = dom;
      document.body.appendChild(dom);
    }

    room.state.players.onRemove = (player, sessionId) => {
      document.body.removeChild(this.players[sessionId]);
      delete this.players[sessionId];
    }

    room.state.players.onChange = (player, sessionId) => {
      var dom = this.players[sessionId];
      dom.style.left = player.x + "px";
      dom.style.top = player.y + "px";
    }

    window.addEventListener("keydown", function (e) {
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
