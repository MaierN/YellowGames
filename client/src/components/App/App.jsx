import React, {Component} from 'react';
import Login from '../views/Login/Login.jsx';
import GamesList from '../views/GamesList/GamesList.jsx';
import './App.css';

import wsMgr from '../../js/wsMgr.js';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      loggedIn: null,
    };

    this.infos = {};

    const self = this;

    wsMgr.setOnClose(() => {
      self.setState({loaded: false, loggedIn: null});
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

    this.initialInfosSubscription = wsMgr.subscribe("initialInfos", msg => {
      self.infos = msg.data;
      self.setState({loaded: true});
    });

    this.loginSubscription = wsMgr.subscribe("login", msg => {
      switch(msg.request) {
        case 'loginSuccess':
        this.setState({loggedIn: msg.data.username});
        break;
        default:
        break;
      }
    });
  }

  componentWillUnmount() {
    wsMgr.unsubscribe(this.initialInfosSubscription);
    wsMgr.unsubscribe(this.loginSubscription);
  }

  render() {
    const {loaded, loggedIn} = this.state;

    if (!loaded) return (
      <div className="loader-container">
        <div>
          <div className="loader"></div>
        </div>
        <div>Loading...</div>
      </div>
    );

    if (!loggedIn) return (
      <Login></Login>
    );

    return (
      <GamesList loggedIn={loggedIn}></GamesList>
    );
  }
}

export default App;
