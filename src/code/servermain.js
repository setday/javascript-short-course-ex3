const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io');
const server = io(http);
const PORT = process.env.PORT || 8081;

// console.log('start');

// const SERVER_URL =
// 'https://sleepy-sands-27635.herokuapp.com/';

const cars = new Set();

server.on('connection', function (socket) {
  // console.log(`new user: ${socket.id}`);
  cars.forEach((i) => { server.to(i).emit('addCar', socket.id); });
  cars.forEach((i) => { server.to(socket.id).emit('addCar', i); });
  cars.add(socket.id);
  cars.forEach((i) => { server.to(i).emit('updateAll'); });

  socket.on('update', (speed, x, y, z, angle, wheelRotY) => {
  // console.log(`update all: ${socket.id}`);
    cars.forEach((i) => {
      if (i !== socket.id) {
        server.to(i).emit('update', socket.id, speed, x, y, z, angle, wheelRotY);
      }
    });
  });

  socket.on('speedSet', (speed) => {
    // console.log(`change speed: ${socket.id}, ${speed}`);
    cars.forEach((i) => {
      if (i !== socket.id) {
        server.to(i).emit('speedSet', socket.id, speed);
      }
    });
  });

  socket.on('wheelRotYSet', (wheelRotY) => {
    // console.log(`wheel rot: ${socket.id}`);
    cars.forEach((i) => {
      if (i !== socket.id) {
        server.to(i).emit('wheelRotYSet', socket.id, wheelRotY);
      }
    });
  });

  socket.on('disconnect', () => {
    cars.delete(socket.id);
    cars.forEach((i) => { server.to(i).emit('delCar', socket.id); });
    cars.forEach((i) => { server.to(i).emit('updateAll'); });
  });
});

app.get('/', (req, res) => {
  res.send('<h1>Datauiugguigugfgukgfguigukf-server</h1>');
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

setInterval(() => {
  cars.forEach((i) => { server.to(i).emit('updateAll'); });
}, 50);
