import React, { Component } from 'react';
import './Login.css';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const {username} = this.state;
    const {sendData} = this.props;

    sendData({
      request: "login",
      data: {
        username
      }
    }, res => {
      console.log(res);
    });
  }

  handleChangeUsername(e) {
    e.preventDefault();
    this.setState({username: e.target.value});
  }

  render() {
    const {username} = this.state;

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input type="text" value={username} onChange={this.handleChangeUsername}></input>
          <input type="submit" value="Play !"></input>
        </form>
      </div>
    );
  }
}

export default Login;
