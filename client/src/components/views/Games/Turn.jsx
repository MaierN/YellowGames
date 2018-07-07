import React, { Component } from 'react';

class Turn extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    const { yourTurn, text } = this.props;

    if (text) return (
      <div className="turn-mainContainer">
        <div className="turn-text turn-textHighlight">{text}</div>
      </div>
    );

    return (
      <div className="turn-mainContainer">
        <div className={"turn-text" + (yourTurn ? " turn-textHighlight" : "")}>Your turn!</div>
        <svg className={"turn-icon" + (yourTurn ? " turn-iconLeft" : "")} width="30" height="30" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
          <path d="M0 0h24v24H0z" fill="none"/>
        </svg>
        <div className={"turn-text" + (!yourTurn ? " turn-textHighlight" : "")}>Opponent is playing...</div>
      </div>
    );
  }
}

export default Turn;
