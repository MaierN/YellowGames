import React, { Component } from 'react';

import GameInList from './GameInList.jsx';

class GamesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    const {loggedIn} = this.props;

    return (
      <div>
        Welcome {loggedIn} !
        <GameInList name="TicTacToe" title="Tic Tac Toe" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit." image="/img/TicTacToe.png"></GameInList>
        <GameInList name="Battleship" title="Battleship" description="Suspendisse tellus ante, eleifend vitae iaculis et, facilisis a tellus." image="/img/Battleship.png"></GameInList>
      </div>
    );
  }
}

export default GamesList;
