![RetroBikes demo](https://avatars3.githubusercontent.com/u/54962401?s=150)
# RetroBikes demo
Homage to Light Cycle game inside Tron movies (you should check the original 1982 movie too :v).

## 	🧭 Overview
By now this game supports multiplayer with n players. When the predetermined number of players enter in the game room the game will start immediately (you can define this on gameconfig file, see the 'Gameconfig quick reference' section for more).

As the players loses the game his occuped area will be freed, but the player still can watch the rest of game.

Because this still is a demo, all the visuals are very simple, as the fact the only forms to identify yourself is try to change direction (and risk lose the game), but this is a good start to build all this things.

## 🏃 Kickstart the code
 * Do the clone: `https://github.com/RetroBikes/demo.git`
 * Go to server directory and start him
   * `cd demo/server`
   * `npm install`
   * `npm start`
 * Go to the client-react directory and start him
   * `cd demo/client-react`
   * `yarn install`
   * `yarn start`

## 📄 Gameconfig quick reference
This file will set the initial state for your game:
   * The clients number to start the game;
   * the virtual area size (a.k.a the area size based on the number of steps);
   * the initial players states, as the start position and direction.

On start positions, negative values means counting from right (on x axis) or bottom (on y axis). Just like an Python array.

This would be a great place to set the players default colors, by example.

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

## 💻📲 The client / server communication
All the heavy logics happen in the server side. The game loop, player steps, collision calculation and goes on. The client side is the simpliest thing possible, just receives the last players virtual location (confused? check the below section) to render on the screen and send the movement events to server. Just like this.  
Thanks to [Colyseus](https://colyseus.io/) people for this amazing framework :D.

The React client uses the Konva lib, wich makes more easy to do all the client rendering. The only things that deserves more attention is the calculations behind the sizes and positions on the physical game area. See the section belor for more.

## 🧮 Going into the mathinery (hahaha I'm sorry)
This game works with virtual and physical sizes and locations. This means the server deal only with integer numbers starting with zero and ending with the game area size minus 1 (basic array setting). The client side will have to do all the calculations to place all the stuff in the right places, as the examples below:

This calculate the player part size (rendered on game each step made)  
*__player part size = physical area size / virtual area size__*

This calcullate the physical position (x and y) to render each player part  
*__physical position (x or y) = virtual position (x or y) * player part size__*

Do not worry, there is an practical example on client-react directory. [Just click here to reach it](https://github.com/RetroBikes/demo/blob/master/client-react/src/pages/game/Game.js).

## 🔌 Powered by
 * [Colyseus multiplayer game framework](https://colyseus.io/) - make the hard calculations on the server and handle events on the client
 * [Arwes react theme](https://arwes.dev/) - this visuals and effects pulled me into react
 * [React itself](https://reactjs.org/) - because the Arwes theme and just to learn :v
 * [Konva canvas library](https://konvajs.org/docs/react/index.html) - to draw the gamearea

----------------

##### 💜 Made with love by an [cyberpunk coding enthusiast](https://github.com/VictorHugoBatista)

----------------

###### 	💻 Flynn lives

----------------
