import React, { Component } from 'react';

import TicTacToe from './TicTacToe.jsx';
import ConnectFour from './ConnectFour.jsx';
import Battleship from './Battleship.jsx';

import wsMgr from '../../../js/wsMgr.js';
import colors from '../../../js/colors.js';

import './gamePlay.css';

class GamePlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.handleClickGiveUp = this.handleClickGiveUp.bind(this);
  }

  handleClickGiveUp(e) {
    wsMgr.sendData({
      request: "giveUp",
    });
  }

  render() {
    const { inGame } = this.props;

    let title = "";
    let gameComponent = null;
    switch (inGame.name) {
      case "TicTacToe":
      title = "Tic Tac Toe";
      gameComponent = <TicTacToe initialInfos={inGame.initialInfos}></TicTacToe>;
      break;

      case "ConnectFour":
      title = "Connect Four";
      gameComponent = <ConnectFour initialInfos={inGame.initialInfos}></ConnectFour>;
      break;

      case "Battleship":
      title = "Battleship";
      gameComponent = <Battleship initialInfos={inGame.initialInfos}></Battleship>
      break;

      default: break;
    }

    return (
      <div>
        <div className="gamePlay-title">Playing <span className="gamePlay-titleBig">{title}</span> against <span style={{color: colors.getColor(inGame.id)}} className="gamePlay-titleBig">{inGame.username}</span>!</div>
        <div><button className="gamePlay-giveUpButton" onClick={this.handleClickGiveUp}>Give up...</button></div>
        {gameComponent}
      </div>
    );
  }
}

export default GamePlay;
