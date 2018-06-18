import React, { Component } from 'react';

import wsMgr from '../../../js/wsMgr.js';

import GameInList from './GameInList.jsx';

class GamesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gameRequest: null
    };

    this.handleClickAccept = this.handleClickAccept.bind(this);
    this.handleClickDecline = this.handleClickDecline.bind(this);
  }

  componentDidMount() {
    this.requestMatchSubscription = wsMgr.subscribe("requestMatch", msg => {
      switch(msg.request) {
        case "startRequest":
        this.setState({gameRequest: msg.data});
        break;

        case "stopRequest":
        this.setState({gameRequest: null});
        break;

        default:
        break;
      }
    });
  }

  componentWillUnmount() {
    wsMgr.unsubscribe("requestMatch", this.requestMatchSubscription);
  }

  handleClickAccept(e) {
    wsMgr.sendData({
      request: "acceptRequest",
    });
  }

  handleClickDecline(e) {
    wsMgr.sendData({
      request: "declineRequest",
    });
  }

  render() {
    const { loggedIn } = this.props;
    const { gameRequest } = this.state;

    return (
      <div>
        <div>Welcome {loggedIn} !</div>
        <GameInList name="TicTacToe" title="Tic Tac Toe" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit." image="/img/TicTacToe.png"></GameInList>
        <GameInList name="Battleship" title="Battleship" description="Suspendisse tellus ante, eleifend vitae iaculis et, facilisis a tellus." image="/img/Battleship.png"></GameInList>
        {!gameRequest ? null : (
          <div style={styles.requestContainer}>
            <div style={styles.subRequestContainer}>
              <div>{gameRequest.username + " "}challenged you to play{" " + gameRequest.title + " "}!</div>
              <div><button onClick={this.handleClickAccept}>Accept</button><button onClick={this.handleClickDecline}>Decline</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  requestContainer: {
    position: "absolute",
    top: "0px",
    left: "0px",
    bottom: "0px",
    right: "0px",
    backgroundColor: "rgba(0,0,0,.5)",
  },
  subRequestContainer: {
    margin: "50px",
    backgroundColor: "white",
    border: "1px solid black",
  },
};

export default GamesList;
