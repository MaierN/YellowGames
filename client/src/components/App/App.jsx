import React, {Component} from 'react';
import Login from '../views/Login/Login.jsx';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.infos = {};

    this.subscribeId = 0;
    this.subscriptions = {};

    this.sendData = this.sendData.bind(this);

    this.init();
  }

  init() {
    const self = this;

    self.subscribe("debug", msg => {
      switch(msg.request) {
        case 'log':
        console.log(data);
        break;
        case 'error':
        console.error(data.msg);
        alert("Error (f12 to see details)");
        break;
      }
    });

    self.subscribe("initialInfos", msg => {
      self.infos = msg.data;
      self.setState({loaded: true});
    });

    self.subscribe("login", msg => {
      switch(msg.request) {
        case 'loginSuccess':
        console.log("oui");
        break;
        case 'loginFailed':
        console.log("non");
        break;
      }
    });

    self.ws = new WebSocket('ws://' + window.location.host.split(":")[0]);

    self.ws.sendCustom = function(data) {
      self.ws.send(JSON.stringify(data));
    };

    self.ws.onopen = function(e) {
    };

    self.ws.onmessage = function(e) {
      const messageData = JSON.parse(e.data);

      if (subscriptions[messageData.type])
        for (let cb in subscriptions[messageData.type]) cb(messageData);
    };

    self.ws.onerror = function(e) {
    };

    self.ws.onclose = function(e) {
      self.setState({loaded: false});
      self.infos = {};
      self.init();
    };
  }

  sendData(data) {
    if (this.ws && this.state.loaded) {
      this.ws.sendCustom(data);
    }
  }

  subscribe(type, callback) {
    if (!subscriptions[type]) subscriptions[type] = {};
    subscriptions[type][this.subscribeId] = callback;
    return this.subscribeId++;
  }

  unsubscribe(type, id) {
    if (subscriptions[type] && subscriptions[type][id]) delete subscriptions[type][id];
  }

  render() {
    const {loaded, logged} = this.state;

    if (!loaded) return (
      <div className="loader-container">
        <div>
          <div className="loader"></div>
        </div>
        <div>Loading...</div>
      </div>
    );

    if (!logged) return (
      <Login sendData={this.sendData}></Login>
    );

    return (
      <div>Salut !</div>
    );
  }
}

export default App;
