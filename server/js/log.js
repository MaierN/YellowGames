
const fs = require('fs');


// Fonction de log utilisée partout
function log(message, details, isError) {
  const msg = new Date().toISOString() + (isError ? " (error)" : "") + " : " + message;

  console.log(msg);
  if (details) console.log(details);

  if (isError) {
    addLogToFile(msg);
    if (details) addLogToFile("Details : " + JSON.stringify(details));
  }
};

function addLogToFile(string) {
  fs.appendFileSync(config.serverLogsFile, string + "\n");
}

module.exports = log;

const config = require('./config.js');
