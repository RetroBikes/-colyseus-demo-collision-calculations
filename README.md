![RetroBikes demo](https://avatars3.githubusercontent.com/u/54962401?s=150)
# RetroBikes demo
Research and development of the game general game rules.

## Overview
By now this game supports a multiplayer game with n players (you can define this on gameconfig file, see the 'Gameconfig quick reference' section for more).

When the number of players enter in the game room the game will start immediately.

As the players loses the game his occuped area will be freed, but the player still can watch the rest of game.

Because this still is a demo, all the visuals are very simple, as the fact the only forms to identify yourself is try to change direction (and risk lose the game), but this is a good start to build all this things.

## Kickstart the code
 * Do the clone: `https://github.com/RetroBikes/demo.git`
 * Go to server directory and start him
   * `cd demo/server`
   * `npm install`
   * `npm start`
 * Go to the client-react directory and start him
   * `cd demo/client-react`
   * `yarn install`
   * `yarn start`

## Gameconfig quick reference
This file will set the initial state / scenery for your game. It define all this stuff:
   * The clients number to start the game;
   * the virtual area size (a.k.a the area size based on the number of steps);
   * the initial players states, as the start position and direction.

On start positions, negative values means counting from right (on x axis) or bottom (on y axis). Just like an Python array.

This would a great place to set the players default colors, by example.

__The array on initialStates can't have minus items than clientsToPlay number or the server will break down by the initial player states information lack.__

Gameconfig file example, this considers four players, starting on each corner of the game area:
```json
{
    "clientsToPlay": 4,
    "areaVirtualSize": 150,
    "initialStates": [
        {
            "startPosition": {
                "x": 10,
                "y": 10
            },
            "initialDirection": "right"
        },
        {
            "startPosition": {
                "x": -10,
                "y": -10
            },
            "initialDirection": "left"
        },
        {
            "startPosition": {
                "x": -10,
                "y": 10
            },
            "initialDirection": "down"
        },
        {
            "startPosition": {
                "x": 10,
                "y": -10
            },
            "initialDirection": "up"
        }
    ]
}
```

## Going into the mathinery (hahaha I'm sorry)
This game works with virtual and physical sizes and locations. This means the server deal only with integer numbers starting with zero and ending with the game area size minus 1 (basic array setting). The client side will have to make all the calculus to place all the stuff in the right places, as the examples below:

This calculate  
*stepSize = physical area size / virtual area size*

*physical position (x or y) = virtual position (x or y) * stepSize*

 
## Powered by
 * [Colyseus multiplayer game framework](https://colyseus.io/) - make the hard calculations on the server and handle events on the client
 * [Arwes react theme](https://arwes.dev/) - this visuals and effects pulled me into react
 * [React itself](https://reactjs.org/) - because the Arwes theme and just to learn :v
 * [Konva canvas library](https://konvajs.org/docs/react/index.html) - to draw the gamearea
