import React, { Component } from 'react';

import wsMgr from '../../../js/wsMgr.js';

class PlayerSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.playersSubscription = wsMgr.subscribe("players", msg => {
      console.log(msg);
    });
    wsMgr.sendData({
      request: "startSendPlayers",
    });
  }

  componentWillUnmount() {
    wsMgr.unsubscribe(this.playersSubscription);
    wsMgr.sendData({
      request: "stopSendPlayers",
    });
  }

  handleClick(e) {
    e.preventDefault();
    console.log("oui");
  }

  render() {
    const {title} = this.props;

    return (
      <div style={styles.mainContainer}>
        <div style={styles.subContainer}>
          <div>Chose an opponent to play {title}:</div>
        </div>
      </div>
    );
  }
}

const styles = {
  mainContainer: {
    position: "absolute",
    top: "0px",
    left: "0px",
    bottom: "0px",
    right: "0px",
    backgroundColor: "rgba(0,0,0,.5)",
    cursor: "auto",
  },
  subContainer: {
    margin: "50px",
    backgroundColor: "white",
    border: "1px solid black",
  },
};

export default PlayerSelect;
