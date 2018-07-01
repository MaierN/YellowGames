import React, { Component } from 'react';

import wsMgr from '../../../js/wsMgr.js';
import colors from '../../../js/colors.js';

class PlayerSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: {},
      waitingAnswer: null,
    };

    this.handleClickBackground = this.handleClickBackground.bind(this);
    this.handleClickPlayer = this.handleClickPlayer.bind(this);
    this.handleClickCancel = this.handleClickCancel.bind(this);
  }

  componentDidMount() {
    this.playersSubscription = wsMgr.subscribe("players", msg => {
      let newPlayers = {...this.state.players};
      switch(msg.request) {
        case 'initialPlayers':
        newPlayers = msg.data;
        break;

        case 'addPlayer':
        newPlayers[msg.data.id] = msg.data;
        break;

        case 'removePlayer':
        delete newPlayers[msg.data.id];
        break;

        default:
        break;
      }
      this.setState({players: newPlayers});
    });

    this.waitMatchSubscription = wsMgr.subscribe("waitMatch", msg => {
      switch(msg.request) {
        case 'startWaiting':
        this.setState({waitingAnswer: msg.data.username});
        break;

        case 'stopWaiting':
        this.setState({waitingAnswer: null});
        break;

        default:
        break;
      }
    });

    wsMgr.sendData({
      request: "startSendPlayers",
    });
  }

  componentWillUnmount() {
    wsMgr.unsubscribe("players", this.playersSubscription);
    wsMgr.unsubscribe("waitMatch", this.waitMatchSubscription);
    wsMgr.sendData({
      request: "stopSendPlayers",
    });
  }

  handleClickBackground(e) {
    e.preventDefault();
    e.stopPropagation();
    const { waitingAnswer } = this.state;
    if (waitingAnswer) {
      wsMgr.sendData({
        request: "cancelAskGame",
      });
    }
    this.props.onClose();
  }

  handleClickPlayer(e, id) {
    const { name } = this.props;

    wsMgr.sendData({
      request: "askGame",
      data: { id, name }
    });
  }

  handleClickCancel(e) {
    wsMgr.sendData({
      request: "cancelAskGame",
    });
  }

  render() {
    const { title } = this.props;
    const { players, waitingAnswer } = this.state;

    const playersList = [];
    for (let id in players) {
      playersList.push(<div key={id} style={{cursor: "pointer", color: colors.getColor(id), fontWeight: "bold"}} onClick={e => this.handleClickPlayer(e, id)}>{players[id].username}</div>);
    }

    return (
      <div style={styles.mainContainer} onClick={this.handleClickBackground}>
        <div style={styles.subContainer} onClick={e => {e.stopPropagation();}}>
          {waitingAnswer ? (
            <div>
              <div>Waiting answer from <span style={{fontWeight: "bold"}}>{waitingAnswer}</span> to play <span style={{fontWeight: "bold"}}>{title}</span>...</div>
              <div><button onClick={this.handleClickCancel}>Annuler</button></div>
            </div>
          ) : (
            <div>
              <div>Chose an opponent to play <span style={{fontWeight: "bold"}}>{title}</span>:</div>
              {playersList.length ? playersList : (
                <div>No available player :(</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  mainContainer: {
    position: "fixed",
    top: "0px",
    left: "0px",
    bottom: "0px",
    right: "0px",
    backgroundColor: "rgba(0,0,0,.5)",
    cursor: "pointer",
  },
  subContainer: {
    margin: "50px",
    backgroundColor: "white",
    border: "1px solid black",
    cursor: "auto",
  },
};

export default PlayerSelect;
