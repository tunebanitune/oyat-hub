import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

class Communication {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server);
        this.configureExpress();
        this.configureSocketIO();
    }

    configureExpress() {
        console.log('##configuring express');
        this.app.use(express.static('public'));
        this.app.use('/communicationClient', express.static('public/communicationClient'));
        this.app.get('/socket.io/socket.io.js', (req, res) => {
            res.setHeader('Content-Type', 'application/javascript');
            res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
        });
        console.log('##express configured');
    }

    configureSocketIO() {
        this.io.on('connection', (socket) => {
            console.log('## User connected');

            socket.on('disconnect', () => {
                console.log('## User disconnected');
            });

            socket.on('chat', (message) => {
                this.io.emit('chat', message);
            });
        });
    }

    start(port) {
        this.server.listen(port, () => {
            console.log(`## server is running on port ${port}`);
        })
    }
}

const app = new Communication();
app.start(5500);