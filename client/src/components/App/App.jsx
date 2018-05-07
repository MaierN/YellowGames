import React, {Component} from 'react';
import Login from '../views/Login/Login.jsx';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.infos = {};

    this.sendData = this.sendData.bind(this);

    this.init();
  }

  init() {
    const self = this;

    self.ws = new WebSocket('ws://' + window.location.host.split(":")[0]);

    self.ws.sendCustom = function(data) {
      self.ws.send(JSON.stringify(data));
    };

    self.ws.onopen = function(e) {

    };

    self.ws.onmessage = function(e) {
      const messageData = JSON.parse(e.data);

      const data = messageData.data;

      switch(messageData.request) {
        case 'initialInfos':
        self.infos = data;
        self.setState({loaded: true});
        break;
        case 'loginSuccess':
        console.log("oui");
        break;
        case 'loginFailed':
        console.log("non");
        break;

        // Outils de debug
        case 'console.log':
        console.log(data);
        break;
        case 'error':
        console.error(data.msg);
        alert("Error (f12 to see details)");
        break;
        default:
        console.log("Message websocket non géré : " + messageData.request);
        break;
      }
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
    if (this.ws) {
      this.ws.sendCustom(data);
    }
  }

  tryUpdate() {
    this.setState(this.tempState);
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
