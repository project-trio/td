# TD

https://td.suzu.online

![TD Example Maze](https://i.imgur.com/AI1nS2G.gif)

An unnamed, top-down 3D, multiplayer tower defense game that plays in your browser.

Based on the extinct 2007 flash game MPDTD.

## Tech

- WebGL rendering with [three.js](https://threejs.org)
- 3D modeling with [MagicaVoxel](https://ephtracy.github.io)
- UI with [Vue.js](https://vuejs.org)
- WebSockets with [socket.io](https://socket.io)

## Trio

TD piggybacks off the server infrastructure of [Trio](https://github.com/ky-is/trio), which centralizes several of my games' multiplayer backends. Because the RTS engine for these games uses client/server deterministic lockstep, the server load is light.

As a result, you'll need to run Trio, or modify TD for your own infrastructure.

## Development

Install:
```console
cd td
yarn
```

Hot reload (see dependencies above):
```console
yarn serve
```

Production build:
```console
yarn build
```
