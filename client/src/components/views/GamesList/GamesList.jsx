import React, { Component } from 'react';
import './GamesList.css';

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
        <GameInList name="TicTacToe" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit." image="/test.png"></GameInList>
        <GameInList name="Battleship" description="Suspendisse tellus ante, eleifend vitae iaculis et, facilisis a tellus." image="/test.png"></GameInList>
      </div>
    );
  }
}

export default GamesList;
