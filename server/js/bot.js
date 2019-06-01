
let botId = 1;

function isFull(grid) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (!grid[i][j]) return false;
    }
  }
  return true;
}

function playTicTacToe(bot) {
  let row;
  let col;
  do {
    row = Math.floor(Math.random() * 3);
    col = Math.floor(Math.random() * 3);
  } while(bot.botState.grid[row][col]);
  bot.sendData({
    request: "play",
    data: {
      row,
      col,
    },
  });
}

function playConnectFour(bot) {
  let col;
  do {
    col = Math.floor(Math.random() * 7);
  } while(bot.botState.grid[0][col]);
  bot.sendData({
    request: "play",
    data: {
      col,
    },
  });
}

const onMessage = {

  login: function(bot, msg) {
    switch(msg.request) {
      case "loginSuccess":
      break;

      case "loginFailed":
      console.log(bot.botName + " got loginFailed");
      break;
    }
  },

  requestMatch: function(bot, msg) {
    switch(msg.request) {
      case "startRequest":
      bot.sendData({ request: "acceptRequest" });
      break;

      case "stopRequest":
      break;
    }
  },

  game: function(bot, msg) {
    const data = msg.data;
    switch(msg.request) {
      case "create":
      if (data.name === "TicTacToe") {
        bot.botState = {
          symbol: data.initialInfos.yourTurn ? "x" : "o",
          grid: [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""],
          ],
        };
        if (data.initialInfos.yourTurn) playTicTacToe(bot);
      } else if (data.name === "ConnectFour") {
        bot.botState = {
          symbol: data.initialInfos.yourTurn ? "x" : "o",
          grid: [
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
          ],
        };
        if (data.initialInfos.yourTurn) playConnectFour(bot);
      } else if (data.name === "Battleship") {
        // TODO strat battleship
        bot.sendData({ request: "giveUp" });
      } else if (data.name === "Tetrablockz") {
        // TODO strat Tetrablockz
        bot.sendData({ request: "giveUp" });
      } else {
        console.log(bot.botName + " unknown game " + data.name);
        bot.sendData({ request: "giveUp" });
      }
      break;

      case "victory":
      bot.sendData({ request: "endGame" });
      break;

      case "defeat":
      bot.sendData({ request: "endGame" });
      break;

      case "draw":
      bot.sendData({ request: "endGame" });
      break;

      case "end":
      break;
    }
  },

  gameTicTacToe: function(bot, msg) {
    const data = msg.data;
    bot.botState.grid[data.row][data.col] = data.symbol;
    if (data.yourTurn && !isFull(bot.botState.grid)) playTicTacToe(bot);
  },

  gameConnectFour: function(bot, msg) {
    const data = msg.data;
    bot.botState.grid[data.row][data.col] = data.symbol;
    if (data.yourTurn && !isFull(bot.botState.grid)) playConnectFour(bot);
  }

};

function getNewBot(botName, sendData) {
  const newBot = {

    start: function(connectedClients) {
      connectedClients[this.clientId] = this;

      this.sendData({
        request: "login",
        data: { username: botName }
      });
    },

    close: function() {
      console.log(botName + " was called close()")
    },

    sendCustom: function(msg) {
      if (onMessage[msg.type]) onMessage[msg.type](this, msg);
      else console.log("(unsupported message for " + botName + ")");
    },

    connected: true,
    clientId: botId++,
    gameState: 0,
    botName,

  };
  newBot.sendData = msg => sendData(msg, newBot);
  return newBot;
}

module.exports = {
  getNewBot,
};
