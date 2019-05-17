// Setup basic express server
let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let port = process.env.PORT || 3000;
let Discord = require('discord.js');
const client = new Discord.Client();

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static('public'));

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  server.listen(port);
});

client.login('DISCORD_API_TOKEN');

io.on('connection', function (socket) {
  socket.emit('login')

  client.on('message', message => {
    console.log()
    let newMessage = message.content
    if (message.attachments.array().length) {
      newMessage += '<div class="attachments">';
      for (const attachment of message.attachments) {
        console.log(attachment[1].url);
        newMessage += '<a href="' + attachment[1].url + '" target="_blank"><img class="attachment" src="' + attachment[1].url + '"/></a>';
      }
      newMessage += '<span class="attachment-note">Click image to view full-size.</span></div>';
    }
    socket.emit('new message', {
      channel: message.channel.name,
      username: message.author.username,
      userImage: message.author.avatarURL,
      message: newMessage,
      created: message.createdAt
    });
  });

  socket.on('getChannels', function (data) {
    for (const name of data) {
      client.channels.find("name", name).fetchMessages({limit: 15, }).then(messages => {
        let messageArray = messages.array().reverse()
        for (const message of messageArray) {
          let newMessage = message.content
          if (message.attachments.array().length) {
            newMessage += '<div class="attachments">';
            for (const attachment of message.attachments) {
              newMessage += '<a href="' + attachment[1].url + '" target="_blank"><img class="attachment" src="' + attachment[1].url + '"/></a>';
            }
            newMessage += '<span class="attachment-note">Click image(s) to view full-size.</span></div>';
          }


          socket.emit('new message', {
            channel: message.channel.name,
            username: message.author.username,
            userImage: message.author.avatarURL,
            message: newMessage,
            created: message.createdAt
          });
        }
      });
    };
  });

  socket.on('disconnect', function () {
    socket.removeAllListeners('new message');
    socket.removeAllListeners('disconnect');
  });
});