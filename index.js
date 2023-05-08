import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { createTables, addUserToDatabase, getUserByNameAndIdentifier } from './database.js';

class Communication {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: '*', //Replace '*' with domain to restrict the allowed origins
                methods: ['GET', 'POST']
            }
        });
        this.configureExpress();
        this.configureSocketIO();
    }

    configureExpress() {
        console.log('##configuring express');
        this.app.use(cors());
        this.app.use(express.static('public'));
        // this.app.use('/communicationClient', express.static('public/communicationClient')); // for publicold
        this.app.get('/socket.io/socket.io.js', (req, res) => {
            res.setHeader('Content-Type', 'application/javascript');
            res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
        });

        this.app.post('/add_user', (req, res) => {
            console.log('##add_user: '+JSON.stringify(req));
            console.log('##add_user body: '+JSON.stringify(req.body))
            const user = req.body;
            // Call the function to add a user to PostgreSQL database
            addUserToDatabase(user)
                .then(() => res.sendStatus(200))
                .catch((err) => {
                    console.error(err);
                    res.sendStatus(500);
                });
        });

        this.app.get('/get_user_by_name_and_identifier', async (req, res) => {
            const name = req.query.name;
            const identifier = req.query.identifier;
            try {
              const user = await getUserByNameAndIdentifier(name, identifier);
              if (user) {
                res.json(user);
              } else {
                res.status(404).send('User not found');
              }
            } catch (err) {
              console.error(err);
              res.status(500).send('Internal server error');
            }
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

    start() {
        const port = process.env.PORT || 5500;
        this.server.listen(port, () => {
            console.log(`## server is running on port ${port}`);
        })
    }
}

const app = new Communication();
createTables().then(() => {
    app.start();
  }).catch((error) => {
    console.error('Error initializing database:', error);
  });