import React, { Component } from 'react';

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
      buttonsComp.push(<div key={i} style={styles.button}>{disabled ? (
        <button disabled={true}>▼</button>
      ) : (
        <button onClick={e => this.handleClickCol(e, i)} style={styles.clickable}>▼</button>
      )}</div>);
    }

    const gridComp = [];
    for (let i = 0; i < 6; i++) {
      const rowComp = [];
      for (let j = 0; j < 7; j++) {
        rowComp.push(<div key={j} style={styles.cell}>{grid[i][j]}</div>);
      }
      gridComp.push(<div key={i} style={styles.row}>{rowComp}</div>);
    }

    return (
      <div style={styles.grid}>
        <div>{yourTurn ? "Your turn!" : "Opponent is playing..."}</div>
        <div style={styles.buttonsContainer}>{buttonsComp}</div>
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
    fontSize: "35px",
    border: "1px solid black",
    height: "50px",
    width: "50px",
    cursor: "default",
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    border: "1px solid white",
    height: "50px",
    width: "50px",
  },
  clickable: {
    cursor: "pointer",
  },
};

export default ConnectFour;
