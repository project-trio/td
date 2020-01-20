# TD

**https://ttd.netlify.com**

_From early development_:
![TD Example Maze](https://i.imgur.com/AI1nS2G.gif)

An unnamed, top-down 3D, multiplayer tower defense (TD) game that plays in your browser.

Based on the extinct 2007 flash game MPDTD.

## Tech

- WebGL rendering with [three.js](https://threejs.org)
- 3D modeling with [MagicaVoxel](https://ephtracy.github.io)
- UI with [Vue.js](https://vuejs.org)
- WebSocket networking with [socket.io](https://socket.io)

## Development

TD uses [Trio](https://github.com/project-trio/trio) as its game server, so ensure you have that running first.

```sh
cd td
# Install dependencies
npm install

# Hot-reload dev environment
npm run serve

# Build for production
npm run build
```
