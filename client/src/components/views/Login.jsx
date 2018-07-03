import React, { Component } from 'react';

import wsMgr from '../../js/wsMgr.js';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      unexpectedError: false,
      lengthError: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
  }

  componentDidMount() {
    this.loginSubscription = wsMgr.subscribe("login", msg => {
      switch(msg.request) {
        case 'loginFailed':
        this.setState({unexpectedError: true});
        break;
        default:
        break;
      }
    });
  }

  componentWillUnmount() {
    wsMgr.unsubscribe("login", this.loginSubscription);
  }

  handleSubmit(e) {
    e.preventDefault();
    const {username} = this.state;

    if (username.length < 4 || username.length > 20) {
      this.setState({lengthError: true});
      return;
    }

    wsMgr.sendData({
      request: "login",
      data: {
        username
      }
    });
  }

  handleChangeUsername(e) {
    e.preventDefault();
    this.setState({username: e.target.value, unexpectedError: false, lengthError: false});
  }

  render() {
    const {username, unexpectedError, lengthError} = this.state;

    return (
      <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
        <div style={{flexGrow: "1"}}></div>
        <div style={styles.title}>
          <div style={styles.welcome}>Welcome to...</div>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", fontFamily: "Bungee, cursive"}}>
            <img src="/img/bigLogoNoText.jpg" alt="" style={styles.bigLogo}></img>
            <div style={{margin: "0px 10px"}}>
              <div style={styles.yellow}>Yellow</div>
              <div style={styles.games}>Games</div>
            </div>
            <img src="/img/bigLogoNoTextFlip.jpg" alt="" style={styles.bigLogo}></img>
          </div>
        </div>
        <div style={{flexGrow: "1"}}></div>
        <div style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
          <div style={styles.insert}>Insert player name... (4-20 chars)</div>
          <form onSubmit={this.handleSubmit} style={{textAlign: "center"}}>
            <div>
              <input style={styles.username} placeholder="Name..." type="text" value={username} onChange={this.handleChangeUsername}></input>
            </div>
            <div style={styles.errors}>
              {!unexpectedError ? null : (
                <div>This username is already in use.</div>
              )}
              {!lengthError ? null : (
                <div>Username must be at least 4 and at most 20 characters long !</div>
              )}
            </div>
            <div>
              <input className="playButton" type="submit" value="Play !"></input>
            </div>
          </form>
        </div>
        <div style={{flexGrow: "4"}}></div>
      </div>
    );
  }
}

const styles = {
  title: {
    fontSize: "55px",
    lineHeight: "55px",
    color: "white",
    textAlign: "center",
    fontFamily: "Montserrat, sans-serif",
  },
  welcome: {
    marginBottom: "20px",
    marginTop: "30px",
  },
  yellow: {
    fontSize: "96px",
    lineHeight: "86px",
  },
  games: {
    fontSize: "115px",
    lineHeight: "100px",
  },
  bigLogo: {
    height: "250px",
  },
  insert: {
    color: "white",
    fontFamily: "Montserrat, sans-serif",
    fontWeight: "bold",
    fontSize: "35px",
    marginBottom: "15px",
  },
  username: {
    fontSize: "30px",
    fontFamily: "Bungee, cursive",
    height: "40px",
    width: "400px",
    textAlign: "center",
    border: "1px solid rgb(254,185,45)",
  },
  errors: {
    display: "flex",
    alignItems: "center",
    height: "50px",
    color: "#b00000",
    fontWeight: "bold",
    fontSize: "20px",
    fontFamily: "Montserrat, sans-serif",
  },
  btn: {
    backgroundColor: "rgb(254,185,45)",
    border: "none",
    color: "white",
    padding: "15px 32px",
    textAlign: "center",
    textDecoration: "none",
    fontSize: "16px",
    lineHeight: "16px",
    cursor: "pointer",
    fontFamily: "Bungee, cursive",
    borderRadius: "8px",
  },
};

export default Login;
