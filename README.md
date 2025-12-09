# deragotchi - virtual console pet

a console-style virtual tamagotchi with a c++ backend and web frontend.

## features
- terminal-style interface
- 4 states: hunger, happinness, energy, cleanliness
- animated images for states

## structure
- /backend: server in c++ and game logic
- /frontend: web interface (html, css, js)
- /assets: pet images

## installation

´´´bash
#backend
cd backend
mkdir build && cd build
cmake ..
make
./deragotchi_server
´´´

#frontend
open http://localhost:8080 in your browser
