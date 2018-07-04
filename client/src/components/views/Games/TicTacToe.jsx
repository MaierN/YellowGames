import React, { Component } from 'react';

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
      const rowComp = [];
      for (let j = 0; j < 3; j++) {
        rowComp.push(
          yourTurn && grid[i][j] === ""
          ? (<div key={j} style={styles.clickableCell} onClick={e => this.handleClickCell(e, i, j)}>{grid[i][j]}</div>)
          : (<div key={j} style={styles.cell}>{grid[i][j]}</div>)
        );
      }
      gridComp.push(<div key={i} style={styles.row}>{rowComp}</div>);
    }

    return (
      <div style={styles.grid}>
        <div>{yourTurn ? "Your turn!" : "Opponent is playing..."}</div>
        {gridComp}
      </div>
    );
  }
}

const styles = {
  cell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "50px",
    border: "1px solid black",
    height: "80px",
    width: "80px",
    cursor: "default",
  },
  clickableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "50px",
    border: "1px solid black",
    height: "80px",
    width: "80px",
    cursor: "pointer",
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
  },
};

export default TicTacToe;
