import React from 'react';
import { Frame } from 'arwes';
import './game.css';

const Game = () => {

  return (
    <div class="game">
      <Frame animate={true} level={3} corners={4} layer='primary' classes="game-frame">
      </Frame>
    </div>
  );
};

export default Game;
