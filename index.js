const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); // Add this line to import 'path'

function createChatServer(port = 4000) {
  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server);

  // Serve static files (e.g., CSS)
  app.use(express.static(path.join(__dirname))); // Serve static files from the current directory

  // Serve the HTML for the chat app (as an example)
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Chat App</title>
          <link rel="stylesheet" href="/style.css"> <!-- Link to the CSS file -->
        </head>
        <body>
          <h1>Welcome to the Chat Room</h1>
          <input id="username" placeholder="Enter your name" />
          <button onclick="joinChat()">Join Chat</button>
          <ul id="messages">  </ul>
        
          <input id="message" placeholder="Type a message" />
          <button onclick="sendMessage()">Send</button>

          <script src="/socket.io/socket.io.js"></script>
          <script>
            const socket = io();
            let username = '';

            function joinChat() {
              username = document.getElementById('username').value;
              document.getElementById(username).style.fontWeight = 700;
              socket.emit('join', username);
            }

            function sendMessage() {
              const message = document.getElementById('message').value;
              socket.emit('message', { username, message });
              document.getElementById('message').value = '';
            }

            socket.on('message', (msg) => {
  const li = document.createElement('li');

  // Create a bold element for the username
  const username = document.createElement('strong');
  username.textContent = msg.username + ': ';

  // Create a text node for the message
  const message = document.createTextNode(msg.message);

  // Append both username and message to the <li> element
  li.appendChild(username);
  li.appendChild(message);

  document.getElementById('messages').appendChild(li);
});

          </script>
        </body>
      </html>
    `);
  });

  // Socket.io events
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (username) => {
      socket.username = username;
    });

    socket.on('message', (msg) => {
      io.emit('message', msg); // Broadcast message to all clients
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  // Start the server
  server.listen(port, () => {
    console.log(`Chat server running on http://localhost:${port}`);
  });

  return server; // Return the server instance in case it needs to be used
}

// Check if the file is being run directly
if (require.main === module) {
  // Start the server on port 4000 by default
  createChatServer();
}

// Export the function
module.exports = createChatServer;
