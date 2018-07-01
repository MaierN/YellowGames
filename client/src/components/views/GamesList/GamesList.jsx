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
        <GameInList name="TicTacToe" title="Tic Tac Toe" description="Tic-tac-toe (also known as noughts and crosses or Xs and Os) is a paper-and-pencil game for two players, X and O, who take turns marking the spaces in a 3×3 grid. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row wins the game." image="/img/TicTacToe.png"></GameInList>
        <GameInList name="ConnectFour" title="Connect Four" description="Connect Four (also known as Captain's Mistress, Four Up, Plot Four, Find Four, Four in a Row, Four in a Line and Gravitrips (in Soviet Union)) is a two-player connection game in which the players first choose a color and then take turns dropping one colored disc from the top into a seven-column, six-row vertically suspended grid. The pieces fall straight down, occupying the next available space within the column. The objective of the game is to be the first to form a horizontal, vertical, or diagonal line of four of one's own discs." image="/img/ConnectFour.jpg"></GameInList>
        <GameInList name="Battleship" title="Battleship" description={"Battleship (also Battleships or Sea Battle) is a guessing game for two players. It is played on ruled grids (paper or board) on which the players' fleets of ships (including battleships) are marked. The locations of the fleet are concealed from the other player. Players alternate turns calling \"shots\" at the other player's ships, and the objective of the game is to destroy the opposing player's fleet."} image="/img/Battleship.png"></GameInList>
        {!gameRequest ? null : (
          <div style={styles.requestContainer}>
            <div style={styles.subRequestContainer}>
              <div><span style={{fontWeight: "bold"}}>{gameRequest.username}</span> challenged you to play <span style={{fontWeight: "bold"}}>{gameRequest.title}</span>!</div>
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
    position: "fixed",
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
