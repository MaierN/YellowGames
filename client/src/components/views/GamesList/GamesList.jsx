import React, { Component } from 'react';

import wsMgr from '../../../js/wsMgr.js';
import colors from '../../../js/colors.js';

import GameInList from './GameInList.jsx';

import './gamesList.css';

class GamesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gameRequest: null,
    };

    this.handleClickAccept = this.handleClickAccept.bind(this);
    this.handleClickDecline = this.handleClickDecline.bind(this);
  }

  componentDidMount() {
    this.requestMatchSubscription = wsMgr.subscribe("requestMatch", msg => {
      switch(msg.request) {
        case "startRequest":
        this.setState({gameRequest: msg.data});
        if (!document.body.overflowYCount) document.body.overflowYCount = 0;
        document.body.overflowYCount++;
        document.body.style.overflowY = "hidden";
        break;

        case "stopRequest":
        this.setState({gameRequest: null});
        document.body.overflowYCount--;
        if (document.body.overflowYCount === 0) document.body.style.overflowY = "auto";
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
        <div style={{textAlign: "center", padding: "15px"}}><img src="/img/completeLogo.png" alt="" style={{width: "100%", maxWidth: "550px"}}></img></div>
        <div className="gamesList-welcome">Welcome {loggedIn} !</div>
        <div className="gamesList-first">First, choose a game:</div>
        <GameInList name="TicTacToe" title="Tic Tac Toe" description="Tic-tac-toe (also known as noughts and crosses or Xs and Os) is a paper-and-pencil game for two players, X and O, who take turns marking the spaces in a 3×3 grid. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row wins the game." image="/img/TicTacToe.png"></GameInList>
        <GameInList name="ConnectFour" title="Connect Four" description="Connect Four (also known as Captain's Mistress, Four Up, Plot Four, Find Four, Four in a Row, Four in a Line and Gravitrips (in Soviet Union)) is a two-player connection game in which the players first choose a color and then take turns dropping one colored disc from the top into a seven-column, six-row vertically suspended grid. The pieces fall straight down, occupying the next available space within the column. The objective of the game is to be the first to form a horizontal, vertical, or diagonal line of four of one's own discs." image="/img/ConnectFour.jpg"></GameInList>
        <GameInList name="Battleship" title="Battleship" description={"Battleship (also Battleships or Sea Battle) is a guessing game for two players. It is played on ruled grids (paper or board) on which the players' fleets of ships (including battleships) are marked. The locations of the fleet are concealed from the other player. Players alternate turns calling \"shots\" at the other player's ships, and the objective of the game is to destroy the opposing player's fleet."} image="/img/Battleship.png"></GameInList>
        {!gameRequest ? null : (
          <div className="playerSelect-mainContainer" style={{cursor: "auto"}}>
            <div className="playerSelect-subContainer">
              <div className="playerSelect-choose">
                <span className="playerSelect-chooseTitle" style={{color: colors.getColor(gameRequest.id)}}>{gameRequest.username}</span> challenged you to play <span className="playerSelect-chooseTitle">{gameRequest.title}</span>!
              </div>
              <div>
                <button className="gamesList-acceptButton" onClick={this.handleClickAccept}>Accept</button>
                <button className="playerSelect-cancelButton" onClick={this.handleClickDecline}>Decline</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default GamesList;
