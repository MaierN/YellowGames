import React, { Component } from 'react';

import Turn from './Turn.jsx';

import wsMgr from '../../../js/wsMgr.js';

class TicTacToe extends Component {
  constructor(props) {
    super(props);

    this.state = {
      grid: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
      yourTurn: props.initialInfos.yourTurn,
    };

    this.handleClickCell = this.handleClickCell.bind(this);
  }

  componentDidMount() {
    const { grid } = this.state;

    this.gameSubscription = wsMgr.subscribe("gameTicTacToe", msg => {
      const data = msg.data;
      grid[data["row"]][data["col"]] = data["symbol"];
      this.setState({ grid: grid, yourTurn: data.yourTurn });
    });
  }

  componentWillUnmount() {
    wsMgr.unsubscribe("gameTicTacToe", this.gameSubscription);
  }

  handleClickCell(e, i, j) {
    wsMgr.sendData({
      request: "play",
      data: {
        row: i,
        col: j,
      },
    });
  }

  render() {
    const { grid, yourTurn } = this.state;

    const gridComp = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        gridComp.push(
          yourTurn && grid[i][j] === ""
          ? (<rect key={i + "-" + j} x={j * 90} y={i * 90} width="80" height="80" fill="transparent" style={{cursor: "pointer"}} onClick={e => this.handleClickCell(e, i, j)}/>)
          : (<rect key={i + "-" + j} x={j * 90} y={i * 90} width="80" height="80" fill="transparent"/>)
        );

        switch(grid[i][j]) {
          case "o":
          gridComp.push(<circle key={i + "-" + j + "-o"} className="ticTacToe-fadeIn" cx={j*90+40} cy={i*90+40} r="25" strokeWidth="10" fill="transparent"/>);
          break;

          case "x":
          gridComp.push(<line key={i + "-" + j + "-x1"} className="ticTacToe-fadeIn" x1={j*90+15} y1={i*90+15} x2={j*90+65} y2={i*90+65} style={{strokeWidth: "10"}}/>);
          gridComp.push(<line key={i + "-" + j + "-x2"} className="ticTacToe-fadeIn" x2={j*90+15} y1={i*90+15} x1={j*90+65} y2={i*90+65} style={{strokeWidth: "10"}}/>);
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
        <svg style={{marginTop: "25px", width: "100%", maxWidth: "300px"}} viewBox="0 0 260 260">
          <rect x="80" y="0" width="10" height="260" rx="5" ry="5" style={styles.separator}/>
          <rect x="170" y="0" width="10" height="260" rx="5" ry="5" style={styles.separator}/>
          <rect x="0" y="80" width="260" height="10" rx="5" ry="5" style={styles.separator}/>
          <rect x="0" y="170" width="260" height="10" rx="5" ry="5" style={styles.separator}/>
          {gridComp}
        </svg>
      </div>
    );
  }
}

const styles = {
  separator: {
    fill: "rgb(254,185,45)",
  },
};

export default TicTacToe;
