
const fs = require('fs');

const WebSocketServer = require('websocket').server;

const games = {
  TicTacToe: "Tic Tac Toe",
  ConnectFour: "Connect Four",
  Battleship: "Battleship",
};

const playStates = {};


// Objet contenant les clients connectés (les objets connection)
const connectedClients = {};
// Prochain index à utiliser pour identifier le prochain client qui se connectera
let nextClientId = 1000;

// Fonction permettant d'envoyer un message à un client
function sendToOne(clientId, data) {
  const connection = connectedClients[clientId];
  if (connection && connection.connected) connection.sendCustom(data);
}

// Fonction permettant d'envoyer un message à tous les clients connectés
function sendToAll(data) {
  for (let clientId in connectedClients) {
    const connection = connectedClients[clientId];
    if (connection.connected) connection.sendCustom(data);
  }
}

// Fonction permettant d'envoyer un message à tous les clients connectés sauf un
function sendToAllExceptOne(theClientId, data) {
  for (let clientId in connectedClients) {
    const connection = connectedClients[clientId];
    if (connection.connected && clientId != theClientId) connection.sendCustom(data);
  }
}

// Export des fonctions
module.exports = {
  sendToOne,
  sendToAll,
  sendToAllExceptOne
};

const httpServer = require('./httpServer.js');
const log = require('./log.js');
const config = require('./config.js');
const tictactoe = require('./tictactoe.js');
const connectfour = require('./connectfour.js');
const battleship = require('./battleship.js');
const bot = require('./bot.js');


function updatePlayer(id, isAdd) {
  id = id.toString();
  for (let clientId in connectedClients) {
    if (connectedClients[clientId].sendPlayers && clientId !== id) {
      if (isAdd)
        connectedClients[clientId].sendCustom({
          type: 'players',
          request: 'addPlayer',
          data: {id, username: connectedClients[id].loggedIn}
        });
      else
        connectedClients[clientId].sendCustom({
          type: 'players',
          request: 'removePlayer',
          data: {id}
        });
    }
  }
}

function sendChat(request, data) {
  for (let clientId in connectedClients) {
    if (connectedClients[clientId].sendChat) {
      connectedClients[clientId].sendCustom({
        type: 'chat',
        request,
        data,
      });
    }
  }
}

function handleMessage(messageData, connection) {
  const data = messageData.data;

  switch(messageData.request) {
    // Demande de login
    case 'login':
    if (connection.loggedIn) return;
    let valid = true;
	if (!data) valid = false;
    else if (typeof data.username !== "string") valid = false;
    else if (data.username.length < 4 || data.username.length > 20) valid = false;
    else for (let clientId in connectedClients) {
      if (connectedClients[clientId].loggedIn === data.username) {
        valid = false;
        break;
      }
    }
    if (valid) {
      connection.loggedIn = data.username;
      updatePlayer(connection.clientId, true);
      log("Login success for " + connection.clientIP + " (" + data.username + ")");
      connection.sendCustom({
        type: 'login',
        request: 'loginSuccess',
        data: {
          username: data.username,
          id: connection.clientId,
        }
      });
    } else {
      connection.sendCustom({
        type: 'login',
        request: 'loginFailed'
      });
    }
    break;

    // Demande d'envoyer la liste des joueurs
    case 'startSendPlayers':
    if (!connection.loggedIn) return;
    connection.sendPlayers = true;
    const availablePlayers = {};
    for (let clientId in connectedClients) {
      if (connectedClients[clientId].loggedIn && connectedClients[clientId].loggedIn !== connection.loggedIn && connectedClients[clientId].gameState === 0) {
        availablePlayers[clientId] = {id: clientId, username: connectedClients[clientId].loggedIn}
      }
    }
    connection.sendCustom({
      type: 'players',
      request: 'initialPlayers',
      data: availablePlayers,
    });
    break;

    // Demande de stopper l'envoi de la liste des joueurs
    case 'stopSendPlayers':
    connection.sendPlayers = false;
    break;

    // Demande une partie
    case 'askGame':
    if (!connection.loggedIn) return;
    if (connection.gameState !== 0) return;
	if (!data) return;
	if (!data.id) return;
	if (!data.name) return;
    if (!connectedClients[data.id] || connectedClients[data.id].gameState !== 0) return;
    if (!games[data.name]) return;
    if (connection.clientId == data.id) return;
    connectedClients[data.id].gameState = -2;
    connection.gameState = -1;
    connectedClients[data.id].askGameEnnemy = connection.clientId;
    connection.askGameEnnemy = data.id;
    connectedClients[data.id].askGameName = data.name;
    connection.sendCustom({
      type: 'waitMatch',
      request: 'startWaiting',
      data: {
        username: connectedClients[data.id].loggedIn,
        id: data.id,
      },
    });
    connectedClients[data.id].sendCustom({
      type: 'requestMatch',
      request: 'startRequest',
      data: {
        username: connection.loggedIn,
        title: games[data.name],
        id: connection.clientId,
      },
    });
    updatePlayer(connection.clientId, false);
    updatePlayer(data.id, false);
    break;

    // Annule la demande de partie
    case 'cancelAskGame':
    if (!connection.loggedIn) return;
    if (connection.gameState !== -1) return;
    connectedClients[connection.askGameEnnemy].sendCustom({
      type: 'requestMatch',
      request: 'stopRequest',
    });
    connection.sendCustom({
      type: 'waitMatch',
      request: 'stopWaiting',
    });
    connectedClients[connection.askGameEnnemy].gameState = 0;
    connection.gameState = 0;
    updatePlayer(connection.clientId, true);
    updatePlayer(connection.askGameEnnemy, true);
    break;

    // Accepte la demande de partie
    case 'acceptRequest':
    if (!connection.loggedIn) return;
    if (connection.gameState !== -2) return;
    connection.gameState = connection.askGameName;
    connectedClients[connection.askGameEnnemy].gameState = connection.askGameName;

    log("Game of " + connection.askGameName + " started (" + connection.clientIP + " - " + connectedClients[connection.askGameEnnemy].clientIP + ", " + connection.loggedIn + " - " + connectedClients[connection.askGameEnnemy].loggedIn + ")");

    const playState = {name: connection.askGameName};
    const initialInfosP1 = {};
    const initialInfosP2 = {};

    switch (connection.askGameName) {
      case 'TicTacToe':
      playState.grid = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ];
      playState.x = connectedClients[connection.askGameEnnemy];
      playState.o = connection;
      playState.next = "x";
      initialInfosP1.yourTurn = true;
      initialInfosP2.yourTurn = false;
      break;

      case 'ConnectFour':
      playState.grid = [
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
      ];
      playState.x = connectedClients[connection.askGameEnnemy];
      playState.o = connection;
      playState.next = "x";
      initialInfosP1.yourTurn = true;
      initialInfosP2.yourTurn = false;
      break;

      case 'Battleship':
      playState.gridP1 = [
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
      ];
      playState.gridP2 = [
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
      ];
      playState.hitsP1 = [
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
      ];
      playState.hitsP2 = [
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", ""],
      ];
      playState.boatsP1 = {
        1: {placed: false, size: 5, hits: 0},
        2: {placed: false, size: 4, hits: 0},
        3: {placed: false, size: 3, hits: 0},
        4: {placed: false, size: 3, hits: 0},
        5: {placed: false, size: 2, hits: 0},
      };
      playState.boatsP2 = {
        1: {placed: false, size: 5, hits: 0},
        2: {placed: false, size: 4, hits: 0},
        3: {placed: false, size: 3, hits: 0},
        4: {placed: false, size: 3, hits: 0},
        5: {placed: false, size: 2, hits: 0},
      };
      playState.remainingP1 = 5;
      playState.remainingP2 = 5;
      playState.p1 = connectedClients[connection.askGameEnnemy];
      playState.p2 = connection;
      playState.phase = 0;
      playState.next = "p1";
      initialInfosP1.yourTurn = true;
      initialInfosP2.yourTurn = false;
      break;
    }

    playStates[connection.clientId] = playState;
    playStates[connection.askGameEnnemy] = playState;

    connectedClients[connection.askGameEnnemy].sendCustom({
      type: 'game',
      request: 'create',
      data: {
        username: connection.loggedIn,
        name: connection.askGameName,
        initialInfos: initialInfosP1,
        id: connection.clientId,
      }
    });
    connection.sendCustom({
      type: 'game',
      request: 'create',
      data: {
        username: connectedClients[connection.askGameEnnemy].loggedIn,
        name: connection.askGameName,
        initialInfos: initialInfosP2,
        id: connectedClients[connection.askGameEnnemy].clientId,
      }
    });
    break;

    // Décline la demande de partie
    case 'declineRequest':
    if (!connection.loggedIn) return;
    if (connection.gameState !== -2) return;
    connectedClients[connection.askGameEnnemy].sendCustom({
      type: 'waitMatch',
      request: 'stopWaiting',
    });
    connection.sendCustom({
      type: 'requestMatch',
      request: 'stopRequest',
    });
    connection.gameState = 0;
    connectedClients[connection.askGameEnnemy].gameState = 0;
    updatePlayer(connection.clientId, true);
    updatePlayer(connection.askGameEnnemy, true);
    break;

    // Abandonne la partie
    case 'giveUp':
    if (!connection.loggedIn) return;
    if (!games[connection.gameState]) return;
    connection.gameState += "_1";
    connectedClients[connection.askGameEnnemy].gameState += "_1";
    connectedClients[connection.askGameEnnemy].sendCustom({
      type: 'game',
      request: 'victory',
      giveUp: true,
    });
    connection.sendCustom({
      type: 'game',
      request: 'defeat',
      giveUp: true,
    });
    break;

    case 'endGame':
    if (!connection.loggedIn) return;
    if (typeof connection.gameState !== "string" || !connection.gameState.endsWith("_1")) return;
    connection.gameState = 0;
    connection.sendCustom({
      type: 'game',
      request: 'end',
    });
    updatePlayer(connection.clientId, true);
    break;

    case 'play':
    if (!connection.loggedIn) return;
    if (!games[connection.gameState]) return;
	if (!data) return;
    switch (connection.gameState) {
      case 'TicTacToe':
      tictactoe.play(playStates[connection.clientId], data, connection);
      break;

      case 'ConnectFour':
      connectfour.play(playStates[connection.clientId], data, connection);
      break;

      case 'Battleship':
      battleship.play(playStates[connection.clientId], data, connection);
      break;
    }
    break;

    case 'startSendChat':
    if (!connection.loggedIn) return;
    const availablePlayers2 = {};
    for (let clientId in connectedClients) {
      if (connectedClients[clientId].sendChat) {
        availablePlayers2[clientId] = {id: clientId, username: connectedClients[clientId].loggedIn}
      }
    }
    connection.sendChat = true;
    connection.sendCustom({
      type: 'chat',
      request: 'initialPlayers',
      data: availablePlayers2,
    });
    sendChat("arrived", { id: connection.clientId, username: connection.loggedIn });
    break;

    case 'stopSendChat':
    connection.sendChat = false;
    sendChat("left", { id: connection.clientId, username: connection.loggedIn });
    break;

    case 'chat':
    if (!connection.loggedIn) return;
	if (!data) return;
    if (typeof data.text !== "string") return;
    if (data.text.length === 0) return;
    sendChat("message", { text: data.text.substring(0, 200), username: connection.loggedIn, id: connection.clientId });
    break;
  }
}

// Création du serveur websocket
const websocketServer = new WebSocketServer({
  httpServer: httpServer.server,
  autoAcceptConnections: false,
  maxReceivedFrameSize: 80000000,
  maxReceivedMessageSize: 80000000
});

// Pour chaque requête de connexion client...
websocketServer.on('request', request => {

  // On accepte la connexion
  const connection = request.accept(null, request.origin);

  // Ajoute la fonction sendCustom à la connexion, qui est un raccourci permettant de stringifier et d'envoyer un objet
  connection.sendCustom = data => {
    try {
      connection.sendUTF(JSON.stringify(data));
    } catch(e) {}
  };

  // Pour chaque message envoyé du client...
  connection.on('message', message => {
    // On tente de récupérer le contenu du message
    let messageData;
    try {
      messageData = JSON.parse(message.utf8Data);
    } catch (e) {
      // En cas d'échec, on ferme la connexion
      connection.close();
      return;
    }
    handleMessage(messageData, connection);
  });

  // Lorsque la connexion est fermée...
  connection.on('close', (reasonCode, description) => {
    log("Connection closed from " + connection.clientIP + "(" + connection.loggedIn + ")");

    if (connection.gameState === -1) {
      connectedClients[connection.askGameEnnemy].gameState = 0;
      connectedClients[connection.askGameEnnemy].sendCustom({
        type: 'requestMatch',
        request: 'stopRequest',
      });
      updatePlayer(connection.askGameEnnemy, true);
    }
    if (connection.gameState === -2) {
      connectedClients[connection.askGameEnnemy].gameState = 0;
      connectedClients[connection.askGameEnnemy].sendCustom({
        type: 'waitMatch',
        request: 'stopWaiting',
      });
      updatePlayer(connection.askGameEnnemy, true);
    }
    if (typeof connection.gameState === "string" && !connection.gameState.endsWith("_1")) {
      connectedClients[connection.askGameEnnemy].gameState += "_1";
      connectedClients[connection.askGameEnnemy].sendCustom({
        type: 'game',
        request: 'victory',
      });
    }
    if (connection.loggedIn) updatePlayer(connection.clientId, false);
    if (connection.sendChat) sendChat("left", { id: connection.clientId, username: connection.loggedIn });
    // On retire la connexion de la liste
    delete connectedClients[connection.clientId];
    delete playStates[connection.clientId];
  });

  connection.on('error', err => {

  });

  // On assigne un ID à cette connexion, et la stocke dans la liste
  connection.clientId = nextClientId;
  connectedClients[nextClientId] = connection;
  nextClientId++;
  connection.clientIP = request.socket.remoteAddress.split("::ffff:").join("");
  connection.gameState = 0;

  log("Connection from " + connection.clientIP);

  // Et on lui envoie les données initiales
  connection.sendCustom({
    type: 'initialInfos',
    data: {
      //clientId: connection.clientId,
      clientIP: connection.clientIP,
    }
  });
});

bot.getNewBot("bot_1", handleMessage).start(connectedClients);
bot.getNewBot("bot_2", handleMessage).start(connectedClients);
bot.getNewBot("bot_3", handleMessage).start(connectedClients);
