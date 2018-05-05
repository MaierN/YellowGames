
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
      connection.sendUTF(JSON.stringify([data]));
    } catch(e) {}
  };

  // Pour chaque message envoyé du client...
  connection.on('message', message => {

    // On tente de récupérer le contenu du message
    let messagesList;
    try {
      messagesList = JSON.parse(message.utf8Data);
    } catch (e) {
      // En cas d'échec, on ferme la connexion
      connection.close();
      return;
    }

    for (let i = 0; i < messagesList.length; i++) {
      const messageData = messagesList[i];
      const data = messageData.data;

      switch(messageData.request) {
        // Démarrage du programme sur un robot
        case 'systemStartProgram':
        sshClient.startEurobot(data.peerId);
        break;
        // Interruption du programme sur un robot
        case 'systemInterruptProgram':
        sshClient.interruptEurobot(data.peerId);
        break;
        // Kill du programme sur un robot
        case 'systemKillProgram':
        sshClient.killEurobot(data.peerId);
        break;
        // Arrêt du système d'un robot
        case 'systemShutdown':
        sshClient.shutdownRobot(data.peerId);
        break;
        // Redémarrage du système d'un robot
        case 'systemReboot':
        sshClient.rebootRobot(data.peerId);
        break;
      }
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

  // Et on lui envoie l'état actuel
  connection.sendCustom({
    request: 'initialState',
    data: {
      clientId: connection.clientId,
      clientIP: connection.clientIP,
    }
  });
});
