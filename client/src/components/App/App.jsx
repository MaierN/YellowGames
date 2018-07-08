import React, {Component} from 'react';

import Login from '../views/Login.jsx';
import GamesList from '../views/GamesList/GamesList.jsx';
import GamePlay from '../views/Games/GamePlay.jsx';
import Chat from '../views/Chat/Chat.jsx';

import './App.css';

import wsMgr from '../../js/wsMgr.js';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      loggedIn: null,
      inGame: null,
      endMessage: null,
      id: null,
      giveUp: null,
    };

    this.infos = {};

    this.handleClickContinue = this.handleClickContinue.bind(this);
  }

  componentDidMount() {
    const self = this;

    wsMgr.setOnClose(() => {
      self.setState({loaded: false, loggedIn: null, inGame: null, endMessage: null});
      self.infos = {};
    });

    this.debugSubscription = wsMgr.subscribe("debug", msg => {
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
      switch (msg.request) {
        case 'loginSuccess':
        this.setState({loggedIn: msg.data.username, id: msg.data.id});
        break;

        default:
        break;
      }
    });

    this.gameSubscription = wsMgr.subscribe("game", msg => {
      switch (msg.request) {
        case 'create':
        this.setState({inGame: msg.data});
        break;

        case 'victory':
        this.setState({endMessage: "victory", giveUp: msg.giveUp});
        if (!document.body.overflowYCount) document.body.overflowYCount = 0;
        document.body.overflowYCount++;
        document.body.style.overflowY = "hidden";
        break;

        case 'defeat':
        this.setState({endMessage: "defeat", giveUp: msg.giveUp});
        if (!document.body.overflowYCount) document.body.overflowYCount = 0;
        document.body.overflowYCount++;
        document.body.style.overflowY = "hidden";
        break;

        case 'draw':
        this.setState({endMessage: "draw"});
        if (!document.body.overflowYCount) document.body.overflowYCount = 0;
        document.body.overflowYCount++;
        document.body.style.overflowY = "hidden";
        break;

        case 'end':
        this.setState({endMessage: null, inGame: null});
        document.body.overflowYCount--;
        if (document.body.overflowYCount === 0) document.body.style.overflowY = "auto";
        break;

        default:
        break;
      }
    });
  }

  componentWillUnmount() {
    wsMgr.unsubscribe("debug", this.resetSubscription);
    wsMgr.unsubscribe("initialInfos", this.initialInfosSubscription);
    wsMgr.unsubscribe("login", this.loginSubscription);
    wsMgr.unsubscribe("game", this.gameSubscription);
  }

  handleClickContinue(e) {
    wsMgr.sendData({
      request: "endGame",
    });
  }

  render() {
    const { loaded, loggedIn, inGame, endMessage, id, giveUp } = this.state;

    if (!loaded) return (
      <div className="loader-container">
          <div className="loader"></div>
      </div>
    );

    if (!loggedIn) return (
      <Login></Login>
    );

    return (
      <div className="app-mainContainer">
        <div className="app-chatContainer">
          <Chat></Chat>
        </div>
        <div className="app-mainContentContainer" id="mainContentContainer">
          {!inGame ? (
            <GamesList loggedIn={loggedIn} id={id}></GamesList>
          ) : (
            <div>
              <GamePlay inGame={inGame}></GamePlay>
              {!endMessage ? null : (
                <div className="playerSelect-mainContainer" style={{cursor: "auto"}}>
                  <div className="playerSelect-subContainer">
                    <div className="playerSelect-choose" style={{fontSize: "35px", marginTop: "10px"}}>{endMessage === "victory" ? "Victory!" : (endMessage === "defeat" ? "Defeat..." : "Draw")}{giveUp ? " (give up)" : ""}</div>
                    <div><button className="app-continueButton" onClick={this.handleClickContinue}>Continue</button></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
