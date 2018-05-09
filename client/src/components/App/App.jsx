import React, {Component} from 'react';
import Login from '../views/Login/Login.jsx';
import './App.css';

import wsMgr from '../../js/wsMgr.js';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.infos = {};

    const self = this;

    wsMgr.setOnClose(() => {
      self.setState({loaded: false});
      self.infos = {};
    });

    wsMgr.subscribe("debug", msg => {
      switch(msg.request) {
        case 'log':
        console.log(msg.data);
        break;
        case 'error':
        console.error(msg.data);
        alert("Error (f12 to see details)");
        break;
        default:
        break;
      }
    });

    wsMgr.subscribe("initialInfos", msg => {
      self.infos = msg.data;
      self.setState({loaded: true});
    });

    wsMgr.subscribe("login", msg => {
      switch(msg.request) {
        case 'loginSuccess':
        console.log("oui");
        break;
        case 'loginFailed':
        console.log("non");
        break;
        default:
        break;
      }
    });
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
