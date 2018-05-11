import React, { Component } from 'react';
import './GamesList.css';

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
        Yo {loggedIn} !
      </div>
    );
  }
}

export default GamesList;
