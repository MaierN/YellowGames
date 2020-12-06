module.exports = {
  // Port du serveur http (y compris le websocket)
  httpServerPort: process.env.PORT || 5000,
  // Dossier à servir pour le serveur web
  httpFolderToServe: process.env.CLIENT_BUILD || './client/build',
  // Fichier contenant les logs d'erreur du serveur
  serverLogsFile: "errorLogs.txt",
};
