
let onClose = () => {};
let subscribeId = 0;
const subscriptions = {};
let ws;

function init() {
  ws = new WebSocket('ws://' + window.location.host);

  ws.sendCustom = function(data) {
    ws.send(JSON.stringify(data));
  };

  ws.onopen = function(e) {
  };

  ws.onmessage = function(e) {
    const messageData = JSON.parse(e.data);

    let received = false;
    if (subscriptions[messageData.type]) {
      for (let subscriptionId in subscriptions[messageData.type]) {
        subscriptions[messageData.type][subscriptionId](messageData);
        received = true;
      }
    }

    if (!received) {
      console.log("Msg not used:");
      console.log(messageData);
    }
  };

  ws.onerror = function(e) {
  };

  ws.onclose = function(e) {
    onClose();
    init();
  };
}

function sendData(data) {
  if (ws && ws.readyState === 1) {
    ws.sendCustom(data);
  }
}

function setOnClose(cb) {
  onClose = cb;
}

function subscribe(type, callback) {
  if (!subscriptions[type]) subscriptions[type] = {};
  subscriptions[type][subscribeId] = callback;
  return subscribeId++;
}

function unsubscribe(type, id) {
  if (subscriptions[type] && subscriptions[type][id]) delete subscriptions[type][id];
  else console.log("Error unsubscribe unknown subscription");
}

init();

module.exports = {
  sendData,
  setOnClose,
  subscribe,
  unsubscribe,
};
