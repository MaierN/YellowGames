
const fs = require('fs');

const WebSocketServer = require('websocket').server;


// Objet contenant les clients connectés (les objets connection)
const connectedClients = {};
// Prochain index à utiliser pour identifier le prochain client qui se connectera
let nextClientId = 1;

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

    const data = messageData.data;

    switch(messageData.request) {
      // Demande de login
      case 'login':
      if (connection.loggedIn) return;
      let valid = true;
      if (typeof data.username !== "string") valid = false;
      if (data.username.length < 4 || data.username.length > 20) valid = false;
      for (let clientId in connectedClients) {
        if (connectedClients[clientId].loggedIn === data.username) {
          valid = false;
          break;
        }
      }
      if (valid) {
        connection.sendCustom({
          type: 'login',
          request: 'loginSuccess',
          data: {
            username: data.username
          }
        });
        connection.loggedIn = data.username;
      } else {
        connection.sendCustom({
          type: 'login',
          request: 'loginFailed'
        });
      }
      break;

      // Demande d'envoyer la liste des joueurs
      case 'startSendPlayers':
      connection.sendPlayers = true;
      connection.sendCustom({
        type: 'players',
        request: 'initialPlayers',
        data: {salut: "oui"}
      });
      break;

      // Demande de stopper l'envoi de la liste des joueurs
      case 'stopSendPlayers':
      connection.sendPlayers = false;
      break;
    }
  });

  // Lorsque la connexion est fermée...
  connection.on('close', (reasonCode, description) => {
    // On retire la connexion de la liste
    delete connectedClients[connection.clientId];
  });

  connection.on('error', err => {

  });

  // On assigne un ID à cette connexion, et la stocke dans la liste
  connection.clientId = nextClientId;
  connectedClients[nextClientId] = connection;
  nextClientId++;
  connection.clientIP = request.socket.remoteAddress.split("::ffff:").join("");

  // Et on lui envoie les données initiales
  connection.sendCustom({
    type: 'initialInfos',
    data: {
      //clientId: connection.clientId,
      clientIP: connection.clientIP,
    }
  });
});
