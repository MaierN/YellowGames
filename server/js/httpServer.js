
const fs = require('fs');
const http = require('http');


// Création du serveur HTTP, avec une fonction callback appelée en cas de requête
const server = http.createServer((req, res) => {

  // On gère le cas où le client appelle implicitement l'index
  if (req.url.endsWith("/")) {
    req.url += "index.html";
  }

  // On ne prend pas en compte les paramètres GET
  req.url = req.url.split("?")[0];

  // On empêche l'utilisation des ".."
  req.url = req.url.split("..").join("");

  // On tente de lire le fichier demandé
  fs.readFile(httpFolderToServe + req.url, (err, data) => {
    if (err) {
      // En cas d'échec on tente d'envoyer l'index
      fs.readFile(httpFolderToServe + "index.html", (err, data) => {
        if (err) {
          // En cas d'échec on envoie une erreur au client
          res.writeHead(404);
          res.end('404 - File not found');
          return;
        }

        res.writeHead(200, {'Content-Type': pathToType("index.html")});
        res.end(data);
      });
      return;
    }
    // En cas de réussite, on envoie le succès au client ainsi que le contenu du fichier
    res.writeHead(200, {'Content-Type': pathToType(req.url)});
    res.end(data);
  });
});

// Fonction permettant de définir le MIMEtype pour un fichier demandé
function pathToType(path) {
  let r = "text/html";

  const pathTab = path.split(".");

  switch(pathTab[pathTab.length - 1]) {
    case 'html':
    r = "text/html";
    break;
    case 'css':
    r = "text/css";
    break;
    case 'js':
    r = "application/javascript";
    break;
    case 'jpg':
    r = "image/jpeg";
    break;
    case 'png':
    r = "image/png";
    break;
    case 'ico':
    r = "image/ico";
    break;
    case 'svg':
    r = "image/svg+xml";
    break;
  }

  return r;
}

module.exports = {
  server
};

const log = require('./log.js');
const config = require('./config.js');


const httpFolderToServe = config.httpFolderToServe + "/";

// On commence l'écoute sur le port défini dans "config.js"
server.listen(config.httpServerPort, () => {
  log("Serveur HTTP en écoute sur le port " + config.httpServerPort);
});
