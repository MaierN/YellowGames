import React, { Component } from 'react';

import wsMgr from '../../../js/wsMgr.js';

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
    wsMgr.unsubscribe(this.loginSubscription);
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
      <div>
        <form onSubmit={this.handleSubmit}>
          <input type="text" value={username} onChange={this.handleChangeUsername}></input>
          <input type="submit" value="Play !"></input>
        </form>
        {!unexpectedError ? null : (
          <div>This username is already in use.</div>
        )}
        {!lengthError ? null : (
          <div>Username must be at least 4 and at most 20 characters long !</div>
        )}
      </div>
    );
  }
}

export default Login;
