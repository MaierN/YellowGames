import React, { Component } from 'react';

import wsMgr from '../../../js/wsMgr.js';
import colors from '../../../js/colors.js';

class PlayerSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      players: {},
      waitingAnswer: null,
      waitingId: null,
    };

    this.handleClickBackground = this.handleClickBackground.bind(this);
    this.handleClickPlayer = this.handleClickPlayer.bind(this);
    this.handleClickCancel = this.handleClickCancel.bind(this);
  }

  componentDidMount() {
    if (!document.body.overflowYCount) document.body.overflowYCount = 0;
    document.body.overflowYCount++;
    document.body.style.overflowY = "hidden";

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
        this.setState({ waitingAnswer: msg.data.username, waitingId: msg.data.id });
        break;

        case 'stopWaiting':
        this.setState({waitingAnswer: null, waitingId: null});
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
    document.body.overflowYCount--;
    if (document.body.overflowYCount === 0) document.body.style.overflowY = "auto";

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
    const { players, waitingAnswer, waitingId } = this.state;

    const playersList = [];
    for (let id in players) {
      playersList.push(<div key={id} className="playerSelect-player" style={{color: colors.getColor(id), borderColor: colors.getColor(id)}} onClick={e => this.handleClickPlayer(e, id)}>{players[id].username}</div>);
    }

    return (
      <div className="playerSelect-mainContainer" onClick={this.handleClickBackground}>
        <div className="playerSelect-subContainer" onClick={e => {e.stopPropagation();}}>
          {waitingAnswer ? (
            <div>
              <div className="playerSelect-choose">Waiting answer from <span className="playerSelect-chooseTitle" style={{color: colors.getColor(waitingId)}}>{waitingAnswer}</span> to play <span className="playerSelect-chooseTitle">{title}</span>...</div>
              <div><button className="playerSelect-cancelButton" onClick={this.handleClickCancel}>Cancel</button></div>
            </div>
          ) : (
            <div>
              <div className="playerSelect-choose">Choose an opponent to play <span className="playerSelect-chooseTitle">{title}</span>:</div>
              <div>
              {playersList.length ? playersList : (
                <div className="playerSelect-noPlayer">No available player <span className="playerSelect-noPlayerSmiley">:(</span></div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default PlayerSelect;
