import React, { Component } from 'react';

import Turn from './Turn.jsx';

import wsMgr from '../../../js/wsMgr.js';

class ConnectFour extends Component {
  constructor(props) {
    super(props);

    this.state = {
      grid: [
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
      ],
      yourTurn: props.initialInfos.yourTurn,
    };

    this.svgGrid = [];
    for (let i = 0; i < 8; i++) {
      this.svgGrid.push(<rect key={"a" + i} x={i * 88} y="0" width="8" height="536" style={styles.separator}/>);
    }
    for (let i = 0; i < 7; i++) {
      this.svgGrid.push(<rect key={"b" + i} x="0" y={i * 88} width="624" height="8" style={styles.separator}/>);
    }

    this.handleClickCol = this.handleClickCol.bind(this);
  }

  componentDidMount() {
    const { grid } = this.state;

    this.gameSubscription = wsMgr.subscribe("gameConnectFour", msg => {
      const data = msg.data;
      grid[data["row"]][data["col"]] = data["symbol"];
      this.setState({ grid: grid, yourTurn: data.yourTurn });
    });
  }

  componentWillUnmount() {
    wsMgr.unsubscribe("gameConnectFour", this.gameSubscription);
  }

  handleClickCol(e, i) {
    wsMgr.sendData({
      request: "play",
      data: {
        col: i,
      },
    });
  }

  render() {
    const { grid, yourTurn } = this.state;

    const buttonsComp = [];
    for (let i = 0; i < 7; i++) {
      const disabled = !yourTurn || grid[0][i] !== "";

      buttonsComp.push(
        !disabled
        ? (
          <g key={i} className="connectFour-button connectFour-buttonClickable" style={{cursor: "pointer"}} onClick={e => this.handleClickCol(e, i)}>
            <rect key={i} x={i * 88 + 8} y="0" width="80" height="100%" fill="transparent"/>
            <line x1={i*88+28} y1={20} x2={i*88+48} y2={40} strokeLinecap="round" stroke="#555555" style={{strokeWidth: "10"}}/>
            <line x1={i*88+68} y1={20} x2={i*88+48} y2={40} strokeLinecap="round" stroke="#555555" style={{strokeWidth: "10"}}/>
          </g>
        )
        : (
          <g key={i} className="connectFour-button">
            <rect key={i} x={i * 88 + 8} y="0" width="80" height="100%" fill="transparent"/>
            <line x1={i*88+28} y1={20} x2={i*88+48} y2={40} strokeLinecap="round" stroke="#999999" style={{strokeWidth: "10"}}/>
            <line x1={i*88+68} y1={20} x2={i*88+48} y2={40} strokeLinecap="round" stroke="#999999" style={{strokeWidth: "10"}}/>
          </g>
        )
      );
    }

    const gridComp = [];
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        switch(grid[i][j]) {
          case "o":
          gridComp.push(<circle key={i + "-" + j + "-o"} className="ticTacToe-fadeIn" cx={j*88+48} cy={i*88+48} r="25" strokeWidth="10" fill="transparent"/>);
          break;

          case "x":
          gridComp.push(<line key={i + "-" + j + "-x1"} className="ticTacToe-fadeIn" x1={j*88+23} y1={i*88+23} x2={j*88+73} y2={i*88+73} style={{strokeWidth: "10"}}/>);
          gridComp.push(<line key={i + "-" + j + "-x2"} className="ticTacToe-fadeIn" x2={j*88+23} y1={i*88+23} x1={j*88+73} y2={i*88+73} style={{strokeWidth: "10"}}/>);
          break;

          default: break;
        }
      }
    }

    return (
      <div>
        <div>
          <Turn yourTurn={yourTurn}></Turn>
        </div>
        <svg style={{marginTop: "25px", width: "100%", maxWidth: "400px", display: "block", marginLeft: "auto", marginRight: "auto"}} viewBox="0 0 624 60">
          {buttonsComp}
        </svg>
        <svg style={{width: "100%", maxWidth: "400px", display: "block", marginLeft: "auto", marginRight: "auto"}} viewBox="0 0 624 536">
          {this.svgGrid}
          {gridComp}
        </svg>
      </div>
    );
  }
}

const styles = {
  separator: {
    fill: "rgb(254,185,45)",
    rx: "4",
    ry: "4",
  },
};

export default ConnectFour;
