import React, { Component } from 'react';

import wsMgr from '../../js/wsMgr.js';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: localStorage.getItem("lastUsername") || "",
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

    localStorage.setItem("lastUsername", username);

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
      <div style={{display: "flex", flexDirection: "column", height: "100%", alignItems: "center"}}>
        <div style={{flexGrow: "1"}}></div>
        <div style={styles.title}>
          <svg viewBox="0 0 100 10">
            <text x="20" y="8" style={styles.welcome}>Welcome to...</text>
          </svg>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", fontFamily: "Bungee, cursive"}}>
            <img src="/img/completeLogo.png" alt="" style={styles.bigLogo}></img>
          </div>
        </div>
        <div style={{flexGrow: "1"}}></div>
        <div style={{width: "400px", maxWidth: "90%"}}>
          <svg viewBox="0 0 100 23" style={{border: "1px solid transparent"}}>
            <text x="6" y="10" style={styles.insertSVG}>Insert player name...</text>
            <text x="13" y="20" style={styles.insertSVG}>(4-20 characters)</text>
          </svg>
          <form onSubmit={this.handleSubmit} style={{textAlign: "center", width: "100%"}}>
            <div>
              <input style={styles.username} placeholder="Name..." autoFocus={true} type="text" value={username} onChange={this.handleChangeUsername}></input>
            </div>
            {!lengthError ? null : (
              <svg viewBox="0 0 100 13" style={{border: "1px solid transparent"}}>
                <text x="8" y="5.5" style={styles.errorsSVG}>Username must be at least 4 and</text>
                <text x="15" y="11" style={styles.errorsSVG}>at most 20 characters long!</text>
              </svg>
            )}
            {!unexpectedError ? null : (
              <svg viewBox="0 0 100 13" style={{border: "1px solid transparent"}}>
                <text x="10" y="8" style={styles.errorsSVG}>This username is already in use!</text>
              </svg>
            )}
            {unexpectedError || lengthError ? null : (
              <svg viewBox="0 0 100 13" style={{border: "1px solid transparent"}}></svg>
            )}
            <div>
              <input className="playButton" type="submit" value="Play!"></input>
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
    textAlign: "center",
    width: "765px",
    maxWidth: "95%",
  },
  welcome: {
    fontFamily: "Montserrat, sans-serif",
    fontSize: "55%",
    fill: "white",
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
    width: "100%",
  },
  insertSVG: {
    fill: "white",
    fontWeight: "bold",
    fontFamily: "Montserrat, sans-serif",
    fontSize: "8.8px",
  },
  username: {
    fontSize: "30px",
    fontFamily: "Bungee, cursive",
    height: "40px",
    maxWidth: "100%",
    textAlign: "center",
    border: "1px solid rgb(254,185,45)",
    color: "#444444",
    marginTop: "10px",
  },
  errorsSVG: {
    fill: "#b00000",
    fontWeight: "bold",
    fontFamily: "Montserrat, sans-serif",
    fontSize: "5px",
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
